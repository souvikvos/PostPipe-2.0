#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log(chalk.bold.blue('\nWelcome to PostPipe Docs Generator!\n'));
    console.log(chalk.gray('This tool installs the beautiful documentation UI into your Next.js project.\n'));

    const spinner = ora('Installing Docs...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'template');

        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found at ${templateDir}`);
        }

        // Determine destination: src/app/docs or app/docs
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const appDir = isSrc ? path.join(targetDir, 'src', 'app') : path.join(targetDir, 'app');

        if (!fs.existsSync(appDir)) {
            // Fallback if no app dir found (maybe blank project)
            // We'll just create 'app/docs' in root if 'src' doesn't exist
            // But usually this runs inside a Next.js project.
        }

        const docsDest = path.join(appDir, 'docs');

        // Copy template/app/docs -> target/app/docs
        await fs.copy(path.join(templateDir, 'app', 'docs'), docsDest);

        spinner.succeed(chalk.green('Docs installed successfully!'));

        console.log('\nNext Steps:');
        console.log(`1. Visit ${chalk.cyan('http://localhost:3000/docs')} (restart dev server if needed)`);
        console.log('2. Ensure you have Lucide Icons installed: npm install lucide-react');

    } catch (error) {
        spinner.fail('Installation failed.');
        console.error(error);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
