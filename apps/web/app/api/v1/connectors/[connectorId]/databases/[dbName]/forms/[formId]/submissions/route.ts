import { NextRequest, NextResponse } from 'next/server';

// --- Types ---
interface ConnectorRegistryItem {
    id: string;
    url: string;
    secret: string;
    ownerId: string;
}

// --- Mock Registry ---
// in a real app, this would be a database lookup
const MOCK_REGISTRY: Record<string, ConnectorRegistryItem> = {
    // The 'default' connector in the user's workspace
    'conn_7oyz65f78': {
        id: 'conn_7oyz65f78',
        url: 'http://localhost:3002', // Assuming local connector
        secret: 'sk_live_u1lvz21x72gy6wnmma2p', // Matches .env of my-connector
        ownerId: 'user_123' // Mock User
    }
};

// --- Mock Token Validation ---
// In a real app, verify JWT or DB session
async function validateToken(token: string): Promise<{ userId: string } | null> {
    // SIMPLE MOCK: Accept any token that starts with "valid_"
    // OR just for this demo, accept a hardcoded known token
    if (token === "Bearer postpipe_demo_token") {
        return { userId: "user_123" };
    }
    return null;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { connectorId: string; dbName: string; formId: string } }
) {
    try {
        const { connectorId, dbName, formId } = params;

        // 1. Validate Auth
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: "Missing Authorization Header" }, { status: 401 });
        }

        const user = await validateToken(authHeader);
        if (!user) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
        }

        // 2. Lookup Connector
        const connector = MOCK_REGISTRY[connectorId];
        if (!connector) {
            return NextResponse.json({ error: "Connector Not Found" }, { status: 404 });
        }

        // 3. Authorization Check (User owns Connector)
        if (connector.ownerId !== user.userId) {
            return NextResponse.json({ error: "Unauthorized Access to Connector" }, { status: 403 });
        }

        // 4. Proxy to Connector
        // We construct the URL to the Connector's API
        // The connector endpoint we updated is:
        // GET /api/postpipe/forms/:formId/submissions?limit=...&databaseConfig=...

        // Construct databaseConfig object
        // The user wants to query a specific DB route by NAME (e.g. MONGODB_URI_SECONDARY)
        // The Connector expects `databaseConfig: { uri: "ENV_VAR_NAME", dbName: "optional" }`

        // We need to map `dbName` (from URL) to the Env Var name expected by Connector?
        // User request says: "One connector may route to multiple databases using configuration like... dbName: 'MONGODB_URI_THIRD'"
        // So `dbName` IN THE URL effectively IS the Env Var Name (or the key).

        const targetDbConfig = {
            uri: dbName, // e.g. MONGODB_URI_SECONDARY
            // dbName: "optional_override" // We can leave this undefined to let connector use default or derived
        };

        const connectorUrl = new URL(`/api/postpipe/forms/${formId}/submissions`, connector.url);
        connectorUrl.searchParams.set('limit', '50'); // Default limit
        connectorUrl.searchParams.set('databaseConfig', JSON.stringify(targetDbConfig));

        console.log(`[Proxy] Forwarding to: ${connectorUrl.toString()}`);

        const response = await fetch(connectorUrl.toString(), {
            method: 'GET',
            headers: {
                // Authenticate with the Connector using its Secret
                'Authorization': `Bearer ${connector.secret}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: "Connector Request Failed", details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[API Proxy Error]", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
