'use strict';

import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'child_process';
import { getCommandText, getWorkingDir, getConfig, getOS, EXTENSION_NAME, getHistory } from './helpers';

const CUSTOM_COMMANDS_NUMBER = 5;

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand(`${EXTENSION_NAME}.runCommand`, async () => {
		executeCustomCommand(context);
	});

	for (let i = 1; i <= CUSTOM_COMMANDS_NUMBER; i++) {
		vscode.commands.registerCommand(`${EXTENSION_NAME}.quickCommand${i}`, async () => {
			const command = getConfig(`${EXTENSION_NAME}.quickCommand${i}.command`);
			if (!command) {
				vscode.window.showErrorMessage(`Failed to execute quick command${i}: quickCommand${i} is not configured in extension setings`);
				return;
			}
			
			const args = getConfig(`${EXTENSION_NAME}.quickCommand${i}.arguments`) as string[];
			const args_str = args.join(' ');
			await modifySelected(`${command} ${args_str}`, context);
		});
	}
}

async function executeCustomCommand(context: vscode.ExtensionContext) {
	const command = await getCommandText();
	if (!command) return;
	updateHistory(command);

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

	try {
		const outputPromise = selected?.map(input => runCommand(command, input, file));
		const commandOutputs = await Promise.all(outputPromise || []);

		await editor?.edit(editBuilder => {
			editor.selections.forEach((selection, index) => {
				editBuilder.replace(selection, commandOutputs[index]);
			});
		});
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
	}
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
	const shell = getConfig(`${EXTENSION_NAME}.shell.${os}`) as string;
	const shellArgs = getConfig(`${EXTENSION_NAME}.shellArgs.${os}`) as string;
	const commandExecution = spawn(shell, [shellArgs, command], options);
	return runExecution(commandExecution, input);
}

async function runExecution(command: ChildProcess, inputString: string): Promise<string> {
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
			reject(vscode.window.showErrorMessage(`Execution ${EXTENSION_NAME} failed with err: ${err}`));
		});
		command.on('close', code => {
			if (code !== 0) {
				const commandString = command.spawnargs.slice(-1)[0];
				reject(
					vscode.window.showErrorMessage(`Execution ${EXTENSION_NAME} failed with code ${code}: ${commandString}: ${stderrString}`)
				);
			} else {
				resolve(stdoutString);
			}
		});
	});
}

// Function to update and save history to workspaceState
function updateHistory(newCommand: string): void {
    const history = getHistory();
    history.push(newCommand);
    vscode.workspace.getConfiguration().update(`${EXTENSION_NAME}.history`, history, vscode.ConfigurationTarget.Global);
}