#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const { execSync } = require('child_process');

const program = new Command();

program
    .version('1.0.0')
    .description('Scaffold a Delivery Tracking System for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.green('\n🚚  PostPipe Delivery CLI  🚚\n'));
    console.log(chalk.dim('Track shipments and manage logistics.\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma) - Coming Soon'],
            default: 'MongoDB (Mongoose)'
        },
        {
            type: 'list',
            name: 'provider',
            message: 'Choose your logistics provider:',
            choices: ['ShipRocket', 'Generic / Internal Tracking'],
            default: 'Generic / Internal Tracking'
        }
    ]);

    if (answers.database !== 'MongoDB (Mongoose)') {
        console.log(chalk.red('Only MongoDB is currently supported. Exiting...'));
        return;
    }

    const spinner = ora('Scaffolding Delivery System...').start();

    try {
        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';
        // generic needs mongoose, shiprocket might need axios 
        execSync(`npm install mongoose axios`, { stdio: 'ignore' });

        // 2. Create/Copy Models
        spinner.text = 'Creating Shipment Model...';
        const modelsDir = path.join(CURR_DIR, 'models');
        await fs.ensureDir(modelsDir);

        const modelPath = path.join(__dirname, 'models', 'Shipment.ts');
        await fs.copy(modelPath, path.join(modelsDir, 'Shipment.ts'));

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(CURR_DIR, 'app', 'api', 'delivery');
        await fs.ensureDir(apiDir);

        const routePath = path.join(__dirname, 'api', 'delivery', 'route.ts');
        await fs.copy(routePath, path.join(apiDir, 'route.ts'));

        spinner.succeed(chalk.green('Delivery System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Use ${chalk.cyan('Shipment')} model to create tracking records.`);
        console.log(`2. Use ${chalk.cyan('/api/delivery')} to update or fetch shipment status.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
