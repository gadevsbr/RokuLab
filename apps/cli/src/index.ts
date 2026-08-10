#!/usr/bin/env node
import { loadProject } from '@rokulab/project-loader';

const [, , commandOrPath = '.', maybePath] = process.argv;
const command = ['inspect', 'validate'].includes(commandOrPath) ? commandOrPath : 'inspect';
const projectPath = maybePath ?? commandOrPath;
try {
  const project = await loadProject(projectPath);
  if (command === 'validate')
    console.log(`OK ${project.manifest.title} (${project.warnings.length} warnings)`);
  else console.log(JSON.stringify(project, null, 2));
} catch (error) {
  console.error(`RokuLab: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
