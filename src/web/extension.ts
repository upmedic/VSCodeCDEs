// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cdes" is now running!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cdes.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from cdes!');
	});
	vscode.workspace.onDidChangeTextDocument(e => {
		const editor = vscode.window.activeTextEditor;
		if (e.contentChanges.some(c=>c.text.includes('\n'))){
			return; // do not react when newlines are added, we listen for text additions
		}
		console.log(e);
		if (!editor){ return};
		if(!e.document.fileName.endsWith('.cde.json')){
			return;
		}
		if(editor?.selection.isEmpty && editor.selection.isSingleLine){
			const position = editor.selection.active;
			console.log('cursor position', position);
			console.log(e.document.getText(new vscode.Range(editor.selection.start, editor.selection.end)));

			const lineText = e.document.lineAt(position.line);
			const splitOnQuote = lineText.text.split('"');

			//we look for patterns when val is a string so it is the 4 th elem of split line on '"':
			//{
			//	"key": "val"
			//}
			//
			if (splitOnQuote.length >= 4){
				const val = splitOnQuote[3];
				console.log('extracted:', val);

				if (val.length>0){
					setQuery(val.trim());
				}
			}
			else{
				console.log("line", position.line, "is not proper for parsing", lineText);
			}

		}
	});
	let webViewPanel:vscode.WebviewPanel|null = null;

	const setQuery = (search:string) => {
		if (webViewPanel){
			const q = encodeURIComponent(search);
			webViewPanel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>

			<style>
			body {
				margin: 0;
				padding: 0;
				background-color: white;
			}
			</style>
			<meta charset="utf-8" />
			<title>upmedic AnatomicLocation search</title>
			</head>
			<body>
			<iframe style="width: 100vw; height: 100vh;" src="https://www.upmedic.io/anatomiclocations?q=${q}" title="AnatomicLocations search by upmedic"></iframe>

			</body>
			</html>
			`;
		}
		
	};



	const startExtension = ()=> {
		webViewPanel = vscode.window.createWebviewPanel(
			'cdessearch', // Identifies the type of the webview. Used internally
			'AnatomicStructures.org search', // Title of the panel displayed to the user
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			}
		
		  );
		  setQuery('');
	};


	let startWebViewCommand = vscode.commands.registerCommand('cdes.search', startExtension);

	context.subscriptions.push(disposable);
	context.subscriptions.push(startWebViewCommand);
	startExtension();
}

// This method is called when your extension is deactivated
export function deactivate() {}



function trim (s:string, c:string) {
	if (c === "]") {c = "\\]";}
	if (c === "^") {c = "\\^";}
	if (c === "\\") {c = "\\\\";}
	return s.replace(new RegExp(
	  "^[" + c + "]+|[" + c + "]+$", "g"
	), "");
  }
  
