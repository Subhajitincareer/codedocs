import * as vscode from 'vscode';
import { Dependency } from '../types/Dependency';

export class DocumentationProvider implements vscode.TreeDataProvider<DependencyItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DependencyItem | undefined | null | void> = new vscode.EventEmitter<DependencyItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DependencyItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private dependencies: Dependency[] = [];

    constructor(private context: vscode.ExtensionContext) {
        // Log that provider is being constructed
        console.log('DocumentationProvider constructor called');
    }

    refresh(): void {
        console.log('Refreshing tree view with', this.dependencies.length, 'dependencies');
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DependencyItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DependencyItem): Thenable<DependencyItem[]> {
        if (!element) {
            // We're getting the root elements
            if (this.dependencies.length === 0) {
                // If there are no dependencies, show a message
                const noDepItem = new DependencyItem(
                    'No dependencies found',
                    '',
                    vscode.TreeItemCollapsibleState.None,
                    this.context.extensionUri
                );
                noDepItem.contextValue = 'no-dependencies';
                return Promise.resolve([noDepItem]);
            }
            
            return Promise.resolve(this.dependencies.map(dep => {
                const item = new DependencyItem(
                    dep.name,
                    dep.version,
                    vscode.TreeItemCollapsibleState.None,
                    this.context.extensionUri
                );
                
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

    updateDependencies(dependencies: Dependency[]) {
        console.log('Updating dependencies:', dependencies.length);
        this.dependencies = dependencies;
        this.refresh();
    }
}

class DependencyItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private extensionUri: vscode.Uri
    ) {
        super(label, collapsibleState);
        
        if (version) {
            this.tooltip = `${this.label}@${this.version}`;
            this.description = this.version;
        } else {
            this.tooltip = this.label;
        }
        
        // Set the icon path
        this.iconPath = {
            light: this.getIconPath('light'),
            dark: this.getIconPath('dark')
        };
    }

    contextValue = 'dependency';

    private getIconPath(theme: 'light' | 'dark'): vscode.Uri {
        try {
            return vscode.Uri.joinPath(this.extensionUri, 'resources', theme, 'dependency.svg');
        } catch (error) {
            console.error('Error getting icon path:', error);
            // Return a fallback icon
            return vscode.Uri.parse(`https://raw.githubusercontent.com/microsoft/vscode-icons/master/icons/${theme}/file-pdf.svg`);
        }
    }
} 