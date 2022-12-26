import * as vscode from 'vscode';
import { homedir } from 'os';

const defaultSettings: Settings = {
	panel: {
		title: 'Welcome',
	},
	productName: 'Visual Studio Code',
	tagLine: 'Editing evolved',
	groups: []
};

class CustomWelcomePagePanel {
	public static currentPanel: CustomWelcomePagePanel | undefined;
	public static readonly viewType = 'customWelcomePage';

	private readonly _panel!: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _settings: Settings;
	private readonly repositoryGroups: RepositoryGroup[];
	private _disposables: vscode.Disposable[] = [];

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, settings: Settings) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._settings = settings;
		this.repositoryGroups = this._settings.groups;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			event => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'x-dispatch':
						const [ , , command] = message.xDispatch.match(/([^:]+):([^\.]+)$/);
						this.handleCommand(command, message.xData);
						return;

					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	private handleCommand(command: string, data: string) {
		switch (command) {
			// Unfortunately, commands need to know how to interpret data. For example, converting strings into Uri
			case 'openFolder':
				const folderUri = vscode.Uri.parse(data);
				vscode.commands.executeCommand('vscode.openFolder', folderUri);
				break;
		}
	}

	/**
	 * Enable javascript in the webview and restrict the webview to only loading content from our 
	 * extension's `media` directory and the configured resourceDirectory.
	 * 
	 * @param extensionUri 
	 * @param settings 
	 */
	private static getWebviewOptions(extensionUri: vscode.Uri, settings: Settings): vscode.WebviewOptions {
		return {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(extensionUri, 'media'),
				vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist'),
				vscode.Uri.joinPath(extensionUri, 'node_modules/'),
				// TODO: [main] What if it's really null?
				vscode.Uri.file(settings.resourceDirectory!)
			]
		};
	}

	public static createOrShow(extensionUri: vscode.Uri) {
		const settings: Settings = vscode.workspace.getConfiguration().get('custom-welcome-page') || defaultSettings;

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CustomWelcomePagePanel.currentPanel) {
			CustomWelcomePagePanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CustomWelcomePagePanel.viewType,
			'Custom Welcome Page',
			column || vscode.ViewColumn.One,
			this.getWebviewOptions(extensionUri, settings),
		);

		CustomWelcomePagePanel.currentPanel = new CustomWelcomePagePanel(panel, extensionUri, settings);
	}

	public dispose() {
		CustomWelcomePagePanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	private _update() {
		this._panel.title = this._settings.panel.title;
		this._panel.iconPath = this._settings.panel.iconPath ? vscode.Uri.parse(this._settings.panel.iconPath) : undefined;
		this._panel.webview.html = this._getHtmlForWebview();
	}

	private _getHtmlForWebview() {
		const webview = this._panel.webview;

		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const vscodeStylesMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
		const extensionStylesMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'extension.css');
		const codiconsStylesMainPath = vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const vscodeStylesMainUri = webview.asWebviewUri(vscodeStylesMainPath);
		const extensionStylesMainUri = webview.asWebviewUri(extensionStylesMainPath);
		const codiconsStylesMainUri = webview.asWebviewUri(codiconsStylesMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		const headHtml = `
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
					style-src ${webview.cspSource}; 
					font-src ${webview.cspSource}; 
					img-src ${webview.cspSource} https:; 
					script-src 'nonce-${nonce}';
					">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${vscodeStylesMainUri}" rel="stylesheet">
				<link href="${extensionStylesMainUri}" rel="stylesheet">
				<link href="${codiconsStylesMainUri}" rel="stylesheet" />
			</head>
		`;

		const headerHtml = `
			<div class="header">
				<h1 class="product-name caption">${this._settings.productName}</h1>
				<p class="subtitle description">${this._settings.tagLine}</p>
			</div>`;
		const startHtml = this.getHtmlForStart();
		const repositoryGroupsHtml = this.getHtmlForRepositoryGroups(this.repositoryGroups);
		const footerHtml = `
			<div class="footer">
			</div>`;

		const bodyHtml = `
			<body>
				<div class="custom-welcome-page">
					<div class="custom-welcom-page-container">
						<div class="custom-welcome-page-slide">
							<div class="custom-welcome-page-categories-container">
								${headerHtml}
								${startHtml}
								${repositoryGroupsHtml}
								${footerHtml}
							</div>
						</div>
					</div>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		`;

		return `
			<!DOCTYPE html>
			<html lang="en">
				${headHtml}
				${bodyHtml}
			</html>
		`;
	}

	private getHtmlForRepositoryGroups(repositoryGroups: RepositoryGroup[]): string {
		return `
			<div class="categories-column categories-column-right">
				<div class="index-list start-container">
					<h2>Folders</h2>
					${repositoryGroups.map(repositoryGroup => this.htmlForRepositoryGroup(repositoryGroup)).join('\n')}
				</div>
			</div>`;
	}

	private htmlForRepositoryGroup(group: RepositoryGroup): string {
		const repositoriesHtml = group.repositories.map(repository => this.htmlForRepository(repository)).join('\n');
		const localImgHtml = group.iconPath
			? `<img src="${this.pathAsWebviewUri(group.iconPath)}"></img>`
			: '';
		return `
			${localImgHtml}
			<h3>${group.title}</h3>
			<ul>
			${repositoriesHtml}
			</ul>
			`;
	}
	
	private pathAsWebviewUri(path: string): vscode.Uri {
		let uri = vscode.Uri.parse(path);
		if (uri.scheme === 'file') {
			uri = vscode.Uri.parse(`${this._settings.resourceDirectory}/${path}`);
		}
		const webview = this._panel.webview;
		const webViewUri = webview.asWebviewUri(uri);
		return webViewUri;
	}
	
	private htmlForRepository(repository: Repository): string {
		// Standard welcome page has the location. It doesn't seem appealing to me.
		// <span class="path detail" title="${repository.location}">${repository.location}</span>

		const xDispatch = `customWelcomePage:openFolder`;
		const xData = repository.location.replace('~/', `${homedir()}/`);

		// onclick is handled by hook in main.js
		return `
			<li>
				<button class="button-link" x-dispatch="${xDispatch}" x-data="${xData}" title="${repository.location}" aria-label="Open folder ${repository.location}">${repository.title}</button>
			</li>
		`;
	}	

	private getHtmlForStart(): string {
		return	`
			<div class="categories-column categories-column-left">
				<div class="index-list start-container">
					<h2>Start</h2>
					<ul style="overflow: hidden;">
						<li>
							<!-- is x-dispatch how vscode handles the messaging of commands? -->
							<button class="button-link" x-dispatch="selectStartEntry:welcome.showNewFileEntries" title="Open a new untitled file, notebook, or custom editor. (⌃⌥⌘N)">
								<div class="codicon codicon-new-file icon-widget"></div>
								<span>New File...</span>
							</button>
						</li>
						<li>
							<button class="button-link" x-dispatch="selectStartEntry:topLevelOpenMac" title="Open a file or folder to start working (⌘O)">
								<div class="codicon codicon-folder-opened icon-widget"></div>
								<span>Open...</span>
							</button>
						</li>
						<li>
							<button class="button-link" x-dispatch="selectStartEntry:topLevelGitClone" title="Clone a remote repository to a local folder ">
								<div class="codicon codicon-source-control icon-widget"></div>
								<span>Clone Git Repository...</span>
							</button>
						</li>
						<li>
							<button class="button-link" x-dispatch="selectStartEntry:topLevelShowWalkthroughs" title="View a walkthrough on the editor or an extension ">
								<div class="codicon codicon-checklist icon-widget"></div>
								<span>Open a Walkthrough...</span></button>
						</li>
					</ul>
				</div>
			</div>`;
	}
	
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('custom-welcome-page.start', () => {
			CustomWelcomePagePanel.createOrShow(context.extensionUri);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

