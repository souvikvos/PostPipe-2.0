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
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma) - Coming Soon'],
            default: 'MongoDB (Mongoose)'
        }
    ]);

    if (answers.database !== 'MongoDB (Mongoose)') {
        console.log(chalk.red('Only MongoDB is currently supported. Exiting...'));
        return;
    }

    const spinner = ora('Scaffolding Payment System...').start();

    try {
        // 1. Install Dependencies
        spinner.text = 'Installing dependencies (razorpay, crypto-js)...';
        // crypto is built-in node module, usually we need `razorpay` SDK
        execSync(`npm install razorpay shortid`, { stdio: 'ignore' });

        // 2. Create/Copy Models
        spinner.text = 'Creating Payment Model...';
        const modelsDir = path.join(CURR_DIR, 'models');
        await fs.ensureDir(modelsDir);

        const modelPath = path.join(__dirname, 'models', 'Payment.ts');
        await fs.copy(modelPath, path.join(modelsDir, 'Payment.ts'));

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(CURR_DIR, 'app', 'api', 'payment');
        await fs.ensureDir(apiDir);

        // Copy entire folder structure for APIs
        const apiSource = path.join(__dirname, 'api', 'payment');
        await fs.copy(apiSource, apiDir);

        spinner.succeed(chalk.green('Payment System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Add ${chalk.cyan('RAZORPAY_KEY_ID')} and ${chalk.cyan('RAZORPAY_KEY_SECRET')} to your .env file.`);
        console.log(`2. Use the created APIs to initiate and verify payments.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
