#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const { execSync } = require('child_process');

const program = new Command();

program
    .version('1.0.6')
    .description('Scaffold a Complete Production-Ready Ecommerce Backend for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.hex('#FF5733')('\n🚀  PostPipe Master Ecommerce CLI v1.0.6  🚀\n'));
    console.log(chalk.dim('Now with Secure Auth, Resend Logic, Admin Dashboard Prep, and Smart Scaffolding!\n'));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Project name:',
            default: 'my-ecommerce-store'
        },
        {
            type: 'list',
            name: 'installLocation',
            message: 'Where should we scaffold the project?',
            choices: [
                { name: 'Create a new folder (Standard)', value: 'new' },
                { name: 'Current directory (Root)', value: 'root' }
            ],
            default: 'new'
        },
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma) - Coming Soon'],
            default: 'MongoDB (Mongoose)'
        },
        {
            type: 'checkbox',
            name: 'modules',
            message: 'Select modules to include:',
            choices: [
                { name: 'Authentication (Users w/ Resend)', value: 'auth', checked: true },
                { name: 'Shop Core (Products, Cart, Orders)', value: 'shop', checked: true },
                { name: 'Payments (Razorpay)', value: 'payment', checked: true },
                { name: 'Delivery (Shipment Tracking)', value: 'delivery', checked: true },
                { name: 'Admin Dashboard API', value: 'admin', checked: true },
                { name: 'Notifications (Email/DB)', value: 'notify', checked: true },
                { name: 'File Upload (Cloudinary)', value: 'upload', checked: true },
                { name: 'Analytics', value: 'analytics', checked: true },
            ]
        }
    ]);

    if (answers.database !== 'MongoDB (Mongoose)') {
        console.log(chalk.red('Only MongoDB is currently supported in this version.'));
        return;
    }

    // Determine Target Path
    let targetPath;
    if (answers.installLocation === 'root') {
        targetPath = CURR_DIR;
        if (answers.projectName !== '.') console.log(chalk.yellow(`Warning: Scaffolding in current directory. Project name '${answers.projectName}' will be used for package.json only.`));
    } else {
        targetPath = path.join(CURR_DIR, answers.projectName);
        if (fs.existsSync(targetPath)) {
            console.log(chalk.red(`Directory ${answers.projectName} already exists.`));
            // Simple exit to be safe, could add overwrite prompt later
            console.log(chalk.yellow('Please delete the folder or choose a different name.'));
            return;
        }
        await fs.ensureDir(targetPath);
    }

    const spinner = ora('Initializing PostPipe Ecommerce System...').start();

    try {
        // Assumption: We are building a Next.js App Router structure.
        // We will scaffold: /app/api, /models, /lib at the ROOT of the targetPath (or inside src if it exists, but typically we enforce root for clarity if user chose root)

        // Check if 'src' exists to decide on structure, but generally stick to root for clearer generated "next app" feel if empty.
        // However, if targetPath has src, use it.
        const useSrc = fs.existsSync(path.join(targetPath, 'src'));
        const baseDir = useSrc ? path.join(targetPath, 'src') : targetPath;

        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';
        const deps = 'mongoose razorpay shortid cloudinary resend bcryptjs jsonwebtoken jose axios';
        // In a real CLI, we might check if package.json exists. If not, init it.
        if (!fs.existsSync(path.join(targetPath, 'package.json'))) {
            execSync(`npm init -y`, { cwd: targetPath, stdio: 'ignore' });
        }

        // Update package name if valid
        const pkgPath = path.join(targetPath, 'package.json');
        const pkg = await fs.readJson(pkgPath);
        pkg.name = answers.projectName;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });

        execSync(`npm install ${deps}`, { cwd: targetPath, stdio: 'ignore' });

        // 2. Scaffold Unified Models
        spinner.text = 'Creating Unified Schema (Models)...';
        const modelsDir = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDir);
        await fs.copy(path.join(__dirname, 'models'), modelsDir);

        // 3. Scaffold Unified API
        spinner.text = 'Creating Integrated API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api');
        await fs.ensureDir(apiDir);
        await fs.copy(path.join(__dirname, 'api'), apiDir);

        // 4. Scaffold Libs (Auth, Email, Utils)
        spinner.text = 'Creating Libraries & Utilities...';
        const libDir = path.join(baseDir, 'lib');
        await fs.ensureDir(libDir);
        await fs.copy(path.join(__dirname, 'lib'), libDir);

        // 5. Generate .env File
        spinner.text = 'Generating .env file...';
        const envContent = `
# Database
MONGODB_URI=mongodb://localhost:27017/${answers.projectName}

# Authentication
NEXTAUTH_SECRET=your_super_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payments (Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=re_123456789
`;
        await fs.writeFile(path.join(targetPath, '.env'), envContent.trim());

        // 6. Generate AI Prompt File
        spinner.text = 'Crafting Agent Instructions...';
        const promptContent = `# 🚀 PostPipe Ecommerce Agent Instructions

You are an expert AI software engineer. Your task is to build the frontend and complete the integration for this standard PostPipe Ecommerce backend.

## 🛠 Project Setup
1. **Environment**: The \`.env\` file is already generated. **Read it** to understand the available services (MongoDB, Resend, Cloudinary, Razorpay).
2. **Backend**: The backend API (\`api/...\`), Models (\`models/...\`), and Libs (\`lib/...\`) are ALREADY implemented. **DO NOT DELETE OR OVERWRITE THEM** unless strictly necessary for bug fixes.
3. **Critical**: Preserve the logic in \`api/auth/signup/route.ts\` (specifically the Resend email integration). The signup flow now includes **Email Verification**.
4. **Verification**: The backend handles the verification link at \`api/auth/verify-email\`. success redirects to \`/auth/login?verified=true\`.


## 📋 Requirements
1. **Frontend Architecture**: Build a modern, responsive Next.js frontend (App Router) in this same directory.
2. **Auth Pages**: Create attractive Login and Signup pages. Connect them to \`api/auth/login\` and \`api/auth/signup\`.
   - **Signup**: Display a message to check email after successful signup.
   - **Login**: Check for \`?verified=true\` query param and show a "Verification Successful" toast/alert.
3. **Admin Dashboard**: Generate a **comprehensive Admin Dashboard** at \`/admin\`.
   - Fetch data from \`api/admin/...\` (implied, create if needed).
   - Features: Product Management (CRUD), Order Status Updates, User Overview.
4. **Shop Features**:
   - Product Listing (Grid with filters).
   - Product Details.
   - Cart (Client-side + Sync).
   - Checkout (Integrate Razorpay/Stripe).

## ⚠️ Important Rules
- **DO NOT** remove the \`lib/email.ts\` or the Resend logic in \`api/auth/signup\`.
- **Work in the ROOT** of this project. Do not create sub-directories for the app code.
- **WOW Factor**: The UI must be visually stunning (Dark mode, animations, Glassmorphism).

Good luck!
`;
        await fs.writeFile(path.join(targetPath, 'INSTRUCTIONS_FOR_AI.md'), promptContent);


        spinner.succeed(chalk.green('🚀 Master Ecommerce Backend & Toolkit Ready!'));

        console.log(chalk.yellow('\nNext Steps:'));
        if (answers.installLocation === 'new') {
            console.log(`1. cd ${answers.projectName}`);
        } else {
            console.log(`1. You are already in the root.`);
        }
        console.log(`2. Open '.env' and fill in your API keys.`);
        console.log(`3. Copy the content of 'INSTRUCTIONS_FOR_AI.md' and give it to your AI Agent.`);
        console.log(`4. Watch it build your production-grade store!`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
