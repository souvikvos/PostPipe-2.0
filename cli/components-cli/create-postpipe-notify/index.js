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
    .description('Scaffold a Notification System for PostPipe 2.0');

program.parse(process.argv);

const CURR_DIR = process.cwd();

async function main() {
    console.log(chalk.bold.magenta('\n🔔  PostPipe Notifications CLI  🔔\n'));
    console.log(chalk.dim('Add a robust notification system to your app.\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Prisma) - Coming Soon'],
            default: 'MongoDB (Mongoose)'
        },
        {
            type: 'confirm',
            name: 'includeEmail',
            message: 'Include Email Notification helper (Resend)?',
            default: true
        }
    ]);

    if (answers.database !== 'MongoDB (Mongoose)') {
        console.log(chalk.red('Only MongoDB is currently supported. Exiting...'));
        return;
    }

    const spinner = ora('Scaffolding Notification System...').start();

    try {
        // 1. Install Dependencies
        spinner.text = 'Installing dependencies...';

        const dependencies = ['mongoose'];
        if (answers.includeEmail) {
            dependencies.push('resend');
        }

        execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'ignore' });

        // 2. Create/Copy Models
        spinner.text = 'Creating Notification Model...';
        const modelsDir = path.join(CURR_DIR, 'models');
        await fs.ensureDir(modelsDir);

        const notificationModelPath = path.join(__dirname, 'models', 'Notification.ts');
        // We will create the models folder in the CLI directory and populate it next
        await fs.copy(notificationModelPath, path.join(modelsDir, 'Notification.ts'));

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(CURR_DIR, 'app', 'api', 'notifications');
        await fs.ensureDir(apiDir);

        // Copy main route
        const routePath = path.join(__dirname, 'api', 'notifications', 'route.ts');
        await fs.copy(routePath, path.join(apiDir, 'route.ts'));

        // 4. Copy Helper if needed
        if (answers.includeEmail) {
            spinner.text = 'Creating Notification Helper...';
            const libDir = path.join(CURR_DIR, 'lib', 'actions');
            await fs.ensureDir(libDir);

            const helperPath = path.join(__dirname, 'lib', 'actions', 'notify.ts');
            await fs.copy(helperPath, path.join(libDir, 'notify.ts'));
        }

        spinner.succeed(chalk.green('Notification System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        if (answers.includeEmail) {
            console.log(`1. Add ${chalk.cyan('RESEND_API_KEY')} to your .env file.`);
        }
        console.log(`2. Use the ${chalk.cyan('Notification')} model to create DB alerts.`);
        console.log(`3. Call ${chalk.cyan('/api/notifications')} to fetch user alerts.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

main();
