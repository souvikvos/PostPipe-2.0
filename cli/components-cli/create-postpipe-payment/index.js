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
    .description('Scaffold a Razorpay Payment System for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.blue('\n💳  PostPipe Payment CLI (Razorpay)  💳\n'));
    console.log(chalk.dim('Secure, seamless payments for your Next.js app.\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: 'MongoDB (Mongoose)', value: 'mongodb' },
                { name: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' }
            ],
            default: 'mongodb'
        }
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB(answers);
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB(answers);
    }
}

async function setupMongoDB(answers) {
    const spinner = ora('Scaffolding Payment System (MongoDB)...').start();

    try {
        // Determine destination base
        const isSrc = fs.existsSync(path.join(CURR_DIR, 'src'));
        const baseDir = isSrc ? path.join(CURR_DIR, 'src') : CURR_DIR;

        const templateDir = path.join(__dirname, 'mongodb', 'template');
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found at ${templateDir}`);
        }

        // 1. Install Dependencies
        spinner.text = 'Installing dependencies (razorpay, crypto-js)...';
        try {
            execSync(`npm install razorpay shortid`, { stdio: 'ignore' });
        } catch (e) { }

        // 2. Create/Copy Models
        spinner.text = 'Creating Payment Model...';
        const modelsDest = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDest);

        if (fs.existsSync(path.join(templateDir, 'models', 'Payment.ts'))) {
            await fs.copy(
                path.join(templateDir, 'models', 'Payment.ts'),
                path.join(modelsDest, 'Payment.ts')
            );
        }

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api', 'payment');
        await fs.ensureDir(apiDir);

        // Copy entire folder structure for APIs
        if (fs.existsSync(path.join(templateDir, 'api', 'payment'))) {
            await fs.copy(
                path.join(templateDir, 'api', 'payment'),
                apiDir
            );
        }

        spinner.succeed(chalk.green('Payment System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Add ${chalk.cyan('RAZORPAY_KEY_ID')} and ${chalk.cyan('RAZORPAY_KEY_SECRET')} to your .env file.`);
        console.log(`2. Use the created APIs to initiate and verify payments.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

async function setupDocumentDB(answers) {
    const spinner = ora('Scaffolding Payment System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main();
