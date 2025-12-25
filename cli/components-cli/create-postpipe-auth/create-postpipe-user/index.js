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
    console.log(chalk.bold.blue('\nTypically used with PostPipe, this installs the User Model & DB Connection.\n'));

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
    const spinner = ora('Setting up User Model (MongoDB)...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'templates');

        // Check for src directory
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const destDir = isSrc ? path.join(targetDir, 'src', 'lib', 'postpipe') : path.join(targetDir, 'lib', 'postpipe');

        await fs.ensureDir(destDir);

        // Copy User.ts and mongodb.ts
        spinner.text = `Copying templates to ${destDir}...`;
        await fs.copy(path.join(templateDir, 'User.ts'), path.join(destDir, 'User.ts'));
        await fs.copy(path.join(templateDir, 'mongodb.ts'), path.join(destDir, 'mongodb.ts'));

        // Install mongoose
        spinner.text = 'Installing mongoose...';
        await execa('npm', ['install', 'mongoose'], { cwd: targetDir });

        spinner.succeed(chalk.green('User Model installed successfully!'));
        console.log(`\nLocation: ${chalk.cyan(destDir)}`);
        console.log(`Files: User.ts, mongodb.ts`);
        console.log(`Remember to set ${chalk.yellow('DATABASE_URI')} in your .env`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

main().catch(console.error);
