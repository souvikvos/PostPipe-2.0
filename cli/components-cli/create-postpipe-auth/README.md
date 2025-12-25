# Create PostPipe Auth

![PostPipe Banner](https://img.shields.io/npm/v/create-postpipe-auth)

A powerful CLI tool to scaffold production-ready authentication for Next.js applications, powered by **PostPipe**.

## Features

- **⚡ Instant Setup**: One command to install everything.
- **🔒 Secure**: Bcrypt hashing, JWT sessions (HTTP-only cookies), Zod validation.
- **📧 Email Ready**: Built-in Resend integration for verification and password resets.
- **💾 Database Support**: MongoDB (Mongoose) support out of the box.
- **⚛️ Next.js 15 Compatible**: React 19 Actions & Async Cookies support.

## Usage

Run this command in your Next.js project root:

```bash
npx create-postpipe-auth
```

Follow the interactive prompts to install MongoDB authentication.

## What it does

1.  Determines your project structure (`src/` vs root).
2.  Creates `src/lib/auth` with robust auth actions and utilities.
3.  Installs necessary dependencies (`mongoose`, `jsonwebtoken`, `zod`, etc.).
4.  Configures your `.env` file.
5.  Provides ready-to-use Frontend Templates for Login/Signup.

## Links

- **GitHub Repository**: [https://github.com/Sourodip-1/PostPipe-2.0](https://github.com/Sourodip-1/PostPipe-2.0)

## Credits

Created by **Sourodip Roy**.

## License

CC-BY-NC-SA-4.0
