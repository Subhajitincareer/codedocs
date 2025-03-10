"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const DocumentationPanel_1 = require("./panels/DocumentationPanel");
const DocumentationProvider_1 = require("./providers/DocumentationProvider");
const ProjectAnalyzer_1 = require("./utils/ProjectAnalyzer");
function activate(context) {
    console.log('CodeDocs extension is now active!');
    try {
        // Initialize core components
        const docProvider = new DocumentationProvider_1.DocumentationProvider(context);
        const projectAnalyzer = new ProjectAnalyzer_1.ProjectAnalyzer();
        // Register tree data provider first
        vscode.window.registerTreeDataProvider('codedocsPanelView', docProvider);
        // Command to show documentation panel
        const showDocs = vscode.commands.registerCommand('codedocs.showDocs', async (dependency) => {
            try {
                const panel = await DocumentationPanel_1.DocumentationPanel.createOrShow(context.extensionUri);
                if (dependency) {
                    await panel.search(dependency);
                }
                return panel;
            }
            catch (error) {
                console.error('Error in showDocs command:', error);
                vscode.window.showErrorMessage(`Error showing documentation: ${error}`);
            }
        });
        // Command to search documentation
        const searchDocs = vscode.commands.registerCommand('codedocs.searchDocs', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    const text = editor.document.getText(selection);
                    if (text) {
                        const panel = await DocumentationPanel_1.DocumentationPanel.createOrShow(context.extensionUri);
                        await panel.search(text);
                    }
                    else {
                        vscode.window.showInformationMessage('Please select text to search documentation');
                    }
                }
            }
            catch (error) {
                console.error('Error in searchDocs command:', error);
                vscode.window.showErrorMessage(`Error searching documentation: ${error}`);
            }
        });
        // Command to refresh dependencies
        const refreshDeps = vscode.commands.registerCommand('codedocs.refreshDependencies', async () => {
            try {
                if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    vscode.window.showInformationMessage('CodeDocs: Refreshing dependencies...');
                    for (const folder of vscode.workspace.workspaceFolders) {
                        await analyzeWorkspace(folder.uri.fsPath);
                    }
                }
                else {
                    vscode.window.showInformationMessage('CodeDocs: No workspace folders found');
                }
            }
            catch (error) {
                console.error('Error in refreshDependencies command:', error);
                vscode.window.showErrorMessage(`Error refreshing dependencies: ${error}`);
            }
        });
        // Add commands to subscriptions immediately after registration
        context.subscriptions.push(showDocs, searchDocs, refreshDeps);
        // Create and show status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = '$(book) CodeDocs';
        statusBarItem.tooltip = 'View Documentation';
        statusBarItem.command = 'codedocs.showDocs';
        statusBarItem.show();
        context.subscriptions.push(statusBarItem);
        // Watch for changes in dependency files
        const watcher = vscode.workspace.createFileSystemWatcher('**/{package.json,requirements.txt}');
        watcher.onDidChange(uri => analyzeWorkspace(uri.fsPath));
        watcher.onDidCreate(uri => analyzeWorkspace(uri.fsPath));
        context.subscriptions.push(watcher);
        // Watch for workspace folder changes
        const workspaceFolderChangedListener = vscode.workspace.onDidChangeWorkspaceFolders(event => {
            if (event.added.length > 0) {
                event.added.forEach(folder => {
                    analyzeWorkspace(folder.uri.fsPath);
                });
            }
        });
        context.subscriptions.push(workspaceFolderChangedListener);
        // Helper function to analyze workspace dependencies
        async function analyzeWorkspace(path) {
            try {
                vscode.window.setStatusBarMessage('CodeDocs: Analyzing dependencies...', 3000);
                const deps = await projectAnalyzer.analyzeDependencies(path);
                if (deps.length > 0) {
                    docProvider.updateDependencies(deps);
                    vscode.window.setStatusBarMessage(`CodeDocs: Found ${deps.length} dependencies`, 3000);
                }
                else {
                    docProvider.updateDependencies([]);
                    console.log('No dependencies found in project');
                }
            }
            catch (error) {
                console.error('Error analyzing workspace:', error);
                vscode.window.showErrorMessage(`CodeDocs: Error analyzing dependencies: ${error}`);
            }
        }
        // Initial workspace analysis with delay
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            setTimeout(() => {
                vscode.workspace.workspaceFolders?.forEach(folder => {
                    analyzeWorkspace(folder.uri.fsPath);
                });
            }, 2000); // Increased delay to ensure extension is fully loaded
        }
        else {
            console.log('No workspace folders found');
            vscode.window.showInformationMessage('CodeDocs: Open a project with package.json or requirements.txt to view documentation');
        }
        console.log('CodeDocs extension activated successfully!');
    }
    catch (error) {
        console.error('Error activating CodeDocs extension:', error);
        vscode.window.showErrorMessage(`CodeDocs: Error activating extension: ${error}`);
    }
}
exports.activate = activate;
function deactivate() {
    // Clean up resources
    DocumentationPanel_1.DocumentationPanel.currentPanel?.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map