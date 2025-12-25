#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.blue('\nScaffolding PostPipe Signup Flow (Backend + Frontend).\n'));

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
    const spinner = ora('Setting up Signup (MongoDB)...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'templates');

        // Determine Destination
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const libDir = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');
        const pagesDir = isSrc ? path.join(targetDir, 'src', 'app', 'auth', 'signup') : path.join(targetDir, 'app', 'auth', 'signup');

        // 1. Scaffold Backend (User, Actions, Schemas, Email)
        await fs.ensureDir(libDir);
        spinner.text = `Copying backend to ${libDir}...`;

        // We copy all backend files to be safe
        const backendFiles = ['User.ts', 'mongodb.ts', 'email.ts', 'actions.ts', 'schemas.ts'];
        for (const file of backendFiles) {
            // Only overwrite if explicit? For now, we overwrite to ensure version match, or we could check exists.
            await fs.copy(path.join(templateDir, file), path.join(libDir, file));
        }

        // 2. Scaffold Frontend
        await fs.ensureDir(pagesDir);
        spinner.text = `Copying SignupPage to ${pagesDir}...`;
        await fs.copy(path.join(templateDir, 'frontend', 'SignupPage.tsx'), path.join(pagesDir, 'page.tsx'));

        // 3. Install Dependencies
        spinner.text = 'Installing dependencies (mongoose, zod, bcryptjs, etc)...';
        await execa('npm', ['install', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'postpipe', 'zod', 'resend'], { cwd: targetDir });
        await execa('npm', ['install', '-D', '@types/bcryptjs', '@types/jsonwebtoken'], { cwd: targetDir });

        // 4. Config .env
        const envPath = path.join(targetDir, '.env');
        const envContent = `
# PostPipe Auth Configuration
DATABASE_URI=your_mongodb_connection_string
JWT_SECRET=your_super_complex_secret
RESEND_API_KEY=optional_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
        `;
        if (fs.existsSync(envPath)) {
            await fs.appendFile(envPath, `\n${envContent}`);
        } else {
            await fs.writeFile(envPath, envContent);
        }

        spinner.succeed(chalk.green('Signup Flow installed successfully!'));
        console.log(`\nBackend: ${chalk.cyan(libDir)}`);
        console.log(`Page: ${chalk.cyan(pagesDir)}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

main().catch(console.error);
