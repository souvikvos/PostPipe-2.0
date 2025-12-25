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
    console.log(chalk.bold.magenta('\nWelcome to PostPipe Generic CRUD Generator!\n'));
    console.log(chalk.gray('This tool creates a full CRUD stack (Model, Actions, API) for any resource.\n'));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'resourceName',
            message: 'What is the singular name of your resource (e.g., product, article, widget)?',
            validate: (input) => {
                if (/^[a-zA-Z]+$/.test(input)) return true;
                return 'Resource name must be single word, letters only.';
            },
        },
    ]);

    const resourceName = answers.resourceName.toLowerCase();
    const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

    await setupCRUD(resourceName, ResourceName);
}

async function setupCRUD(resourceName, ResourceName) {
    const spinner = ora(`Scaffolding CRUD for ${ResourceName}...`).start();

    try {
        const targetDir = process.cwd();
        // Adjust these paths based on where the CLI is actually located relative to templates in the repo,
        // OR assuming we bundle templates with the CLI package.
        // For this repo context: ../../../templates/crud/mongodb
        // But when published/executed, templates usually need to be inside the CLI folder or resolvable.
        // For this internal tool, we'll try to resolve from the repo root if possible, or assume a location.
        // Let's assume the user runs this from the repo root or we copy templates into the CLI folder during build.
        // FOR NOW: I will rely on reading from the absolute known path in this dev environment, 
        // OR better, I will assume the CLI should contain the templates in a 'templates' folder relative to __dirname.
        // I will need to make sure I copy the templates there.

        // Strategy: We will assume templates are copied into this CLI's folder for 'production' use, 
        // but for now I'll point to the actual templates directory if I can find it, or fail.

        let templateDir = path.resolve(__dirname, '../../../templates/crud/mongodb');
        if (!fs.existsSync(templateDir)) {
            // Fallback for when we might move things around
            templateDir = path.join(__dirname, 'templates');
        }

        if (!fs.existsSync(templateDir)) {
            throw new Error(`Templates not found at ${templateDir}`);
        }

        const isSrc = fs.existsSync(path.join(targetDir, 'src'));
        const baseDir = isSrc ? path.join(targetDir, 'src') : targetDir;

        // 1. Copy and Rename Model
        const modelsDest = path.join(baseDir, 'lib', 'models');
        await fs.ensureDir(modelsDest);
        const modelContent = await fs.readFile(path.join(templateDir, 'models', 'Resource.ts'), 'utf-8');
        const newModelContent = replacePlaceholders(modelContent, resourceName, ResourceName);
        await fs.writeFile(path.join(modelsDest, `${ResourceName}.ts`), newModelContent);

        // 2. Copy and Rename Actions
        const actionsDest = path.join(baseDir, 'lib', 'actions');
        await fs.ensureDir(actionsDest);
        const actionsContent = await fs.readFile(path.join(templateDir, 'actions.ts'), 'utf-8');
        const newActionsContent = replacePlaceholders(actionsContent, resourceName, ResourceName);
        // Rename actions file to resource name or keep generic name? 
        // 'actions.ts' usually generic, but if we have multiple, maybe 'article.actions.ts'? 
        // The pattern seems to be keeping them in 'lib/actions/...' or just 'lib/actions.ts' if single.
        // But if we want multiple CRUDs, we should probably name the file `${resourceName}.ts`.
        await fs.writeFile(path.join(actionsDest, `${resourceName}.ts`), newActionsContent);

        // 3. Copy and Rename API Routes
        const apiDir = path.join(baseDir, 'app', 'api', resourceName);
        await fs.ensureDir(apiDir);

        // /api/[resource]/route.ts
        const apiRouteContent = await fs.readFile(path.join(templateDir, 'api', 'route.ts'), 'utf-8');
        await fs.writeFile(path.join(apiDir, 'route.ts'), replacePlaceholders(apiRouteContent, resourceName, ResourceName));

        // /api/[resource]/[id]/route.ts
        const apiIdDir = path.join(apiDir, '[id]');
        await fs.ensureDir(apiIdDir);
        const apiIdRouteContent = await fs.readFile(path.join(templateDir, 'api', '[id]', 'route.ts'), 'utf-8');
        await fs.writeFile(path.join(apiIdDir, 'route.ts'), replacePlaceholders(apiIdRouteContent, resourceName, ResourceName));

        // 4. Ensure dbConnect
        // We assume dbConnect exists or we copy it. 
        // It's safer to copy if missing.
        // Assuming dbConnect.ts is in lib/dbConnect.ts in the project.
        // Check if DB connect exists in template
        // const dbConnectSource = path.join(templateDir, 'lib', 'dbConnect.ts');
        // if (fs.existsSync(dbConnectSource)) {
        //    const dbConnectDest = path.join(baseDir, 'lib', 'dbConnect.ts');
        //    if (!fs.existsSync(dbConnectDest)) {
        //        await fs.copy(dbConnectSource, dbConnectDest);
        //    }
        //}

        spinner.succeed(chalk.green(`${ResourceName} CRUD initialized!`));

        console.log('\nNext Steps:');
        console.log(`1. Review the model in ${chalk.cyan(`lib/models/${ResourceName}.ts`)}`);
        console.log(`2. Review actions in ${chalk.cyan(`lib/actions/${resourceName}.ts`)}`);
        console.log(`3. API available at ${chalk.cyan(`/api/${resourceName}`)}`);

    } catch (error) {
        spinner.fail('Setup failed.');
        console.error(error);
    }
}

function replacePlaceholders(content, resourceName, ResourceName) {
    // Replace 'Resource' with 'Product'
    let newContent = content.replace(/Resource/g, ResourceName);
    // Replace 'resource' with 'product' (careful with case)
    // We used 'Resource' in imports and class names.
    // In comments or variables we might have 'resource'.
    // The safest generic replace for 'resource' lowercase might be tricky if unrelated words exist.
    // In our template, we mostly use 'Resource'. 
    // Let's look at variables: 'const resource = ...' -> 'const product = ...'
    newContent = newContent.replace(/resource/g, resourceName);

    // Replace revalidate generic placeholder
    // OLD: revalidatePath('/GENERIC_PATH_TO_REPLACE');
    // NEW: revalidatePath('/products-demo'); -- actually we don't know the demo path.
    // usage: revalidatePath(`/${resourceName}s`); // naive 
    newContent = newContent.replace(/GENERIC_PATH_TO_REPLACE/g, `${resourceName}s`);

    return newContent;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
