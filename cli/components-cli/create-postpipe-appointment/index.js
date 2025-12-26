#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.blue('\nWelcome to PostPipe Appointment Setup!\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: '1. MongoDB', value: 'mongodb' },
                { name: '2. DocumentDB (PostPipe Compatible)', value: 'documentdb' },
            ],
            default: 'mongodb'
        },
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB();
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB();
    }
}

async function setupMongoDB() {
    const spinner = ora('Initializing Appointment System (MongoDB)...').start();

    try {
        const targetDir = process.cwd();

        const templateDir = path.join(__dirname, 'mongodb', 'template');
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found at ${templateDir}`);
        }

        const apiSource = path.join(templateDir, 'api');
        const libSource = path.join(templateDir, 'lib');

        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const baseDir = isSrc ? path.join(targetDir, 'src') : targetDir;

        spinner.text = `Copying templates to project...`;

        // Copy Models
        const modelsDest = path.join(baseDir, 'lib', 'models');
        if (fs.existsSync(path.join(libSource, 'models'))) {
            await fs.copy(path.join(libSource, 'models'), modelsDest);
        }

        // Copy Actions
        const actionsDest = path.join(baseDir, 'lib', 'actions');
        // Check if we have an actions folder in libSource, assume yes
        if (fs.existsSync(path.join(libSource, 'actions'))) {
            await fs.copy(path.join(libSource, 'actions'), actionsDest);
        }

        // Copy API Routes
        const apiDest = path.join(baseDir, 'app', 'api');
        if (fs.existsSync(apiSource)) {
            await fs.copy(apiSource, apiDest);
        }

        // Copy dbConnect if not exists
        const dbConnectSource = path.join(libSource, 'dbConnect.ts');
        const dbConnectDest = path.join(baseDir, 'lib', 'dbConnect.ts');
        if (await fs.pathExists(dbConnectSource)) {
            if (!(await fs.pathExists(dbConnectDest))) {
                await fs.copy(dbConnectSource, dbConnectDest);
            }
        }

        // 2. Install Dependencies
        spinner.text = 'Installing dependencies...';
        const dependencies = ['mongoose', 'zod'];
        await execa('npm', ['install', ...dependencies], { cwd: targetDir });

        // 3. Configure .env
        spinner.text = 'Configuring environment...';
        const envPath = path.join(targetDir, '.env');
        const envContent = `
# PostPipe Appointment Configuration
# Ensure DATABASE_URI is set
`;
        if (fs.existsSync(envPath)) {
            const currentEnv = await fs.readFile(envPath, 'utf-8');
            if (!currentEnv.includes('DATABASE_URI')) {
                await fs.appendFile(envPath, `\n${envContent}DATABASE_URI=your_mongodb_connection_string\n`);
            }
        } else {
            await fs.writeFile(envPath, `${envContent}DATABASE_URI=your_mongodb_connection_string\n`);
        }

        spinner.succeed(chalk.green('Appointment System successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the models in ${chalk.cyan(modelsDest)}`);
        console.log(`2. Check the actions in ${chalk.cyan(actionsDest)}`);
        console.log(`3. Check the API routes in ${chalk.cyan(apiDest)}`);
        console.log(`4. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

async function setupDocumentDB() {
    const spinner = ora('Initializing Appointment System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
