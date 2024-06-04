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

function getHistory(): string[] {
    const storedHistory = getConfig(`${EXTENSION_NAME}.history`) as string[];
    return storedHistory || [];
}

async function getCommandText(): Promise<string|undefined> {

	const history = getHistory();
	if (history.length === 0) {
		return vscode.window.showInputBox({
			placeHolder: 'Enter a command',
			prompt: 'No history available yet'

		});
	}

	history.push('Enter new command...');

	const placeholder = {
		ignoreFocusOut: true,
		canPickMany: false,
		placeHolder: 'Select a command option'
	};
	vscode.window.showInformationMessage(history.join());
	const pickedCommand = await vscode.window.showQuickPick(history.reverse(), placeholder);

	const options = getInputBoxOption(pickedCommand);
	return vscode.window.showInputBox(options);

}

function getInputBoxOption(pickedCommand?: string) {
	if (pickedCommand == 'Enter new command...' || !pickedCommand) {
		return {placeHolder: 'Enter a command'};
	}
	return {
		placeHolder: 'Enter a command',
		prompt: 'Edit the command if necessary',
		value: pickedCommand
	};
}

export {getCommandText, getConfig, getWorkingDir, getOS, EXTENSION_NAME, getHistory};