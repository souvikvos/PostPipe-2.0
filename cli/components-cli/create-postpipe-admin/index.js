#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.magenta('🛡️  Welcome to PostPipe Admin & Roles CLI'));

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'This will install middleware for Admin Route Protection. Proceed?',
            default: true
        }
    ]);

    if (!answers.confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
    }

    const spinner = ora('Setting up admin infrastructure...').start();

    try {
        const projectRoot = process.cwd();
        const isSrcDir = fs.existsSync(path.join(projectRoot, 'src'));

        // Middleware usually goes in root or src/
        const middlewareDest = isSrcDir ? path.join(projectRoot, 'src', 'middleware.ts') : path.join(projectRoot, 'middleware.ts');

        // Helper to copy
        const copyTemplate = async (sourceSubDir, destPath) => {
            const source = path.join(__dirname, sourceSubDir);
            if (await fs.pathExists(source)) {
                await fs.copy(source, destPath);
            }
        };

        // Copy Middleware (Renaming it to avoid overwriting existing generic middleware if not careful, but usually we just overwrite or append. For now, create specific admin middleware util)
        // Actually, let's create it as a helper function that can be used in the main middleware.

        const libDir = isSrcDir ? path.join('src', 'lib', 'auth') : path.join('lib', 'auth');
        await fs.ensureDir(path.join(projectRoot, libDir));

        spinner.text = 'Creating Admin Guard utility...';
        await copyTemplate('lib/auth/adminGuard.ts', path.join(projectRoot, libDir, 'adminGuard.ts'));

        spinner.succeed(chalk.green('Admin features scaffolded successfully!'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log('1. Use `adminGuard` in your middleware or server actions.');
        console.log('2. Ensure your User model has a `role: "user" | "admin"` field.');
        console.log(chalk.cyan(`
  import { adminGuard } from '@/lib/auth/adminGuard';
  
  // In API Route / Server Action
  await adminGuard();
        `));

    } catch (error) {
        spinner.fail(chalk.red('Failed to setup admin features.'));
        console.error(error);
    }
}

main();
