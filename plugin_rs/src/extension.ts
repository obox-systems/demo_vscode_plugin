'use strict';

import * as vscode from 'vscode';
import { getCommandText, getConfig, getOS, EXTENSION_NAME, getHistory } from './helpers';
import { modifyWithCommand } from '../custom_command/index';

const CUSTOM_COMMANDS_NUMBER = 5;

// // Define a key for storing history
// const HISTORY_KEY = `${EXTENSION_NAME}.history`;

// // Function to retrieve history from workspaceState
// function getHistory(): string[] {
//     const storedHistory = getConfig(`${EXTENSION_NAME}.history`) as string[];
//     return storedHistory || [];
// }

export async function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand(`${EXTENSION_NAME}.runCommand`, async () => {
		const command = await getCommandText();
		if (!command) return;
		//vscode.window.showWarningMessage(command);
		updateHistory(command);

		await modifySelected(command);
	});

	for (let i = 1; i <= CUSTOM_COMMANDS_NUMBER; i++) {
		vscode.commands.registerCommand(`${EXTENSION_NAME}.quickCommand${i}`, async () => {
			const command = getConfig(`${EXTENSION_NAME}.quickCommand${i}.command`);
			if (!command) {
				vscode.window.showErrorMessage(`Failed to execute quick command${i}: quickCommand${i} is not configured in extension setings`);
				return;
			}
			
			const args = getConfig(`${EXTENSION_NAME}.quickCommand${i}.arguments`);
			await modifySelected(`${command} ${args}`);
		});
	}
}

async function modifySelected(command: string): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.selection;
	if (!editor || !selection || selection.isEmpty) {
		return;
	}
	const uri = editor?.document.uri;
	const file = uri?.scheme === 'file' ? uri.fsPath : undefined;
	let selected =  editor?.selections.map(selection => editor.document.getText(selection));
	
    try {
        const outputPromises = selected.map(input => runCommand(command, input, file));
        const commandOutputs = await Promise.all(outputPromises);

        await editor.edit(editBuilder => {
            editor.selections.forEach((selection, index) => {
                editBuilder.replace(selection, commandOutputs[index]);
            });
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
    }
}

async function runCommand(command: string, input: string, filePath: string|undefined): Promise<string> {
	const os = getOS();
	const shell = getConfig(`CustomTextModification.shell.${os}`) as string;
	const shellArgs = getConfig(`CustomTextModification.shellArgs.${os}`) as string[];
	const result = modifyWithCommand(shell, shellArgs, command, input);
	return result;
}

// Function to update and save history to workspaceState
function updateHistory(newCommand: string): void {
	vscode.window.showWarningMessage(newCommand);
	vscode.window.showWarningMessage("modifing plugin history");
    const history = getHistory();
    history.push(newCommand);
    vscode.workspace.getConfiguration().update(`${EXTENSION_NAME}.history`, history, vscode.ConfigurationTarget.Global);
}