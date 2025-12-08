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
    console.log(chalk.bold.blue('\nWelcome to PostPipe Form Setup!\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: '1. MongoDB', value: 'mongodb' },
                { name: '2. (coming soon)', value: 'coming_soon_1', disabled: true },
            ],
        },
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB();
    } else {
        console.log('Selection not supported yet.');
    }
}

async function setupMongoDB() {
    const spinner = ora('Initializing Form Submission APIs...').start();

    try {
        const targetDir = process.cwd();
        // Templates are now in the package root
        const apiSource = path.join(__dirname, 'api');
        const libSource = path.join(__dirname, 'lib');

        // 1. Copy Template Files
        // Helper to check if src exists. We put forms in lib/forms usually.
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        // Construct paths
        const baseDir = isSrc ? path.join(targetDir, 'src') : targetDir;

        spinner.text = `Copying templates to project...`;

        // Copy Models
        const modelsDest = path.join(baseDir, 'lib', 'models');
        await fs.copy(path.join(libSource, 'models'), modelsDest);

        // Copy API Routes
        const apiDest = path.join(baseDir, 'app', 'api');
        await fs.copy(apiSource, apiDest);

        // Copy dbConnect
        const dbConnectSource = path.join(libSource, 'dbConnect.ts');
        const dbConnectDest = path.join(baseDir, 'lib', 'dbConnect.ts');
        if (await fs.pathExists(dbConnectSource)) {
            if (!(await fs.pathExists(dbConnectDest))) {
                await fs.copy(dbConnectSource, dbConnectDest);
            }
        }

        // 2. Install Dependencies
        spinner.text = 'Installing dependencies...';
        // Need mongoose for models, zod for validation (common practice), maybe resend if we do emails.
        const dependencies = ['mongoose', 'zod'];
        await execa('npm', ['install', ...dependencies], { cwd: targetDir });

        // 3. Create/Update .env 
        // (Just append if needed, mainly DB URI which might already be there)
        spinner.text = 'Configuring environment...';
        const envPath = path.join(targetDir, '.env');
        const envContent = `
# PostPipe Forms Configuration
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

        spinner.succeed(chalk.green('Form APIs successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the models in ${chalk.cyan(modelsDest)}`);
        console.log(`2. Check the API routes in ${chalk.cyan(apiDest)}`);
        console.log(`3. Ensure your ${chalk.cyan('.env')} has a valid DATABASE_URI.`);
        console.log(`4. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
