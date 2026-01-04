"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdapter = getAdapter;
const mongodb_1 = require("./mongodb");
function getAdapter() {
    const type = process.env.DB_TYPE?.toLowerCase();
    switch (type) {
        case 'mongodb':
            return new mongodb_1.MongoAdapter();
        default:
            console.warn(`[Config] No valid DB_TYPE set (got '${type}'). Defaulting to Memory (Dry Run).`);
            return new MemoryAdapter();
    }
}
class MemoryAdapter {
    async connect() {
        console.log("[MemoryAdapter] Connected (Data will be lost on restart)");
    }
    async insert(submission) {
        console.log('[MemoryAdapter] Inserted:', submission);
    }
    async query(formId, limit) {
        return [];
    }
}
