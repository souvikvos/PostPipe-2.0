import express, { Request, Response } from 'express';
import { verifySignature, validateTimestamp, validatePayloadIds } from './lib/security';
import { PostPipeIngestPayload } from './types';
import { getAdapter } from './lib/db'; // We will implement this next
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// IMPORTANT: We need the raw body for signature verification
app.use(express.json({
  verify: (req: any, res, buf) => {
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
app.post('/postpipe/ingest', async (req: Request, res: Response) => {
  try {
    const payload = req.body as PostPipeIngestPayload;
    // @ts-ignore
    const rawBody = req.rawBody; 
    
    if (!rawBody) {
       console.error("❌ Error: Raw Body missing. Ensure middleware is configured.");
       return res.status(400).json({ status: 'error', message: 'Payload missing' });
    }

    const signature = req.headers['x-postpipe-signature'] as string;
    
    // 1. Verify Structure
    if (!validatePayloadIds(payload)) {
      return res.status(400).json({ status: 'error', message: 'Invalid Payload Structure' });
    }

    // 2. Verify Timestamp (Replay Protection)
    if (!validateTimestamp(payload.timestamp)) {
      console.warn(`[Security] Timestamp skew detected: ${payload.timestamp}`);
      return res.status(401).json({ status: 'error', message: 'Request Expired' });
    }

    // 3. Verify Signature
    if (!signature && payload.signature) {
       // Fallback for body-based signature (canonicalization issues risk)
       // We'll warn about it.
    }

    const isValid = verifySignature(rawBody, signature, CONNECTOR_SECRET);
    if (!isValid) {
      console.warn(`[Security] Invalid Signature from IP: ${req.ip}`);
      return res.status(401).json({ status: 'error', message: 'Invalid Signature' });
    }

    // 4. Persistence
    console.log("[Server] Getting adapter...");
    const adapter = getAdapter();
    console.log("[Server] Connecting to DB...");
    await adapter.connect();
    console.log("[Server] Inserting payload...");
    await adapter.insert(payload);
    
    // Return Success
    console.log("[Server] Success!");
    return res.status(200).json({ status: 'ok', stored: true });

  } catch (error) {
    console.error("Connector Error Stack:", error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error', details: String(error) });
  }
});

// @ts-ignore
app.get('/api/postpipe/forms/:formId/submissions', async (req: Request, res: Response) => {
    try {
        const { formId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        
        console.log(`[Server] Querying submissions for form: ${formId}`);
        
        const adapter = getAdapter();
        // Ensure strictly connected/reconnected if needed
        await adapter.connect(); 
        
        const data = await adapter.query(formId, limit);
        return res.json({ status: 'ok', data });
    } catch (e) {
        console.error("Query Error:", e);
        return res.status(500).json({ status: 'error', message: String(e) });
    }
});

app.listen(PORT, () => {
  console.log(`🔒 PostPipe Connector listening on port ${PORT}`);
  console.log(`📝 Mode: ${process.env.DB_TYPE || 'InMemory'}`);
});
