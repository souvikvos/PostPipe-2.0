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
    console.log(chalk.bold.blue('🛒 Welcome to PostPipe Shop CLI'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: '1. MongoDB', value: 'mongodb' },
                { name: '2. (coming soon)', value: 'coming_soon', disabled: true },
            ],
        },
        {
            type: 'checkbox',
            name: 'modules',
            message: 'Which shop modules do you want to install?',
            choices: [
                { name: 'Shopping Cart', value: 'cart', checked: true },
                { name: 'Wishlist', value: 'wishlist' },
                { name: 'Orders & Inventory', value: 'orders' },
            ],
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'This will copy files to src/lib/models and src/app/api. Proceed?',
            default: true
        }
    ]);

    if (!answers.confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
    }

    const spinner = ora('Scaffolding commerce features...').start();

    try {
        const projectRoot = process.cwd();
        const isSrcDir = fs.existsSync(path.join(projectRoot, 'src'));
        const apiDir = isSrcDir ? path.join('src', 'app', 'api') : path.join('app', 'api'); // App router assumption
        const modelsDir = isSrcDir ? path.join('src', 'lib', 'models') : path.join('lib', 'models');
        const actionsDir = isSrcDir ? path.join('src', 'lib', 'actions') : path.join('lib', 'actions');

        // Helper to copy
        const copyTemplate = async (sourceSubDir, destSubDir) => {
            const source = path.join(__dirname, sourceSubDir);
            const dest = path.join(projectRoot, destSubDir);
            if (await fs.pathExists(source)) {
                await fs.copy(source, dest);
            }
        };

        // 1. Core Deps check (skip for now, assumed installed or user will install)

        // 2. Install Modules
        if (answers.modules.includes('cart')) {
            await copyTemplate('lib/models/Cart.ts', path.join(modelsDir, 'Cart.ts'));
            await copyTemplate('api/cart', path.join(apiDir, 'cart'));
        }

        if (answers.modules.includes('wishlist')) {
            await copyTemplate('lib/models/Wishlist.ts', path.join(modelsDir, 'Wishlist.ts'));
            await copyTemplate('api/wishlist', path.join(apiDir, 'wishlist'));
        }

        if (answers.modules.includes('orders')) {
            await copyTemplate('lib/models/Order.ts', path.join(modelsDir, 'Order.ts'));
            await copyTemplate('api/orders', path.join(apiDir, 'orders'));
        }

        // Copy Server Actions (if any shop module is selected)
        if (answers.modules.length > 0) {
            await copyTemplate('lib/actions/shop.ts', path.join(actionsDir, 'shop.ts'));
        }

        spinner.succeed(chalk.green('Commerce features scaffolded successfully!'));

        console.log(chalk.yellow('\nNext Steps:'));
        if (answers.modules.includes('checkout')) {
            console.log('1. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to your .env');
        }
        console.log('2. Ensure your Product model has a "stock" field (default in PostPipe CMS).');
        console.log('3. Run npm run dev to test.');

    } catch (error) {
        spinner.fail(chalk.red('Failed to scaffold features.'));
        console.error(error);
    }
}

main();
