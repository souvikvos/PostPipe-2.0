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
    console.log(chalk.bold.blue('\nWelcome to PostPipe Auth Setup!\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'database',
            message: 'Choose your database:',
            choices: [
                { name: '1. MongoDB', value: 'mongodb' },
                { name: '2. PostgreSQL (Prisma)', value: 'postgresql' },
            ],
        },
    ]);

    if (answers.database === 'mongodb') {
        await setupMongoDB();
    } else if (answers.database === 'postgresql') {
        await setupPostgreSQL();
    }
}

async function setupMongoDB() {
    const spinner = ora('Initializing MongoDB Authentication...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'mongodb', 'template');

        // 1. Copy Template Files
        // Helper to check if src exists
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const authDest = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');

        spinner.text = `Copying templates to ${authDest}...`;
        await fs.copy(templateDir, authDest);

        // 2. Install Dependencies
        spinner.text = 'Installing dependencies...';
        await execa('npm', ['install', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'postpipe', 'zod', 'resend'], { cwd: targetDir });
        await execa('npm', ['install', '-D', '@types/bcryptjs', '@types/jsonwebtoken'], { cwd: targetDir });

        // 3. Create .env with placeholders
        spinner.text = 'Configuring environment...';
        const envPath = path.join(targetDir, '.env');
        const envContent = `
# PostPipe Auth Configuration
DATABASE_URI=your_mongodb_connection_string
JWT_SECRET=your_super_complex_secret
RESEND_API_KEY=optional_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
    `;

        if (fs.existsSync(envPath)) {
            await fs.appendFile(envPath, `\n${envContent}`);
        } else {
            await fs.writeFile(envPath, envContent);
        }

        spinner.succeed(chalk.green('MongoDB Authentication successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the files in ${chalk.cyan(authDest)}`);
        console.log(`2. Update your ${chalk.cyan('.env')} file with real values.`);
        console.log(`3. Move the frontend pages from ${chalk.cyan(authDest + '/frontend')} to your app directory.`);
        console.log(`4. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

async function setupPostgreSQL() {
    const spinner = ora('Initializing PostgreSQL Authentication (via Prisma)...').start();

    try {
        const targetDir = process.cwd();
        const templateDir = path.join(__dirname, 'postgresql', 'template');

        // 1. Copy Template Files
        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const authDest = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');
        // For Prisma, we often want the schema at root/prisma or src/prisma. 
        // But here we are copying the "template" folder. 
        // The structure of template is:
        // postgresql/template/
        //   prisma/schema.prisma
        //   lib/auth/prisma.ts
        //   .env.example

        // Wait, the mongodb template had "app", "lib", "models". 
        // My postgresql template has "prisma", "lib/auth", ".env.example".
        // If I copy "templateDir" to "authDest" (lib/auth), I will end up with lib/auth/prisma/schema.prisma, which is odd.

        // Let's refine the copy logic for Postgres.
        // We want:
        // - prisma/schema.prisma -> ./prisma/schema.prisma
        // - lib/auth/prisma.ts -> ./lib/auth/prisma.ts (or src/lib/auth)

        // So we should copy parts separately or copy everything to root (merging).
        // BUT, setupMongoDB copies to `authDest` (lib/auth).
        // MongoDB template structure:
        //   app/ -> (pages)
        //   lib/ -> (auth utils)
        //   models/ -> (User.ts)

        // If I copy mongo template to `lib/auth`, I get `lib/auth/app`, `lib/auth/lib`, `lib/auth/models`. 
        // That seems to be how it was working...
        // Let's check `setupMongoDB` again.
        // `path.join(targetDir, 'src', 'lib', 'auth')`
        // `await fs.copy(templateDir, authDest)`
        // If templateDir has `app`, `lib`, `models`, then `lib/auth` will contain `app`, `lib`, `models`. 
        // Example: `src/lib/auth/models/User.ts`. 
        // This seems correct for the existing MongoDB logic.

        // For Postgres, I created:
        // postgresql/template/prisma/schema.prisma
        // postgresql/template/lib/auth/prisma.ts

        // If I copy `postgresql/template` to `targetDir` (root), it would place `prisma` in root and `lib` in root.
        // But we want to support `src` directory if it exists.

        spinner.text = `Copying templates...`;

        // Copy prisma folder to root always (or src if Next.js pattern? Prisma usually lives in root or src/prisma)
        // Standard is root/prisma for Next.js app dir often, or just root.
        const prismaDest = path.join(targetDir, 'prisma');
        await fs.copy(path.join(templateDir, 'prisma'), prismaDest);

        // Copy auth utils logic
        // We put prisma.ts in `postgresql/template/lib/auth/prisma.ts`.
        // We want it in `src/lib/auth/prisma.ts` or `lib/auth/prisma.ts`.
        const libAuthDest = isSrc ? path.join(targetDir, 'src', 'lib', 'auth') : path.join(targetDir, 'lib', 'auth');

        // Since my template has `lib/auth/prisma.ts`, I should copy `templateDir/lib/auth` to `libAuthDest`.
        // Since my template has `lib/auth/prisma.ts`, I should copy `templateDir/lib/auth` to `libAuthDest`.
        if (fs.existsSync(path.join(templateDir, 'lib', 'auth'))) {
            await fs.copy(path.join(templateDir, 'lib', 'auth'), libAuthDest);
        }

        // Copy frontend pages (app folder)
        if (fs.existsSync(path.join(templateDir, 'app'))) {
            const frontendDest = path.join(libAuthDest, 'frontend');
            await fs.copy(path.join(templateDir, 'app'), frontendDest);
        }

        // 2. Install Dependencies
        spinner.text = 'Installing dependencies...';
        await execa('npm', ['install', '@prisma/client', 'bcryptjs', 'jsonwebtoken', 'postpipe', 'zod', 'resend'], { cwd: targetDir });
        await execa('npm', ['install', '-D', 'prisma', '@types/bcryptjs', '@types/jsonwebtoken'], { cwd: targetDir });

        // 3. Create .env
        spinner.text = 'Configuring environment...';
        const envPath = path.join(targetDir, '.env');
        const exampleEnvPath = path.join(templateDir, '.env.example');

        let envContent = '';
        if (fs.existsSync(exampleEnvPath)) {
            envContent = await fs.readFile(exampleEnvPath, 'utf-8');
        } else {
            envContent = `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"`;
        }

        if (fs.existsSync(envPath)) {
            await fs.appendFile(envPath, `\n${envContent}`);
        } else {
            await fs.writeFile(envPath, envContent);
        }

        spinner.succeed(chalk.green('PostgreSQL Authentication successfully initialized!'));

        console.log('\nNext Steps:');
        console.log(`1. Check the prisma schema in ${chalk.cyan('prisma/schema.prisma')}`);
        console.log(`2. Update your ${chalk.cyan('.env')} file with your PostgreSQL connection string.`);
        console.log(`3. Run: ${chalk.yellow('npx prisma migrate dev --name init')} to create the database tables.`);
        console.log(`4. Run: ${chalk.yellow('npx prisma generate')} to generate the client.`);
        console.log(`5. Move the frontend pages from ${chalk.cyan(libAuthDest + '/frontend')} to your app directory.`);
        console.log(`6. Run: ${chalk.yellow('npm run dev')}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
