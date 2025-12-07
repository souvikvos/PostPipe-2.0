#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.blue('\nTypically used with PostPipe, this installs the Email Utility.\n'));

    const spinner = ora('Setting up Email Utility...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'templates');

        // Check for src directory
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const destDir = isSrc ? path.join(targetDir, 'src', 'lib', 'postpipe') : path.join(targetDir, 'lib', 'postpipe');

        await fs.ensureDir(destDir);

        // Copy email.ts
        spinner.text = `Copying email.ts to ${destDir}...`;
        await fs.copy(path.join(templateDir, 'email.ts'), path.join(destDir, 'email.ts'));

        // Install resend
        spinner.text = 'Installing resend...';
        await execa('npm', ['install', 'resend'], { cwd: targetDir });

        spinner.succeed(chalk.green('Email Utility installed successfully!'));
        console.log(`\nLocation: ${chalk.cyan(path.join(destDir, 'email.ts'))}`);
        console.log(`Remember to set ${chalk.yellow('RESEND_API_KEY')} in your .env`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

main().catch(console.error);
