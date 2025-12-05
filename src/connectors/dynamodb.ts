import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Check if we have credentials, otherwise the client might pick up from local config
// For the lab, we assume env vars are set if using DynamoDB.

const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: (ACCESS_KEY_ID && SECRET_ACCESS_KEY) ? {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    } : undefined
});

const docClient = DynamoDBDocumentClient.from(client);

export { client, docClient };
