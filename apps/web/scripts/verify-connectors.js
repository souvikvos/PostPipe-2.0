const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000/api/v1/connectors';
const CONNECTOR_ID = 'conn_7oyz65f78';
const DB_NAME = 'MONGODB_URI_SECONDARY';
const FORM_ID = 'soheli'; // Example form ID from user request
const TOKEN = 'Bearer postpipe_demo_token';

async function testApi() {
    const url = `${BASE_URL}/${CONNECTOR_ID}/databases/${DB_NAME}/forms/${FORM_ID}/submissions`;
    console.log(`\nTesting Public API Endpoint:`);
    console.log(`GET ${url}`);

    try {
        const start = Date.now();
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': TOKEN
            }
        });
        const duration = Date.now() - start;

        console.log(`\nResponse Status: ${res.status} ${res.statusText}`);

        const body = await res.json();
        console.log(`Response Body:`);
        console.dir(body, { depth: null, colors: true });

        console.log(`\nRequest Duration: ${duration}ms`);

        if (res.ok) {
            console.log("\n✅ SUCCESS: API returned valid response.");
        } else {
            console.log("\n❌ FAILED: API returned error.");
        }

    } catch (err) {
        console.error("\n❌ ERROR: Request failed via fetch.", err.message);
        if (err.cause) console.error(err.cause);
        console.log("Ensure both apps/web (port 3000) and my-connector (port 3002) are running.");
    }
}

testApi();
