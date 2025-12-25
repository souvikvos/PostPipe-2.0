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
                { name: '2. (coming soon)', value: 'coming_soon_1', disabled: true },
            ],
        },
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB();
    } else {
        console.log('Selection not supported yet.');
    }
}

async function setupMongoDB() {
    const spinner = ora('Initializing User Profile System...').start();

    try {
        const targetDir = process.cwd();
        // Since this is running from within the project structure during dev usage or installed globally
        // We need to locate the templates. 
        // Assumes templates are at ../../../templates/profile/mongodb relative to this file
        // BUT when published, we might need to copy templates into the package.
        // For now, I'll assume we copy templates folders into the CLI package during publish or development.
        // Wait, standard practice is to have templates INSIDE the CLI package.
        // So I need to COPY the templates/profile/mongodb into cli/mongodb/create-postpipe-profile/templates/mongodb

        // However, existing create-postpipe-auth looks for path.join(__dirname, 'templates', 'mongodb').
        // So I should replicate that structure.

        const templateDir = path.join(__dirname, 'templates', 'mongodb');

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
        await fs.copy(templateDir, profileDest);

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

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
