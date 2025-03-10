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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const vscode = __importStar(require("vscode"));
/**
 * Service to fetch and format documentation from various sources
 */
class DocumentationService {
    /**
     * Searches for documentation for a given dependency
     */
    async searchDocumentation(dependency) {
        try {
            vscode.window.setStatusBarMessage(`CodeDocs: Fetching documentation for ${dependency.name}...`, 3000);
            // For well-known packages, use specialized documentation sources
            if (dependency.name === 'react') {
                return await this.getReactDocs();
            }
            else if (dependency.name === 'axios') {
                return await this.getAxiosDocs();
            }
            else if (dependency.name === 'express') {
                return await this.getExpressDocs();
            }
            // Choose source based on dependency type
            if (dependency.type === 'npm') {
                return await this.searchNpmDocs(dependency.name);
            }
            else if (dependency.type === 'pip') {
                return await this.searchPyPiDocs(dependency.name);
            }
            // Fallback for unknown type
            return this.generateFallbackContent(dependency);
        }
        catch (error) {
            console.error('Error searching documentation:', error);
            return this.generateErrorContent(dependency, error);
        }
    }
    /**
     * Fetch React documentation from React official docs
     */
    async getReactDocs() {
        try {
            return `
                <div style="padding: 20px;">
                    <h1>React</h1>
                    <p>React is a JavaScript library for building user interfaces.</p>
                    
                    <h2>Core React Hooks</h2>
                    <ul>
                        <li><strong>useState</strong> - Adds state to functional components</li>
                        <li><strong>useEffect</strong> - Performs side effects in components</li>
                        <li><strong>useContext</strong> - Accesses context values</li>
                        <li><strong>useReducer</strong> - Manages complex state logic</li>
                        <li><strong>useCallback</strong> - Memoizes callback functions</li>
                        <li><strong>useMemo</strong> - Memoizes computed values</li>
                        <li><strong>useRef</strong> - Creates mutable references</li>
                    </ul>
                    
                    <h2>Creating Components</h2>
                    <pre><code>// Function Component
function Welcome(props) {
  return &lt;h1>Hello, {props.name}&lt;/h1>;
}

// Class Component
class Welcome extends React.Component {
  render() {
    return &lt;h1>Hello, {this.props.name}&lt;/h1>;
  }
}</code></pre>

                    <p>For full documentation, visit <a href="https://react.dev" target="_blank">React Documentation</a></p>
                </div>
            `;
        }
        catch (error) {
            throw new Error(`Failed to fetch React documentation: ${error}`);
        }
    }
    /**
     * Fetch Axios documentation
     */
    async getAxiosDocs() {
        try {
            return `
                <div style="padding: 20px;">
                    <h1>Axios</h1>
                    <p>Promise based HTTP client for the browser and node.js</p>
                    
                    <h2>Making Requests</h2>
                    <pre><code>// GET request
axios.get('/user?ID=12345')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// POST request
axios.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
});</code></pre>

                    <h2>Request Config</h2>
                    <pre><code>// Custom config
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});</code></pre>

                    <p>For full documentation, visit <a href="https://axios-http.com/docs/intro" target="_blank">Axios Documentation</a></p>
                </div>
            `;
        }
        catch (error) {
            throw new Error(`Failed to fetch Axios documentation: ${error}`);
        }
    }
    /**
     * Fetch Express documentation
     */
    async getExpressDocs() {
        try {
            return `
                <div style="padding: 20px;">
                    <h1>Express</h1>
                    <p>Fast, unopinionated, minimalist web framework for Node.js</p>
                    
                    <h2>Basic Usage</h2>
                    <pre><code>const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)</code></pre>

                    <h2>Routing</h2>
                    <pre><code>app.get('/', function (req, res) {
  res.send('GET request to homepage')
})

app.post('/', function (req, res) {
  res.send('POST request to homepage')
})</code></pre>

                    <p>For full documentation, visit <a href="https://expressjs.com" target="_blank">Express Documentation</a></p>
                </div>
            `;
        }
        catch (error) {
            throw new Error(`Failed to fetch Express documentation: ${error}`);
        }
    }
    /**
     * Searches for npm package documentation
     */
    async searchNpmDocs(packageName) {
        try {
            const response = await axios_1.default.get(`${DocumentationService.NPM_URL}/${packageName}`, {
                headers: {
                    'User-Agent': 'CodeDocs-VSCodeExtension/1.0.0'
                }
            });
            const $ = cheerio.load(response.data);
            // Extract readme content
            const readme = $('#readme');
            if (readme.length) {
                let content = readme.html() || '<p>No documentation content found</p>';
                // Make all links absolute
                content = content.replace(/href="(?!http)/g, `href="${DocumentationService.NPM_URL}/${packageName}/`);
                // Add header with package info
                const header = `
                <div style="padding: 10px; margin-bottom: 20px; background: var(--vscode-editor-background);">
                    <h1>${packageName}</h1>
                    <p>Documentation from npm registry</p>
                    <a href="${DocumentationService.NPM_URL}/${packageName}" target="_blank">View on npmjs.com</a>
                </div>`;
                return header + content;
            }
            return this.generateFallbackContent({ name: packageName, version: 'latest', type: 'npm' });
        }
        catch (error) {
            throw new Error(`Failed to fetch NPM documentation: ${error}`);
        }
    }
    /**
     * Searches for PyPI package documentation
     */
    async searchPyPiDocs(packageName) {
        try {
            const response = await axios_1.default.get(`${DocumentationService.PYPI_URL}/${packageName}`, {
                headers: {
                    'User-Agent': 'CodeDocs-VSCodeExtension/1.0.0'
                }
            });
            const $ = cheerio.load(response.data);
            // Extract description content
            const description = $('.project-description');
            if (description.length) {
                let content = description.html() || '<p>No documentation content found</p>';
                // Make all links absolute
                content = content.replace(/href="(?!http)/g, `href="${DocumentationService.PYPI_URL}/${packageName}/`);
                // Add header with package info
                const header = `
                <div style="padding: 10px; margin-bottom: 20px; background: var(--vscode-editor-background);">
                    <h1>${packageName}</h1>
                    <p>Documentation from PyPI registry</p>
                    <a href="${DocumentationService.PYPI_URL}/${packageName}" target="_blank">View on PyPI.org</a>
                </div>`;
                return header + content;
            }
            return this.generateFallbackContent({ name: packageName, version: 'latest', type: 'pip' });
        }
        catch (error) {
            throw new Error(`Failed to fetch PyPI documentation: ${error}`);
        }
    }
    /**
     * Generates fallback content when documentation can't be found
     */
    generateFallbackContent(dependency) {
        return `
        <div style="padding: 20px; text-align: center;">
            <h1>${dependency.name}</h1>
            <p>Version: ${dependency.version}</p>
            <p>Sorry, we couldn't find detailed documentation for this package.</p>
            <p>Try visiting the official website or repository for more information:</p>
            ${dependency.type === 'npm'
            ? `<p><a href="${DocumentationService.NPM_URL}/${dependency.name}" target="_blank">View on npmjs.com</a></p>`
            : `<p><a href="${DocumentationService.PYPI_URL}/${dependency.name}" target="_blank">View on PyPI</a></p>`}
        </div>
        `;
    }
    /**
     * Generates error content when documentation fetching fails
     */
    generateErrorContent(dependency, error) {
        return `
        <div style="padding: 20px; color: #ff0000;">
            <h1>Error Fetching Documentation</h1>
            <p>Could not fetch documentation for ${dependency.name}@${dependency.version}</p>
            <p>Error: ${error.message || 'Unknown error'}</p>
            <p>Please try again later or check if the package exists.</p>
            ${dependency.type === 'npm'
            ? `<p>You can try visiting <a href="${DocumentationService.NPM_URL}/${dependency.name}" target="_blank">npmjs.com</a> directly.</p>`
            : `<p>You can try visiting <a href="${DocumentationService.PYPI_URL}/${dependency.name}" target="_blank">PyPI</a> directly.</p>`}
        </div>
        `;
    }
}
exports.DocumentationService = DocumentationService;
// Primary documentation sources
DocumentationService.NPM_URL = 'https://www.npmjs.com/package';
DocumentationService.PYPI_URL = 'https://pypi.org/project';
// Alternative documentation sources
DocumentationService.MDN_URL = 'https://developer.mozilla.org/en-US/search?q=';
DocumentationService.DEVDOCS_URL = 'https://devdocs.io/';
DocumentationService.REACT_DOCS_URL = 'https://react.dev/reference/react';
//# sourceMappingURL=DocumentationService.js.map