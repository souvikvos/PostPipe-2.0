# Create PostPipe Form

CLI to scaffold robust Form Submission APIs for Next.js applications, powered by **PostPipe**.

## Features

- **👉 Interactive Selection**: Choose from Contact, Feedback, or Newsletter forms.
- **⚡ Instant Setup**: One command to scaffold API routes and Models.
- **🔒 Secure**: Built-in Zod validation.
- **💾 Database Integration**: Ready-to-use MongoDB/Mongoose models.
- **⚛️ Next.js 15 Ready**: Supports App Router and Server Actions.

## Usage

Run this command in your Next.js project root:

```bash
npx create-postpipe-form
```

You will be prompted to select which forms you want to generate:

- **Contact Form**: Standard contact form with name, email, subject, message.
- **Feedback Form**: Feedback collection with rating (1-5), category, and message.
- **Newsletter**: Email subscription model.

## What it does

1.  Scaffolds API routes in `app/api/{contact,feedback,newsletter}`.
2.  Creates Mongoose models in `lib/models`.
3.  Installs required dependencies (`zod`, `mongoose`).

## Links

- **GitHub Repository**: [https://github.com/Sourodip-1/PostPipe-2.0](https://github.com/Sourodip-1/PostPipe-2.0)

## Credits

Created by **Sourodip Roy**.

## License

CC-BY-NC-SA-4.0
