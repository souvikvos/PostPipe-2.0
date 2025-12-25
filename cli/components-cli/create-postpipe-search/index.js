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
    console.log(chalk.bold.cyan('🔍 Welcome to PostPipe Search & Pagination CLI'));

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'This will install the "APIFeatures" utility. Proceed?',
            default: true
        }
    ]);

    if (!answers.confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
    }

    const spinner = ora('Setting up search utilities...').start();

    try {
        const projectRoot = process.cwd();
        const isSrcDir = fs.existsSync(path.join(projectRoot, 'src'));
        const utilsDir = isSrcDir ? path.join('src', 'lib', 'utils') : path.join('lib', 'utils');

        // Helper to copy
        const copyTemplate = async (sourceSubDir, destSubDir) => {
            const source = path.join(__dirname, sourceSubDir);
            const dest = path.join(projectRoot, destSubDir);
            if (await fs.pathExists(source)) {
                await fs.copy(source, dest);
            }
        };

        // Copy Utility
        spinner.text = 'Creating APIFeatures utility...';
        await copyTemplate('lib/utils/apiFeatures.ts', path.join(utilsDir, 'apiFeatures.ts'));

        spinner.succeed(chalk.green('Search & Pagination utilities scaffolded successfully!'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log('1. Import `APIFeatures` in your API routes.');
        console.log('2. Use it like:');
        console.log(chalk.cyan(`
  const features = new APIFeatures(Model.find(), searchParams)
      .filter()
      .sort()
      .limitFields()
      .pagination();
  const results = await features.query;
        `));

    } catch (error) {
        spinner.fail(chalk.red('Failed to setup search utilities.'));
        console.error(error);
    }
}

main();
