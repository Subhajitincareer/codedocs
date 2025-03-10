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
exports.DocumentationProvider = void 0;
const vscode = __importStar(require("vscode"));
class DocumentationProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.dependencies = [];
        // Log that provider is being constructed
        console.log('DocumentationProvider constructor called');
    }
    refresh() {
        console.log('Refreshing tree view with', this.dependencies.length, 'dependencies');
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // We're getting the root elements
            if (this.dependencies.length === 0) {
                // If there are no dependencies, show a message
                const noDepItem = new DependencyItem('No dependencies found', '', vscode.TreeItemCollapsibleState.None, this.context.extensionUri);
                noDepItem.contextValue = 'no-dependencies';
                return Promise.resolve([noDepItem]);
            }
            return Promise.resolve(this.dependencies.map(dep => {
                const item = new DependencyItem(dep.name, dep.version, vscode.TreeItemCollapsibleState.None, this.context.extensionUri);
                // Set command directly on the tree item
                item.command = {
                    command: 'codedocs.showDocs',
                    title: 'Show Documentation',
                    arguments: [dep]
                };
                return item;
            }));
        }
        // This provider doesn't have child items
        return Promise.resolve([]);
    }
    updateDependencies(dependencies) {
        console.log('Updating dependencies:', dependencies.length);
        this.dependencies = dependencies;
        this.refresh();
    }
}
exports.DocumentationProvider = DocumentationProvider;
class DependencyItem extends vscode.TreeItem {
    constructor(label, version, collapsibleState, extensionUri) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.extensionUri = extensionUri;
        this.contextValue = 'dependency';
        if (version) {
            this.tooltip = `${this.label}@${this.version}`;
            this.description = this.version;
        }
        else {
            this.tooltip = this.label;
        }
        // Set the icon path
        this.iconPath = {
            light: this.getIconPath('light'),
            dark: this.getIconPath('dark')
        };
    }
    getIconPath(theme) {
        try {
            return vscode.Uri.joinPath(this.extensionUri, 'resources', theme, 'dependency.svg');
        }
        catch (error) {
            console.error('Error getting icon path:', error);
            // Return a fallback icon
            return vscode.Uri.parse(`https://raw.githubusercontent.com/microsoft/vscode-icons/master/icons/${theme}/file-pdf.svg`);
        }
    }
}
//# sourceMappingURL=DocumentationProvider.js.map