#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import Handlebars from 'handlebars';

// Helper function to recursively read all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

async function runCLI() {
  console.log("Starting Bulk Template Boilerplate Generator...\n");

  // Step 1: Gather user inputs
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'My Custom App'
    },
    {
      type: 'input',
      name: 'authorName',
      message: 'Who is the author?',
      default: 'Developer'
    },
    {
      type: 'list',
      name: 'themeColor',
      message: 'Choose a background theme color:',
      choices: ['#282c34', '#1a1a1a', '#4a154b']
    }
  ]);

  // Step 2: Define paths
  const templateDir = path.join(process.cwd(), 'templates');
  const outputDir = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(templateDir)) {
    console.error(`Error: 'templates' folder not found at ${templateDir}`);
    process.exit(1);
  }

  // Step 3: Get all template files
  const allTemplateFiles = getAllFiles(templateDir);

  console.log(`\nProcessing ${allTemplateFiles.length} files...`);

  // Step 4: Loop through and process each file
  allTemplateFiles.forEach((templatePath) => {
    // Determine the relative path inside the template directory
    const relativePath = path.relative(templateDir, templatePath);
    
    // Determine where the new file should be saved
    let outputPath = path.join(outputDir, relativePath);

    // Read the raw file content
    const fileContent = fs.readFileSync(templatePath, 'utf8');

    // If it's a Handlebars file, process it and strip the '.hbs' extension
    if (templatePath.endsWith('.hbs')) {
      const template = Handlebars.compile(fileContent);
      const customizedContent = template(answers);
      
      outputPath = outputPath.replace('.hbs', ''); // e.g., index.html.hbs -> index.html
      
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, customizedContent, 'utf8');
      console.log(` Generated: ${path.relative(outputDir, outputPath)}`);
    } else {
      // If it's a regular file (like raw CSS or images), just copy it directly
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, fileContent, 'utf8');
      console.log(`  Copied: ${path.relative(outputDir, outputPath)}`);
    }
  });

  console.log(`\nSuccess! Your complete custom project has been saved to: ${outputDir}`);
}

runCLI().catch(err => console.error("An error occurred:", err));