// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const player = require('play-sound')();
const path = require('path');
const fs = require('fs');
const { promisify} = require('util');
const stat = promisify(fs.stat);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

let playing;
let currentTrack = '';

const play = (file) => {
	if(currentTrack && currentTrack === file) return;
	currentTrack = file;
	playing && playing.kill()
	const filePath = path.join(__dirname, `./audio/${file}.mp3`);
	playing = player.play(filePath, {}, (err) => {
		if (err) {
			console.error("Error playing sound:", filePath, " - Description:", err);
		}
	});
	return playing;
}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pokecode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pokecode.background', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Starting Pokémon music');


		let onOpenDisposer = vscode.workspace.onDidOpenTextDocument(onOpen);
		let onChangeDisposer = vscode.languages.onDidChangeDiagnostics(onDidChangeDiagnostics);
		context.subscriptions.push(onOpenDisposer);
		context.subscriptions.push(onChangeDisposer);
	});

	let disposable2 = vscode.commands.registerCommand('pokecode.stop', function () {
		// The code you place here will be executed every time your command is executed
		playing && playing.kill();
 
		// Display a message box to the user
		vscode.window.showInformationMessage('Stopping music');

		
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);

}

function onDidChangeDiagnostics(event) {
	const diagnostics = vscode.languages.getDiagnostics(event.uris)
	const severe = diagnostics.filter(d => d.severity < 2);
	if(severe.length > 5) {
		play('battle-gym');
		vscode.window.showInformationMessage(`${vscode.window.activeTextEditor.activeDocument.document.fileName} has ${severe.length} errors`);
	} else if(severe.length > 3) {
		play('battle-trainer');
		vscode.window.showInformationMessage(`${vscode.window.activeTextEditor.activeDocument.document.fileName} has ${severe.length} errors`);
	} else if (severe.length) {
		play('battle-wild');
		vscode.window.showInformationMessage(`Wild Error appeared! ${severe[0].message}`);
	} else if (currentTrack.includes('battle'))  {
		vscode.window.showInformationMessage(`Error fainted!!`);
		play(currentTrack.replace('battle', 'victory'));
	}
}

async function onOpen() {
	const activeDocument = vscode.window.activeTextEditor;
	if(activeDocument) {
		const file = activeDocument.document.fileName;
		const fileStat = await stat(file);

		// Haunted forest ~= older than one year, and large
		const isHaunted = (Date.now() - fileStat.mtimeMs > 31536000000) && fileStat.size > 30000;

		const isReadme = activeDocument.document.fileName.toLowerCase().includes('readme.md');
		if(isHaunted) {
			play('lavender');
			vscode.window.showInformationMessage('Entering a haunted forest in Lavender Town...');
		} else if (isReadme) {
			play('opening')
		} else if (activeDocument.document.languageId.endsWith('scss')) { 
			play('celadon');
		} else if (activeDocument.document.languageId === 'html') { 
			play('pewter');
		} else {
			play('pallettown');
		}

	}
}


// this method is called when your extension is deactivated
function deactivate() {
	player && player.kill();
}

module.exports = {
	activate,
	deactivate
}
