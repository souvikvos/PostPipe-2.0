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
    constructor() {
        this.store = [];
    }
    async connect() {
        console.log("[MemoryAdapter] Connected (Data will be lost on restart)");
    }
    async insert(submission) {
        console.log('[MemoryAdapter] Inserted:', submission);
        this.store.push(submission);
    }
    async query(formId, options) {
        const results = this.store
            .filter(s => s.formId === formId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const limit = options?.limit || 50;
        return results.slice(0, limit);
    }
}
