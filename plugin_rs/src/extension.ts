'use strict';

import * as vscode from 'vscode';
import { getCommandText, getConfig, getOS } from './helpers' ;
import { modifyWithCommand } from '../custom_command/index'

export async function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('extension.runCustomCommand', async () => {
		const command = await getCommandText();
		if (!command) return;

		await modifySelected(command);
	});

	vscode.commands.registerCommand('extension.quickCommand1', async () => {
		const command = getConfig("extension.quickCommand1.command");
		if (!command) {
			vscode.window.showErrorMessage(`Failed to execute quick command1: quickCommand1 is not configured`);
			return;
		}
			
		const args = getConfig("extension.quickCommand1.arguments");
		await modifySelected(`${command} ${args}`);
	});

	vscode.commands.registerCommand('extension.quickCommand2', async () => {
		const command = getConfig("extension.quickCommand2.command");
		if (!command) {
			vscode.window.showErrorMessage(`Failed to execute quick command2: quickCommand2 is not configured`);
			return;
		}
			
		const args = getConfig("extension.quickCommand2.arguments");
		await modifySelected(`${command} ${args}`);
	});

	vscode.commands.registerCommand('extension.quickCommand3', async () => {
		const command = getConfig("extension.quickCommand3.command");
		if (!command) {
			vscode.window.showErrorMessage(`Failed to execute quick command3: quickCommand3 is not configured`);
			return;
		}
			
		const args = getConfig("extension.quickCommand3.arguments");
		await modifySelected(`${command} ${args}`);
	});

	vscode.commands.registerCommand('extension.quickCommand4', async () => {
		const command = getConfig("extension.quickCommand4.command");
		if (!command) {
			vscode.window.showErrorMessage(`Failed to execute quick command4: quickCommand4 is not configured`);
			return;
		}
			
		const args = getConfig("extension.quickCommand4.arguments");
		await modifySelected(`${command} ${args}`);
	});

	vscode.commands.registerCommand('extension.quickCommand5', async () => {
		const command = getConfig("extension.quickCommand5.command");
		if (!command) {
			vscode.window.showErrorMessage(`Failed to execute quick command5: quickCommand5 is not configured`);
			return;
		}
			
		const args = getConfig("extension.quickCommand5.arguments");
		await modifySelected(`${command} ${args}`);
	});
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
	const shell = getConfig(`extension.shell.${os}`) as string;
	const shellArgs = getConfig(`extension.shellArgs.${os}`) as string[];
	const result = modifyWithCommand(shell, shellArgs, command, input);
	return result;
}
