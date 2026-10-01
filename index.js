import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import Handlebars from 'handlebars';

async function runCLI() {
  console.log("🚀 Starting Template Customizer CLI...\n");

  // Step 1: Ask the user questions
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'My Awesome App'
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
    },
    {
      type: 'confirm',
      name: 'includeAnalytics',
      message: 'Do you want to include production analytics scripts?',
      default: false
    }
  ]);

  // Step 2: Read the template file
  const templatePath = path.join(process.cwd(), 'templates', 'index.html.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  // Step 3: Compile template using Handlebars and apply user answers
  const template = Handlebars.compile(templateSource);
  const resultResult = template(answers);

  // Step 4: Write the customized file out to disk
  const outputPath = path.join(process.cwd(), 'dist', 'index.html');
  
  // Ensure output folder directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, resultResult, 'utf8');

  console.log(`\n✨ Success! Your customized template has been saved to: ${outputPath}`);
}

runCLI().catch(err => console.error("An error occurred:", err));