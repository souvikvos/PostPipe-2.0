# Create PostPipe User

CLI to scaffold the PostPipe User Model (Mongoose) and DB Connector.

## Features

- **⚡ Instant Model**: Scaffolds a complete Mongoose User Schema.
- **🔌 MongoDB Connector**: Includes optimized database connection logic.
- **🛡️ Type Safety**: Exports TypeScript interfaces for the User model.

## Usage

Run this command in your Next.js project root:

```bash
npx create-postpipe-user
```

## What it does

1.  Installs `mongoose`.
2.  Creates `src/lib/models/User.ts` with schema validation.
3.  Creates `src/lib/dbConnect.ts` for efficient connection caching.

## Credits

Created by **Sourodip Roy**.

## License

CC-BY-NC-SA-4.0
