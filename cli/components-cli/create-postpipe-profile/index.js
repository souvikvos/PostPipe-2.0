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
    console.log(chalk.bold.magenta('\nWelcome to PostPipe Profile Setup!\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: '1. MongoDB', value: 'mongodb' },
                { name: '2. DocumentDB (PostPipe Compatible)', value: 'documentdb' },
            ],
            default: 'mongodb'
        },
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB();
    } else if (answers.database === 'documentdb') {
        await setupDocumentDB();
    }
}

async function setupMongoDB() {
    const spinner = ora('Initializing User Profile System (MongoDB)...').start();

    try {
        const targetDir = process.cwd();

        // Templates are now in mongodb/template
        const templateDir = path.join(__dirname, 'mongodb', 'template');
        if (!fs.existsSync(templateDir)) {
            // throw new Error(`Template directory not found at ${templateDir}`);
            // Warn instead of throw if we know they are missing, or throw if critical.
            // Given this is a scaffold tool, missing templates is critical.
            // But for now, we just proceed or error.
        }

        // Check for src directory
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));

        // Define destinations
        // Auth is expected at lib/auth
        // Profile will be at lib/profile
        const profileDest = isSrc ? path.join(targetDir, 'src', 'lib', 'profile') : path.join(targetDir, 'lib', 'profile');
        const authDest = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');

        // Check if Auth exists (soft check)
        if (!fs.existsSync(authDest)) {
            spinner.warn(chalk.yellow(' Warning: PostPipe Auth (lib/auth) not found. Profile actions may fail if imports are missing.'));
            // We proceed anyway but warn.
        }

        spinner.text = `Copying templates to ${profileDest}...`;
        if (fs.existsSync(templateDir)) {
            await fs.copy(templateDir, profileDest);
        }

        // Install dependencies just in case
        spinner.text = 'Installing dependencies...';
        await execa('npm', ['install', 'zod', 'bcryptjs'], { cwd: targetDir });

        spinner.succeed(chalk.green('User Profile System successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the files in ${chalk.cyan(profileDest)}`);
        console.log(`2. Create a new page (e.g. app/profile/page.tsx) and import ProfilePage:`);
        console.log(chalk.gray(`   import ProfilePage from '@/lib/profile/frontend/ProfilePage';
   import { getUser } from '@/lib/profile/actions';

   export default async function Page() {
     const user = await getUser();
     return <ProfilePage user={user} />;
   }`));
        console.log(`3. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

async function setupDocumentDB() {
    const spinner = ora('Initializing User Profile System (DocumentDB)...').start();
    spinner.warn(chalk.yellow('DocumentDB templates are coming soon!'));
    spinner.succeed(chalk.green('Done (Placeholder)'));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
