#!/usr/bin/env node
// Build script for expanded 10-day Claude Code training course
// Generates the complete HTML file from component parts

const fs = require('fs');
const path = require('path');

// Read template parts
const partsDir = path.join(__dirname, 'course-parts');
if (!fs.existsSync(partsDir)) fs.mkdirSync(partsDir, { recursive: true });

// Collect all parts in order
const partFiles = fs.readdirSync(partsDir)
  .filter(f => f.endsWith('.html'))
  .sort();

// Read the shell file for head/css/sidebar
const shell = fs.readFileSync(path.join(__dirname, 'courses/claude-code-training.html'), 'utf8');

// Find the placeholder and replace with assembled content
const placeholder = '    <!-- PLACEHOLDER: Course content goes here -->';
const contentParts = partFiles.map(f =>
  fs.readFileSync(path.join(partsDir, f), 'utf8')
).join('\n\n');

// Also read the script part
const scriptPart = fs.existsSync(path.join(partsDir, 'script.js'))
  ? fs.readFileSync(path.join(partsDir, 'script.js'), 'utf8')
  : '';

let output = shell.replace(placeholder, contentParts);

// Replace the placeholder script
if (scriptPart) {
  output = output.replace(
    `<script>\n  // Placeholder - full script will be added\n  if (typeof getOrCreateLearner === 'function') getOrCreateLearner();\n</script>`,
    `<script>\n${scriptPart}\n</script>`
  );
}

fs.writeFileSync(
  path.join(__dirname, 'courses/claude-code-training.html'),
  output,
  'utf8'
);

const wordCount = output.split(/\s+/).length;
const lineCount = output.split('\n').length;
console.log(`Built course: ${lineCount} lines, ~${wordCount} words`);
console.log(`Parts assembled: ${partFiles.length} content files`);
