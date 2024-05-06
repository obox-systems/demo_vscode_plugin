'use strict';

import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'child_process';
import { getCommandText, getConfig, getWorkingDir, getOS } from './helpers' ;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.runCustomCommand', () => {
		executeCustomCommand(context);
	}));
}

async function executeCustomCommand(context: vscode.ExtensionContext) {
	const command = await getCommandText();
	if (!command) return;

	await modifySelected(command, context);
}

async function modifySelected(command: string, context: vscode.ExtensionContext): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.selection;
	if (!editor || !selection || selection.isEmpty) {
		return;
	}
	const uri = editor?.document.uri;
	const file = uri?.scheme === 'file' ? uri.fsPath : undefined;

	let selected =  editor?.selections.map(selection => editor.document.getText(selection));

	const outputPromise = selected?.map(input => runCommand(command, input, file));
	const commandOutputs = await Promise.all(outputPromise || []);

	await editor?.edit(editBuilder => {
		editor.selections.forEach((selection, index) => {
			editBuilder.replace(selection, commandOutputs[index]);
		});
	});
}

async function runCommand(command: string, input: string, filePath: string|undefined): Promise<string> {

	const options = {
		dir: getWorkingDir(filePath),
		env: {
			...process.env,
			ES_SELECTED: input
		}
	};

	const os = getOS();
	const shell = getConfig(`extension.shell.${os}`) as string;
	const shellArgs = getConfig(`extension.shellArgs.${os}`) as string;
	const commandExecution = spawn(shell, [shellArgs, command], options);
	return runExecution(commandExecution, input);
}

async function runExecution(command: ChildProcess, inputString: string): Promise<string> {
	vscode.window.showInformationMessage(inputString);
	let stdoutString = '';
	let stderrString = '';

	command.stdin?.write(inputString);
	command.stdin?.end();

	command.stdout?.on('data', data => {
		stdoutString += data.toString();
	});
	command.stderr?.on('data', data => {
		stderrString += data.toString();
	});

	return new Promise((resolve, reject) => {
		command.on('error', err => {
			reject(vscode.window.showErrorMessage(`Execution failed with err: ${err}`));
		});
		command.on('close', code => {
			if (code !== 0) {
				const commandString = command.spawnargs.slice(-1)[0];
				reject(
					vscode.window.showErrorMessage(`Execution failed with code ${code}: ${commandString}: ${stderrString}`)
				);
			} else {
				resolve(stdoutString);
			}
		});
	});
}