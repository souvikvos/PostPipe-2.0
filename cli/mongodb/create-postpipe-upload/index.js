#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.cyan('☁️  Welcome to PostPipe File Upload CLI (Cloudinary)'));

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'This will install "cloudinary" and create /api/upload. Proceed?',
            default: true
        }
    ]);

    if (!answers.confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
    }

    const spinner = ora('Setting up file upload infrastructure...').start();

    try {
        const projectRoot = process.cwd();
        const isSrcDir = fs.existsSync(path.join(projectRoot, 'src'));
        const apiDir = isSrcDir ? path.join('src', 'app', 'api') : path.join('app', 'api');

        // Helper to copy
        const copyTemplate = async (sourceSubDir, destSubDir) => {
            const source = path.join(__dirname, sourceSubDir);
            const dest = path.join(projectRoot, destSubDir);
            if (await fs.pathExists(source)) {
                await fs.copy(source, dest);
            }
        };

        // 1. Install Dependencies
        spinner.text = 'Installing cloudinary package...';
        await execa('npm', ['install', 'cloudinary'], { cwd: projectRoot });

        // 2. Copy API Route
        spinner.text = 'Creating API route...';
        await copyTemplate('api/upload', path.join(apiDir, 'upload'));

        spinner.succeed(chalk.green('File Upload API scaffolded successfully!'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log('1. Add this single line to your .env file:');
        console.log(chalk.cyan(`
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
        `));
        console.log('2. Test it using the /api/upload endpoint.');

    } catch (error) {
        spinner.fail(chalk.red('Failed to setup file upload.'));
        console.error(error);
    }
}

main();
