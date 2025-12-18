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
    console.log(chalk.bold.blue('\nWelcome to PostPipe Auth Setup!\n'));

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
    const spinner = ora('Initializing MongoDB Authentication...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'templates', 'mongodb');

        // 1. Copy Template Files
        // Helper to check if src exists
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const authDest = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');

        spinner.text = `Copying templates to ${authDest}...`;
        await fs.copy(templateDir, authDest);

        // 2. Install Dependencies
        spinner.text = 'Installing dependencies...';
        await execa('npm', ['install', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'postpipe', 'zod', 'resend'], { cwd: targetDir });
        await execa('npm', ['install', '-D', '@types/bcryptjs', '@types/jsonwebtoken'], { cwd: targetDir });

        // 3. Create .env with placeholders
        spinner.text = 'Configuring environment...';
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

        spinner.succeed(chalk.green('MongoDB Authentication successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the files in ${chalk.cyan(authDest)}`);
        console.log(`2. Update your ${chalk.cyan('.env')} file with real values.`);
        console.log(`3. Move the frontend pages from ${chalk.cyan(authDest + '/frontend')} to your app directory.`);
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
