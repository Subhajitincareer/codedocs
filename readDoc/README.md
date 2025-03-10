# 📚 CodeDocs: Documentation at Your Fingertips

<div align="center">
  <h3>All your project documentation in one place - right inside VS Code!</h3>
</div>

## 🔍 What is CodeDocs?

CodeDocs is a VS Code extension that brings documentation for all your project dependencies directly into your editor. No more context switching between coding and reading docs!

## 🚀 Quick Start Guide

### Step 1: Install the Extension

- Download the `codedocs-1.0.0.vsix` file
- Open VS Code and press `Ctrl+Shift+X` to open Extensions
- Click `...` at the top of Extensions panel
- Select "Install from VSIX..." and choose the downloaded file
- Restart VS Code

### Step 2: Open a Project

- Open any project with a `package.json` (for JavaScript/Node.js) or `requirements.txt` (for Python)
- The extension will automatically analyze your dependencies

### Step 3: View Your Documentation

- Click on the book icon 📚 in the activity bar (left side panel)
- You'll see all your project dependencies listed
- Simply click on any package name to view its documentation
- The documentation will appear in a panel on the right

### Step 4: Use Keyboard Shortcuts

- Select any code or package name in your editor
- Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
- Documentation for the selected term will open instantly!

## 🛠️ Features

- **Auto-Detection** - Automatically finds all your project dependencies
- **Built-in Docs** - Offline documentation for popular packages like React, Express and Axios
- **Online Search** - Fetches documentation from npm and PyPI
- **Fast Access** - Keyboard shortcuts for quick documentation access
- **Code Integration** - Select any code to find related documentation

## 🔄 Refreshing Your Dependencies

If you add new packages to your project:

1. Click the refresh icon (🔄) in the top-right corner of the CodeDocs panel
2. CodeDocs will scan your project files again and update the list

## 📋 Supported Project Types

| Language | Supported File |
|----------|----------------|
| JavaScript/Node.js | `package.json` |
| Python | `requirements.txt` |

## ⚠️ Troubleshooting

### Nothing showing up in the panel?

1. Make sure your project has a `package.json` or `requirements.txt` file
2. Check that this file has dependencies listed
3. Click the refresh button (🔄) in the panel header
4. Restart VS Code

### Can't see the CodeDocs icon?

1. Try the keyboard shortcut: `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
2. Check the Extensions panel to make sure CodeDocs is installed
3. Reinstall the extension if needed

### Documentation not loading for some packages?

1. Popular packages (React, Express, Axios) work offline with built-in docs
2. For other packages, you need internet access
3. Some packages may have limited or no documentation available

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Documentation | `Ctrl+Shift+D` | `Cmd+Shift+D` |

## 📜 License

This project is licensed under the MIT License.

---

**Made with ❤️ for developers who love good documentation!** 