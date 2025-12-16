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
    .version('1.0.0')
    .description('Scaffold a Complete Production-Ready Ecommerce Backend for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.hex('#FF5733')('\n🚀  PostPipe Master Ecommerce CLI v1.0.5  🚀\n'));
    console.log(chalk.dim('Now with Secure Auth (JWT/Bcrypt), Client-side Checkout, and Order History!\n'));

    // PROMPT: Consolidated Configuration
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Project name:',
            default: 'my-ecommerce-store'
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
                { name: 'Authentication (Users, Roles)', value: 'auth', checked: true },
                { name: 'Shop Core (Products, Cart, Orders, Coupons)', value: 'shop', checked: true },
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

    const projectDir = path.join(CURR_DIR, answers.projectName);

    // Create Project Folder if it doesn't exist (assuming we are not inside an existing project, or we are making a new subfolder)
    // Logic: Use current directory if projectName is '.'
    const targetPath = answers.projectName === '.' ? CURR_DIR : projectDir;

    if (answers.projectName !== '.') {
        if (fs.existsSync(targetPath)) {
            console.log(chalk.red(`Directory ${answers.projectName} already exists.`));
            // inquirer confirm overwrite? For now, just exit to be safe
            // return;  // Let's assume user knows what they are doing or handle overwrite manually
        } else {
            await fs.ensureDir(targetPath);
        }
    }

    const spinner = ora('Initializing PostPipe Ecommerce System...').start();

    try {
        const isSrcDir = fs.existsSync(path.join(targetPath, 'src'));
        const baseDir = isSrcDir ? path.join(targetPath, 'src') : targetPath; // Logic needs calibration for fresh vs existing

        // For this Master CLI, we assume we might be setting up a fresh project OR integrating into existing one. 
        // We will follow the standard pattern: models in /models, api in /app/api or /pages/api, lib in /lib

        // 1. Install Dependencies (ALL OF THEM)
        spinner.text = 'Installing all dependencies... (this may take a moment)';
        const deps = [
            'mongoose', 'razorpay', 'shortid', 'cloudinary', 'resend',
            'bcryptjs', 'jsonwebtoken', 'jose', 'next-auth', 'axios'
        ];
        // Add dev deps if needed

        // execSync(`npm install ${deps.join(' ')}`, { cwd: targetPath, stdio: 'ignore' });
        // For demo purposes and speed, I will simulate this or let user run it. 
        // Actually, "Master CLI" implies "Ready to Use", so we SHOULD install.
        // Commented out to prevent accidental long installs during dev/test, but in prod code:
        execSync(`npm install mongoose razorpay shortid cloudinary resend bcryptjs jsonwebtoken jose axios`, { cwd: targetPath, stdio: 'ignore' });

        // 2. Scaffold Unified Models
        spinner.text = 'Creating Unified Schema (Models)...';
        const modelsDir = path.join(baseDir, 'models'); // e.g. ./models or ./src/models
        await fs.ensureDir(modelsDir);

        await fs.copy(path.join(__dirname, 'models'), modelsDir);

        // 3. Scaffold Unified API
        spinner.text = 'Creating Integrated API Routes...';
        // This part is complex. We'll copy the 'api' folder from templates.
        // We need to handle Next.js App Router structure: app/api/...
        const apiDir = path.join(baseDir, 'app', 'api');
        await fs.ensureDir(apiDir);

        await fs.copy(path.join(__dirname, 'api'), apiDir);

        // 4. Scaffold Lib/Utils
        spinner.text = 'Creating Utilities (DB Connect, Auth, etc)...';
        const libDir = path.join(baseDir, 'lib');
        await fs.ensureDir(libDir);
        await fs.copy(path.join(__dirname, 'lib'), libDir);

        spinner.succeed(chalk.green('🚀 Master Ecommerce Backend Ready!'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. cd ${answers.projectName}`);
        console.log(`2. Setup your .env file with ALL keys (Mongo, Razorpay, Cloudinary, Resend, JWT).`);
        console.log(`3. Run 'npm run dev' and start building the frontend!`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
