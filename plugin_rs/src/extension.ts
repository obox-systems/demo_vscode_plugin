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
