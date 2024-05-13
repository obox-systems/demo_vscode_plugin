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

async function getCommandText(): Promise<string|undefined> {
	return vscode.window.showInputBox({
		placeHolder: 'Enter a command',
		prompt: 'No history available yet'
	});
}

export {getCommandText, getConfig, getWorkingDir, getOS, EXTENSION_NAME};