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
    .version('1.0.7')
    .description('Scaffold a Complete Production-Ready Ecommerce Backend for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.hex('#FF5733')('\n🚀  PostPipe Master Ecommerce CLI v1.0.7  🚀\n'));
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
            choices: [
                { name: 'MongoDB (Mongoose)', value: 'mongodb' },
                { name: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' }
            ],
            default: 'mongodb'
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

    // Determine Target Path
    let targetPath;
    if (answers.installLocation === 'root') {
        targetPath = CURR_DIR;
        if (answers.projectName !== '.') console.log(chalk.yellow(`Warning: Scaffolding in current directory. Project name '${answers.projectName}' will be used for package.json only.`));
    } else {
        targetPath = path.join(CURR_DIR, answers.projectName);
        if (fs.existsSync(targetPath)) {
            console.log(chalk.red(`Directory ${answers.projectName} already exists.`));
            console.log(chalk.yellow('Please delete the folder or choose a different name.'));
            return;
        }
        await fs.ensureDir(targetPath);
    }

    if (answers.database === 'mongodb') {
        await setupMongoDB(targetPath, answers);
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB(targetPath, answers);
    }
}

async function setupMongoDB(targetPath, answers) {
    const spinner = ora('Initializing PostPipe Ecommerce System (MongoDB)...').start();

    try {
        const useSrc = fs.existsSync(path.join(targetPath, 'src'));
        const baseDir = useSrc ? path.join(targetPath, 'src') : targetPath;

        const templateDir = path.join(__dirname, 'mongodb', 'template');

        // 0. Check if template exists
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found at ${templateDir}`);
        }

        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';
        const deps = 'mongoose razorpay shortid cloudinary resend bcryptjs jsonwebtoken jose axios';

        if (!fs.existsSync(path.join(targetPath, 'package.json'))) {
            execSync(`npm init -y`, { cwd: targetPath, stdio: 'ignore' });
        }

        // Update package name
        const pkgPath = path.join(targetPath, 'package.json');
        const pkg = await fs.readJson(pkgPath);
        pkg.name = answers.projectName;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });

        execSync(`npm install ${deps}`, { cwd: targetPath, stdio: 'ignore' });

        // 2. Scaffold Unified Models
        spinner.text = 'Creating Unified Schema (Models)...';
        const modelsDir = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDir);
        // Copy from template/models
        if (fs.existsSync(path.join(templateDir, 'models'))) {
            await fs.copy(path.join(templateDir, 'models'), modelsDir);
        }

        // 3. Scaffold Unified API
        spinner.text = 'Creating Integrated API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api');
        await fs.ensureDir(apiDir);
        if (fs.existsSync(path.join(templateDir, 'app', 'api'))) {
            await fs.copy(path.join(templateDir, 'app', 'api'), apiDir);
        } else if (fs.existsSync(path.join(templateDir, 'api'))) {
            // Handle case where it might be structured differently
            await fs.copy(path.join(templateDir, 'api'), apiDir);
        }

        // 4. Scaffold Libs (Auth, Email, Utils)
        spinner.text = 'Creating Libraries & Utilities...';
        const libDir = path.join(baseDir, 'lib');
        await fs.ensureDir(libDir);
        if (fs.existsSync(path.join(templateDir, 'lib'))) {
            await fs.copy(path.join(templateDir, 'lib'), libDir);
        }

        // Copy app bucket if exists (e.g. demo pages)
        if (fs.existsSync(path.join(templateDir, 'app'))) {
            const appDest = path.join(baseDir, 'app');
            await fs.copy(path.join(templateDir, 'app'), appDest, { overwrite: true, filter: (src) => !src.includes('api') }); // Avoid re-copying api if already done, or just merge
        }

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
        // Load from template or generate fresh
        const promptParams = { projectName: answers.projectName };
        // We can keep the prompt generation dynamic or read from file. 
        // For now, let's write the dynamic one we had.
        await generateAiInstructions(targetPath);

        spinner.succeed(chalk.green('🚀 Master Ecommerce Backend & Toolkit Ready (MongoDB)!'));
        printNextSteps(answers);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

async function setupDocumentDB(targetPath, answers) {
    const spinner = ora('Initializing PostPipe Ecommerce System (DocumentDB)...').start();

    // Simulate check for templates
    const templateDir = path.join(__dirname, 'documentdb', 'template');

    if (!fs.existsSync(templateDir) || fs.readdirSync(templateDir).length === 0) {
        spinner.warn(chalk.yellow('DocumentDB templates are coming soon! Scaffolded an empty structure.'));
        // Create basic structure
        await fs.ensureDir(path.join(targetPath, 'lib'));
        console.log(chalk.gray('Please check back for updates or use MongoDB for now.'));
        return;
    }

    // Logic for DocumentDB would go here (similar to MongoDB but different files)
    spinner.succeed(chalk.green('DocumentDB Setup Complete (Placeholder)'));
}

async function generateAiInstructions(targetPath) {
    const promptContent = `# 🚀 PostPipe Ecommerce Agent Instructions

You are an expert AI software engineer. Your task is to build the frontend and complete the integration for this standard PostPipe Ecommerce backend.

## 🛠 Project Setup
1. **Environment**: The \`.env\` file is already generated. **Read it** to understand the available services.
2. **Backend**: The backend API, Models, and Libs are ALREADY implemented. **DO NOT DELETE OR OVERWRITE THEM**.

## 📋 Requirements
1. **Frontend Architecture**: Build a modern, responsive Next.js frontend (App Router).
2. **Auth Pages**: Login and Signup pages connected to the backend.
3. **Admin Dashboard**: Generate a dashboard at \`/admin\`.
4. **Shop Features**: Product Listing, Details, Cart, Checkout.

## ⚠️ Important Rules
- **Work in the ROOT** of this project.
- **WOW Factor**: The UI must be visually stunning.

Good luck!
`;
    await fs.writeFile(path.join(targetPath, 'INSTRUCTIONS_FOR_AI.md'), promptContent);
}

function printNextSteps(answers) {
    console.log(chalk.yellow('\nNext Steps:'));
    if (answers.installLocation === 'new') {
        console.log(`1. cd ${answers.projectName}`);
    } else {
        console.log(`1. You are already in the root.`);
    }
    console.log(`2. Open '.env' and fill in your API keys.`);
    console.log(`3. Copy the content of 'INSTRUCTIONS_FOR_AI.md' and give it to your AI Agent.`);
    console.log(`4. Watch it build your production-grade store!`);
}

main();
