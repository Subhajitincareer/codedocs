import * as vscode from 'vscode';
import { getNonce } from '../utils/getNonce';
import { DocumentationService } from '../services/DocumentationService';
import { Dependency } from '../types/Dependency';

export class DocumentationPanel {
    public static currentPanel: DocumentationPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private readonly _documentationService: DocumentationService;

    private constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {
        this._documentationService = new DocumentationService();
        this._panel = vscode.window.createWebviewPanel(
            'codedocs',
            'Documentation',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(_extensionUri, 'media'),
                    vscode.Uri.joinPath(_extensionUri, 'out'),
                    vscode.Uri.joinPath(_extensionUri, 'resources')
                ]
            }
        );

        // Set initial HTML content
        this._panel.webview.html = this._getWebviewContent();

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'search':
                        await this.search(message.text);
                        break;
                }
            },
            null,
            this._disposables
        );

        // Clean up resources when panel is closed
        this._panel.onDidDispose(
            () => {
                this.dispose();
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri): DocumentationPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DocumentationPanel.currentPanel) {
            DocumentationPanel.currentPanel._panel.reveal(column);
            return DocumentationPanel.currentPanel;
        }

        DocumentationPanel.currentPanel = new DocumentationPanel(extensionUri);
        return DocumentationPanel.currentPanel;
    }

    public async search(query: string | Dependency): Promise<void> {
        try {
            this._panel.webview.postMessage({
                command: 'updateStatus',
                content: 'Searching...'
            });

            let documentation: string;
            if (typeof query === 'string') {
                // Handle direct text search (to be implemented)
                documentation = `Searching for documentation on: ${query}... <br/><br/>Text search is coming in a future update. Please select a package from the sidebar for now.`;
            } else {
                // Handle dependency object
                this._panel.title = `Documentation: ${query.name}`;
                documentation = await this._documentationService.searchDocumentation(query);
            }

            await this._panel.webview.postMessage({
                command: 'updateContent',
                content: documentation
            });
        } catch (error) {
            console.error('Error searching documentation:', error);
            vscode.window.showErrorMessage(`Error searching documentation: ${error}`);
            await this._panel.webview.postMessage({
                command: 'updateContent',
                content: `Error: ${error}`
            });
        }
    }

    private _getWebviewContent() {
        const webview = this._panel.webview;
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource} https:; connect-src https:;">
            <title>Documentation</title>
            <style>
                body {
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                    background-color: var(--vscode-editor-background);
                    line-height: 1.6;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                .search-container {
                    margin-bottom: 20px;
                    position: sticky;
                    top: 0;
                    background-color: var(--vscode-editor-background);
                    padding: 10px 0;
                    z-index: 100;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                #searchInput {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: 4px;
                }
                .content {
                    line-height: 1.6;
                    word-wrap: break-word;
                }
                .status {
                    margin: 10px 0;
                    padding: 8px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-left: 4px solid var(--vscode-textBlockQuote-border);
                }
                pre {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 1em;
                    overflow-x: auto;
                    border-radius: 4px;
                }
                code {
                    font-family: var(--vscode-editor-font-family);
                    font-size: 0.9em;
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                }
                a {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                }
                a:hover {
                    color: var(--vscode-textLink-activeForeground);
                    text-decoration: underline;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 1em 0;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                th, td {
                    border: 1px solid var(--vscode-panel-border);
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: var(--vscode-editor-background);
                }
                .welcome {
                    text-align: center;
                    margin: 3em auto;
                    max-width: 600px;
                }
                .welcome h1 {
                    margin-bottom: 0.5em;
                }
            </style>
        </head>
        <body>
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Search documentation...">
                <div id="status" class="status" style="display: none;"></div>
            </div>
            <div class="content" id="content">
                <div class="welcome">
                    <h1>CodeDocs Documentation Viewer</h1>
                    <p>Select a package from the sidebar to view its documentation.</p>
                    <p>You can also select text in your code and press Ctrl+Shift+D (or Cmd+Shift+D on Mac) to search for documentation.</p>
                </div>
            </div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                const searchInput = document.getElementById('searchInput');
                const statusEl = document.getElementById('status');
                const contentEl = document.getElementById('content');
                
                searchInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        vscode.postMessage({
                            command: 'search',
                            text: searchInput.value
                        });
                    }
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateStatus':
                            statusEl.textContent = message.content;
                            statusEl.style.display = 'block';
                            break;
                        case 'updateContent':
                            contentEl.innerHTML = message.content;
                            statusEl.style.display = 'none';
                            // Add event listeners to all links
                            document.querySelectorAll('a').forEach(link => {
                                if (link.href && link.href.startsWith('http')) {
                                    link.setAttribute('target', '_blank');
                                }
                            });
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        DocumentationPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
} 