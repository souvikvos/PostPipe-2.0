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
    .description('Scaffold a Custom Analytics System for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.blue('\n📈  PostPipe Analytics CLI  📈\n'));
    console.log(chalk.dim('Own your data with a lightweight analytics system.\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma) - Coming Soon'],
            default: 'MongoDB (Mongoose)'
        }
    ]);

    if (answers.database !== 'MongoDB (Mongoose)') {
        console.log(chalk.red('Only MongoDB is currently supported. Exiting...'));
        return;
    }

    const spinner = ora('Scaffolding Analytics System...').start();

    try {
        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';
        execSync(`npm install mongoose`, { stdio: 'ignore' });

        // 2. Create/Copy Models
        spinner.text = 'Creating Analytics Model...';
        const modelsDir = path.join(CURR_DIR, 'models');
        await fs.ensureDir(modelsDir);

        const modelPath = path.join(__dirname, 'models', 'Analytics.ts');
        await fs.copy(modelPath, path.join(modelsDir, 'Analytics.ts'));

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(CURR_DIR, 'app', 'api', 'analytics');
        await fs.ensureDir(apiDir);

        const routePath = path.join(__dirname, 'api', 'analytics', 'route.ts');
        await fs.copy(routePath, path.join(apiDir, 'route.ts'));

        spinner.succeed(chalk.green('Analytics System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Use ${chalk.cyan('POST /api/analytics')} to track page views or clicks.`);
        console.log(`2. Use ${chalk.cyan('GET /api/analytics')} to build your dashboard.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
