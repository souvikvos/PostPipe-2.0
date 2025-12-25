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
    console.log(chalk.bold.magenta('\nWelcome to PostPipe CMS Setup!\n'));

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
        {
            type: 'checkbox',
            name: 'modules',
            message: 'Select CMS Modules to install:',
            choices: [
                { name: 'Store (Products & Categories)', value: 'store', checked: true },
                { name: 'Blog (Posts & Comments)', value: 'blog' },
                { name: 'Reviews / Testimonials', value: 'reviews' },
            ],
            validate: (answer) => {
                if (answer.length < 1) {
                    return 'You must choose at least one module.';
                }
                return true;
            },
        }
    ]);

    if (answers.database === 'mongodb') {
        await setupCMS(answers.modules);
    } else {
        console.log('Selection not supported yet.');
    }
}

async function setupCMS(modules) {
    const spinner = ora('Initializing CMS Features...').start();

    try {
        const targetDir = process.cwd();
        const apiSource = path.join(__dirname, 'api');
        const libSource = path.join(__dirname, 'lib');

        // Determine destination base
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const baseDir = isSrc ? path.join(targetDir, 'src') : targetDir;

        spinner.text = `Copying templates...`;

        const modelsDest = path.join(baseDir, 'lib', 'models');
        const apiDest = path.join(baseDir, 'app', 'api');

        await fs.ensureDir(modelsDest);
        await fs.ensureDir(apiDest);

        // Configuration for modules
        const moduleConfig = {
            store: {
                models: ['Product.ts', 'Category.ts'],
                apis: ['products', 'categories']
            },
            blog: {
                models: ['Post.ts', 'Comment.ts'],
                apis: ['posts', 'comments']
            },
            reviews: {
                models: ['Review.ts'],
                apis: ['reviews']
            }
        };

        const generatedApis = [];

        // Copy Selected Modules
        for (const mod of modules) {
            const config = moduleConfig[mod];
            if (config) {
                // Copy Models
                for (const modelFile of config.models) {
                    await fs.copy(
                        path.join(libSource, 'models', modelFile),
                        path.join(modelsDest, modelFile)
                    );
                }
                // Copy APIs
                for (const apiDir of config.apis) {
                    await fs.copy(
                        path.join(apiSource, apiDir),
                        path.join(apiDest, apiDir)
                    );
                    generatedApis.push(apiDir);
                }
            }
        }

        // Copy dbConnect (Shared)
        const dbConnectSource = path.join(libSource, 'dbConnect.ts');
        const dbConnectDest = path.join(baseDir, 'lib', 'dbConnect.ts');
        if (await fs.pathExists(dbConnectSource)) {
            if (!(await fs.pathExists(dbConnectDest))) {
                await fs.copy(dbConnectSource, dbConnectDest);
            }
        }

        // Install Dependencies
        spinner.text = 'Installing dependencies...';
        const dependencies = ['mongoose', 'zod'];
        await execa('npm', ['install', ...dependencies], { cwd: targetDir });

        // Configure .env
        spinner.text = 'Configuring environment...';
        const envPath = path.join(targetDir, '.env');
        const envContent = `
# PostPipe CMS Configuration
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

        spinner.succeed(chalk.green('CMS modules installed successfully!'));

        console.log('\nNext Steps:');
        console.log(`1. Review the models in ${chalk.cyan(modelsDest)}`);
        console.log(`2. Check the API routes: ${generatedApis.map(a => chalk.cyan(`/api/${a}`)).join(', ')}`);
        console.log(`3. Ensure ${chalk.cyan('DATABASE_URI')} is set in .env`);
        console.log(`4. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('CMS Setup failed.');
        console.error(error);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
