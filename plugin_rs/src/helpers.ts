'use strict';

import * as vscode from 'vscode';
import {dirname} from 'path';

const EXTENSION_NAME = "CustomTextModification";

function getOS() {
	const OS_KIND: Record<string, string> = {
		darwin: 'osx',
		linux: 'linux',
		win32: 'windows'
	};
	
	return OS_KIND[process.platform] || OS_KIND.linux;
}

function getConfig(configPath: string) {
	const configPathParts = configPath.split(".");
	const basePath = configPathParts.slice(0, -1).join(".");
	const leafName = configPathParts.slice(-1)[0];
	return vscode.workspace.getConfiguration(basePath).get(leafName);
}

function getWorkingDir(filePath?: string) {
	const configPath = `${EXTENSION_NAME}.currentDirectoryKind`;
	const currentDirectoryKind = getConfig(configPath);

	switch (currentDirectoryKind) {
	case 'currentFile':
		return filePath ? dirname(filePath) : process.env.HOME;

	case 'workspaceRoot':
		return vscode.workspace.workspaceFolders?.[0] || process.env.HOME;

	default:
		throw new Error(`Not found: ${currentDirectoryKind}`);
	}
}

// Function to retrieve history from workspaceState
function getHistory(): string[] {
    const storedHistory = getConfig(`${EXTENSION_NAME}.history`) as string[];
    return storedHistory || [];
}

// Function to display history and prompt user to choose previous arguments
async function chooseFromHistory(): Promise<string | undefined> {
    const history = getHistory();
    const picked = await vscode.window.showQuickPick(history, {
        placeHolder: 'Select from history',
        ignoreFocusOut: true,
    });
    return picked;
}

async function getCommandText(): Promise<string|undefined> {
	// const selectedArgs = await chooseFromHistory();
    // if (!selectedArgs) {
    //     return; // User canceled selection
    // }
    // // Execute command with selectedArgs
	// return vscode.window.showInputBox({
	// 	placeHolder: 'Enter a command',
	// 	prompt: 'No history available yet'
	// });

	const history = getHistory();
	if (history.length === 0) {
		return vscode.window.showInputBox({
			placeHolder: 'Enter a command',
			prompt: 'No history available yet'
		});
	}

	const placeholder = {placeHolder: 'Select a command to reuse or Cancel (Esc) to write a new command'};
	const pickedCommand = await vscode.window.showQuickPick(history.reverse(), placeholder);

	// return this.letUserToModifyCommand(pickedCommand);
	const options = this.getInputBoxOption(pickedCommand);
	return this.vsWindow.showInputBox(options);

	//const history = getHistory();
    const picked = await vscode.window.showQuickPick(history, {
        placeHolder: 'Select from history',
        ignoreFocusOut: true,
    });
    return picked;
}

export {getCommandText, getConfig, getWorkingDir, getOS, EXTENSION_NAME, getHistory};