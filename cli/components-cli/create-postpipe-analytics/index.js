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
            choices: [
                { name: 'MongoDB (Mongoose)', value: 'mongodb' },
                { name: 'DocumentDB (PostPipe Compatible)', value: 'documentdb' }
            ],
            default: 'mongodb'
        }
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB(answers);
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB(answers);
    }
}

async function setupMongoDB(answers) {
    const spinner = ora('Scaffolding Analytics System (MongoDB)...').start();

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
        try {
            execSync(`npm install mongoose`, { stdio: 'ignore' });
        } catch (e) { }

        // 2. Create/Copy Models
        spinner.text = 'Creating Analytics Model...';
        const modelsDest = path.join(baseDir, 'models');
        await fs.ensureDir(modelsDest);

        if (fs.existsSync(path.join(templateDir, 'models', 'Analytics.ts'))) {
            await fs.copy(
                path.join(templateDir, 'models', 'Analytics.ts'),
                path.join(modelsDest, 'Analytics.ts')
            );
        }

        // 3. Create/Copy API Routes
        spinner.text = 'Creating API Routes...';
        const apiDir = path.join(baseDir, 'app', 'api', 'analytics');
        await fs.ensureDir(apiDir);

        if (fs.existsSync(path.join(templateDir, 'api', 'analytics', 'route.ts'))) {
            await fs.copy(
                path.join(templateDir, 'api', 'analytics', 'route.ts'),
                path.join(apiDir, 'route.ts')
            );
        }

        spinner.succeed(chalk.green('Analytics System Scaffolding Complete! 🚀'));

        console.log(chalk.yellow('\nNext Steps:'));
        console.log(`1. Use ${chalk.cyan('POST /api/analytics')} to track page views or clicks.`);
        console.log(`2. Use ${chalk.cyan('GET /api/analytics')} to build your dashboard.`);

    } catch (error) {
        spinner.fail(chalk.red('An error occurred during scaffolding.'));
        console.error(error);
    }
}

async function setupDocumentDB(answers) {
    const spinner = ora('Scaffolding Analytics System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main();
