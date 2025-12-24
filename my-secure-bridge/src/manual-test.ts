import crypto from 'crypto';

// Config
const SECRET = process.env.POSTPIPE_CONNECTOR_SECRET || "replaceme";
const PORT = process.env.PORT || 3001;
const FORM_ID = "contact-us";

async function runTest() {
  console.log("🧪 Starting Manual Verification for Getter API...");

  // 1. Generate Token
  const payload = {
    formId: FORM_ID,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadB64)
    .digest('hex');
    
  const token = `pp_read_${payloadB64}.${signature}`;
  console.log(`🔑 Generated Token: ${token}`);

  // 2. Make Request
  const url = `http://localhost:${PORT}/api/postpipe/forms/${FORM_ID}/submissions?limit=10`;
  console.log(`📡 Fetching: ${url}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const status = res.status;
    const data = await res.json();
    
    console.log(`\nRESPONSE [${status}]`);
    console.dir(data, { depth: null });
    
    if (status === 200) {
      console.log("\n✅ SUCCESS: API returned 200 OK");
      if (Array.isArray(data.data)) {
         console.log(`📚 Received ${data.data.length} submissions`);
      } else {
         console.error("❌ ERROR: Data is not an array");
      }
    } else {
      console.error("❌ FAILED: Unexpected status code");
    }

  } catch (err) {
    console.error("❌ FAILED: Network error", err);
  }
}

// Run (assumes server is running)
runTest();
