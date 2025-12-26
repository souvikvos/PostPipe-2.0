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
            choices: [
                { name: 'MongoDB (Mongoose)', value: 'mongodb' },
                { name: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' }
            ],
            default: 'mongodb'
        },
        {
            type: 'confirm',
            name: 'includeEmail',
            message: 'Include Email Notification helper (Resend)?',
            default: true
        }
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB(answers);
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB(answers);
    }
}

async function setupMongoDB(answers) {
    const spinner = ora('Scaffolding Notification System (MongoDB)...').start();

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

        const dependencies = ['mongoose'];
        if (answers.includeEmail) {
            dependencies.push('resend');
        }

        try {
            execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'ignore' });
        } catch (e) { }

        // 2. Create/Copy Models
        spinner.text = 'Creating Notification Model...';
        const modelsDest = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDest);

        if (fs.existsSync(path.join(templateDir, 'models', 'Notification.ts'))) {
            await fs.copy(
                path.join(templateDir, 'models', 'Notification.ts'),
                path.join(modelsDest, 'Notification.ts')
            );
        }

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api', 'notifications');
        await fs.ensureDir(apiDir);

        // Copy main route
        if (fs.existsSync(path.join(templateDir, 'api', 'notifications', 'route.ts'))) {
            await fs.copy(
                path.join(templateDir, 'api', 'notifications', 'route.ts'),
                path.join(apiDir, 'route.ts')
            );
        }

        // 4. Copy Helper if needed
        if (answers.includeEmail) {
            spinner.text = 'Creating Notification Helper...';
            const libDir = path.join(baseDir, 'lib', 'actions');
            await fs.ensureDir(libDir);

            if (fs.existsSync(path.join(templateDir, 'lib', 'actions', 'notify.ts'))) {
                await fs.copy(
                    path.join(templateDir, 'lib', 'actions', 'notify.ts'),
                    path.join(libDir, 'notify.ts')
                );
            }
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

async function setupDocumentDB(answers) {
    const spinner = ora('Scaffolding Notification System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main();
