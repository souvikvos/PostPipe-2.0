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
    .version('1.0.1')
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
            choices: [
                { name: 'MongoDB (Mongoose)', value: 'mongodb' },
                { name: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' }
            ],
            default: 'mongodb'
        },
        {
            type: 'list',
            name: 'provider',
            message: 'Choose your logistics provider:',
            choices: ['ShipRocket', 'Generic / Internal Tracking'],
            default: 'Generic / Internal Tracking'
        }
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB(answers);
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB(answers);
    }
}

async function setupMongoDB(answers) {
    const spinner = ora('Scaffolding Delivery System (MongoDB)...').start();

    try {
        // Determine destination base
        const isSrc = fs.existsSync(path.join(CURR_DIR, 'src'));
        const baseDir = isSrc ? path.join(CURR_DIR, 'src') : CURR_DIR;

        const templateDir = path.join(__dirname, 'mongodb', 'template');
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found at ${templateDir}`);
        }

        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';
        // generic needs mongoose, shiprocket might need axios 
        try {
            execSync(`npm install mongoose axios`, { stdio: 'ignore' });
        } catch (e) {
            // ignore if already installed or package.json missing (tho we should probably warn)
        }

        // 2. Create/Copy Models
        spinner.text = 'Creating Shipment Model...';
        const modelsDest = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDest);

        // Copy models from mongodb/template/models
        if (fs.existsSync(path.join(templateDir, 'models', 'Shipment.ts'))) {
            await fs.copy(
                path.join(templateDir, 'models', 'Shipment.ts'),
                path.join(modelsDest, 'Shipment.ts')
            );
        }

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api', 'delivery');
        await fs.ensureDir(apiDir);

        if (fs.existsSync(path.join(templateDir, 'api', 'delivery', 'route.ts'))) {
            await fs.copy(
                path.join(templateDir, 'api', 'delivery', 'route.ts'),
                path.join(apiDir, 'route.ts')
            );
        } else if (fs.existsSync(path.join(templateDir, 'api', 'delivery', 'route.ts'))) {
            // handle structure variations if needed
        }

        spinner.succeed(chalk.green('Delivery System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Use ${chalk.cyan('Shipment')} model to create tracking records.`);
        console.log(`2. Use ${chalk.cyan('/api/delivery')} to update or fetch shipment status.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

async function setupDocumentDB(answers) {
    const spinner = ora('Scaffolding Delivery System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main();
