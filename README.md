# PostPipe 2.0 🧪

Welcome to the development and testing ground for PostPipe 2.0.

**[📚 Full Documentation is available here](./documentation/README.md)**

## What is this?

This repository contains:

1.  **Apps**: The SaaS Dashboard and "Dynamic Lab" simulation (`apps/web`).
2.  **CLI**: The suite of tools for scaffolding Auth, Connectors, and more (`cli/`).
3.  **Packages**: Shared UI components (`packages/ui`).

## 🚀 Quick Start (Connector Demo)

We have a fully simulated environment to test the **Zero Trust Connector** flow (`Browser -> PostPipe SaaS -> User Connector -> DB`).

### Prerequisites

- Node.js 18+
- MongoDB / Postgres (Local or Cloud)

### Step 1: Start the SaaS Simulation

Run the "Dynamic Lab" (Next.js App) which hosts the Dashboard.

```bash
npm run dev:lab
# Runs on http://localhost:3000
```

### Step 2: Create & Run a Connector

In a **new terminal**, generate and run a secure connector.

```bash
# 1. Generate Connector
node cli/create-postpipe-connector/dist/index.js my-test-connector

# 2. Install & Configure
cd my-test-connector
npm install
```

**CRITICAL**: Open `.env` in `my-test-connector` and set `PORT=3001` (to avoid conflict with the Lab).

```bash
# 3. Start Connector
npm run dev
```

### Step 3: Test the Flow

1.  Open [http://localhost:3000/connector-demo](http://localhost:3000/connector-demo).
2.  Enter your Connector URL: `http://localhost:3001/postpipe/ingest`
3.  Click **Generate Credentials** and add them to your connector's `.env`.
4.  Restart connector, then Submit the form on the Demo Page!

---

## 📂 Documentation

- [**Getting Started Guide**](./documentation/getting-started.md)
- [**CLI Tools Reference**](./documentation/cli/index.md)
- [**Architecture Overview**](./documentation/architecture.md)

For deep dives, please check the [documentation](./documentation/README.md) folder.

## 🐛 Troubleshooting

**"Connection Refused"**

- Ensure your Connector is running on a _different_ port (3001) than the Lab (3000).

**"Invalid Signature"**

- Ensure the `SECRET` in the Demo Page matches the `POSTPIPE_CONNECTOR_SECRET` in your `.env`.
