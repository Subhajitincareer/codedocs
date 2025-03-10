import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Dependency } from '../types/Dependency';

export class ProjectAnalyzer {
    public async analyzeDependencies(projectPath: string): Promise<Dependency[]> {
        const dependencies: Dependency[] = [];
        vscode.window.setStatusBarMessage('CodeDocs: Analyzing project dependencies...', 3000);

        try {
            // Check if the path is a file or directory
            const stats = fs.statSync(projectPath);
            
            if (stats.isFile()) {
                // If it's a file, analyze based on file type
                const filename = path.basename(projectPath).toLowerCase();
                const directory = path.dirname(projectPath);
                
                if (filename === 'package.json') {
                    const npmDeps = await this.analyzeNpmDependencies(projectPath);
                    dependencies.push(...npmDeps);
                } else if (filename === 'requirements.txt') {
                    const pipDeps = await this.analyzePipDependencies(projectPath);
                    dependencies.push(...pipDeps);
                }
            } else if (stats.isDirectory()) {
                // Check for package.json (Node.js/npm projects)
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const npmDeps = await this.analyzeNpmDependencies(packageJsonPath);
                    dependencies.push(...npmDeps);
                }

                // Check for requirements.txt (Python/pip projects)
                const requirementsPath = path.join(projectPath, 'requirements.txt');
                if (fs.existsSync(requirementsPath)) {
                    const pipDeps = await this.analyzePipDependencies(requirementsPath);
                    dependencies.push(...pipDeps);
                }
            }

            vscode.window.setStatusBarMessage(`CodeDocs: Found ${dependencies.length} dependencies`, 3000);
            return dependencies;
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing dependencies: ${error}`);
            console.error('Error analyzing dependencies:', error);
            return [];
        }
    }

    private async analyzeNpmDependencies(packageJsonPath: string): Promise<Dependency[]> {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const dependencies: Dependency[] = [];

            // Process dependencies
            if (packageJson.dependencies) {
                Object.entries(packageJson.dependencies).forEach(([name, version]) => {
                    dependencies.push({
                        name,
                        version: (version as string).replace('^', '').replace('~', ''),
                        type: 'npm'
                    });
                });
            }

            // Process devDependencies
            if (packageJson.devDependencies) {
                Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
                    dependencies.push({
                        name,
                        version: (version as string).replace('^', '').replace('~', ''),
                        type: 'npm'
                    });
                });
            }

            return dependencies;
        } catch (error) {
            console.error('Error analyzing npm dependencies:', error);
            return [];
        }
    }

    private async analyzePipDependencies(requirementsPath: string): Promise<Dependency[]> {
        try {
            const content = fs.readFileSync(requirementsPath, 'utf8');
            const dependencies: Dependency[] = [];

            content.split('\n').forEach(line => {
                // Skip empty lines and comments
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    return;
                }

                // Handle different requirement formats
                let name = trimmedLine;
                let version = 'latest';

                // Parse version specifiers
                const versionSpecifiers = ['==', '>=', '<=', '>', '<', '~=', '!=', '==='];
                for (const specifier of versionSpecifiers) {
                    if (trimmedLine.includes(specifier)) {
                        const parts = trimmedLine.split(specifier);
                        name = parts[0].trim();
                        version = parts[1]?.trim() || 'latest';
                        break;
                    }
                }

                // Handle requirements with no version
                if (name === trimmedLine) {
                    // Remove any options (e.g., package[option])
                    const bracketIndex = name.indexOf('[');
                    if (bracketIndex > 0) {
                        name = name.substring(0, bracketIndex);
                    }
                }

                dependencies.push({
                    name,
                    version,
                    type: 'pip'
                });
            });

            return dependencies;
        } catch (error) {
            console.error('Error analyzing pip dependencies:', error);
            return [];
        }
    }
} 