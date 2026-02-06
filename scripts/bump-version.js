#!/usr/bin/env node

/**
 * Version bumping script for EAS builds
 * Usage:
 *   npm run version:patch  - Bumps patch version (1.0.0 -> 1.0.1)
 *   npm run version:minor  - Bumps minor version (1.0.0 -> 1.1.0)
 *   npm run version:major  - Bumps major version (1.0.0 -> 2.0.0)
 */

const fs = require('fs');
const path = require('path');

const APP_CONFIG_PATH = path.join(__dirname, '..', 'app.config.js');
const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');

function getCurrentVersion() {
  try {
    const configContent = fs.readFileSync(APP_CONFIG_PATH, 'utf8');
    const match = configContent.match(/version:\s*['"]([\d.]+)['"]/);
    if (match) {
      return match[1];
    }
  } catch (error) {
    console.error('Error reading app.config.js:', error);
  }
  return '1.0.0';
}

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${currentVersion}`);
  }

  let [major, minor, patch] = parts;

  switch (type) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', or 'patch'`);
  }

  return `${major}.${minor}.${patch}`;
}

function updateVersion(newVersion) {
  // Update app.config.js
  try {
    let configContent = fs.readFileSync(APP_CONFIG_PATH, 'utf8');
    configContent = configContent.replace(
      /version:\s*['"][\d.]+['"]/,
      `version: '${newVersion}'`
    );
    fs.writeFileSync(APP_CONFIG_PATH, configContent, 'utf8');
    console.log(`✓ Updated app.config.js to version ${newVersion}`);
  } catch (error) {
    console.error('Error updating app.config.js:', error);
    process.exit(1);
  }

  // Update app.json
  try {
    const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));
    appJson.expo.version = newVersion;
    fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated app.json to version ${newVersion}`);
  } catch (error) {
    console.error('Error updating app.json:', error);
    process.exit(1);
  }
}

// Main execution
const versionType = process.argv[2];

if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
  process.exit(1);
}

const currentVersion = getCurrentVersion();
const newVersion = bumpVersion(currentVersion, versionType);

console.log(`Bumping version from ${currentVersion} to ${newVersion} (${versionType})`);
updateVersion(newVersion);
console.log(`\n✓ Version bumped successfully to ${newVersion}`);
console.log(`\nNext steps:`);
console.log(`  1. Commit the version changes`);
console.log(`  2. Run: eas build --profile production`);
