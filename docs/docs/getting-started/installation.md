---
sidebar_position: 1
---

# Installation

## Prerequisites

Before installing Blacksmith CLI, ensure you have the following tools installed:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| **Node.js** | >= 20.5.0 | `node --version` |
| **npm** | (bundled with Node.js) | `npm --version` |
| **Python** | >= 3.8 | `python3 --version` |
| **pip** | (bundled with Python) | `pip3 --version` |

### Installing Node.js

We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
```

Or download directly from [nodejs.org](https://nodejs.org/).

### Installing Python

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

**Windows:**

Download from [python.org](https://www.python.org/downloads/).

## Install Blacksmith CLI

Install globally via npm:

```bash
npm install -g blacksmith-cli
```

## Verify Installation

```bash
blacksmith --version
```

You should see the version number printed (e.g., `0.1.0`).

## Updating

To update to the latest version:

```bash
npm update -g blacksmith-cli
```

## Troubleshooting

### Permission Errors on macOS/Linux

If you get `EACCES` permission errors:

```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g blacksmith-cli

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g blacksmith-cli
```

### Node.js Version Too Old

If you see a Node.js version error, upgrade to Node.js 20 or later:

```bash
nvm install 20
nvm use 20
```

### Python Not Found

Blacksmith needs `python3` available in your PATH. If you have Python installed but the `python3` command isn't recognized, create a symlink or alias:

```bash
# Check if python3 exists
which python3

# If only `python` exists (common on Windows)
# Blacksmith will try `python` as a fallback
```
