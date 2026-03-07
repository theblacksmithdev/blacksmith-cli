#!/usr/bin/env node

const requiredMajor = 20;
const requiredMinor = 5;
const requiredVersion = `${requiredMajor}.${requiredMinor}.0`;

const [major, minor] = process.version.slice(1).split('.').map(Number);

if (major < requiredMajor || (major === requiredMajor && minor < requiredMinor)) {
  console.error(
    `\nBlacksmith requires Node.js v${requiredVersion} or later.\n` +
    `You are running ${process.version}.\n\n` +
    `Please upgrade Node.js:\n` +
    `  nvm install ${requiredMajor} && nvm use ${requiredMajor}\n` +
    `  or visit https://nodejs.org\n`
  );
  process.exit(1);
}

import('../dist/index.js');
