"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const security_1 = require("./lib/security");
const db_1 = require("./lib/db"); // We will implement this next
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Enable CORS for all routes
app.use((0, cors_1.default)());
// IMPORTANT: We need the raw body for signature verification
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
const CONNECTOR_ID = process.env.POSTPIPE_CONNECTOR_ID;
const CONNECTOR_SECRET = process.env.POSTPIPE_CONNECTOR_SECRET;
if (!CONNECTOR_ID || !CONNECTOR_SECRET) {
    console.error("❌ CRTICAL ERROR: POSTPIPE_CONNECTOR_ID or POSTPIPE_CONNECTOR_SECRET is missing.");
    process.exit(1);
}
// @ts-ignore
app.post('/postpipe/ingest', async (req, res) => {
    try {
        const payload = req.body;
        // @ts-ignore
        const rawBody = req.rawBody;
        if (!rawBody) {
            console.error("❌ Error: Raw Body missing. Ensure middleware is configured.");
            return res.status(400).json({ status: 'error', message: 'Payload missing' });
        }
        const signature = req.headers['x-postpipe-signature'];
        // 1. Verify Structure
        if (!(0, security_1.validatePayloadIds)(payload)) {
            return res.status(400).json({ status: 'error', message: 'Invalid Payload Structure' });
        }
        // 2. Verify Timestamp (Replay Protection)
        if (!(0, security_1.validateTimestamp)(payload.timestamp)) {
            console.warn(`[Security] Timestamp skew detected: ${payload.timestamp}`);
            return res.status(401).json({ status: 'error', message: 'Request Expired' });
        }
        // 3. Verify Signature
        if (!signature && payload.signature) {
            // Fallback for body-based signature (canonicalization issues risk)
            // We'll warn about it.
        }
        const isValid = (0, security_1.verifySignature)(rawBody, signature, CONNECTOR_SECRET);
        if (!isValid) {
            console.warn(`[Security] Invalid Signature from IP: ${req.ip}`);
            return res.status(401).json({ status: 'error', message: 'Invalid Signature' });
        }
        // 4. Persistence
        console.log("[Server] Getting adapter...");
        const adapter = (0, db_1.getAdapter)();
        console.log("[Server] Connecting to DB...");
        await adapter.connect();
        console.log("[Server] Inserting payload...");
        await adapter.insert(payload);
        // Return Success
        console.log("[Server] Success!");
        return res.status(200).json({ status: 'ok', stored: true });
    }
    catch (error) {
        console.error("Connector Error Stack:", error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error', details: String(error) });
    }
});
// @ts-ignore
app.get('/api/postpipe/forms/:formId/submissions', async (req, res) => {
    try {
        const { formId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        console.log(`[Server] Querying submissions for form: ${formId}`);
        const adapter = (0, db_1.getAdapter)();
        // Ensure strictly connected/reconnected if needed
        await adapter.connect();
        const data = await adapter.query(formId, limit);
        return res.json({ status: 'ok', data });
    }
    catch (e) {
        console.error("Query Error:", e);
        return res.status(500).json({ status: 'error', message: String(e) });
    }
});
app.listen(PORT, () => {
    console.log(`🔒 PostPipe Connector listening on port ${PORT}`);
    console.log(`📝 Mode: ${process.env.DB_TYPE || 'InMemory'}`);
});
