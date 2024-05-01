'use strict';

import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {

	const custom = vscode.commands.registerCommand('extension.modifySelected', function() {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		if (!editor || !selection || selection.isEmpty) {
			return;
		}

		const highlightedRange = new vscode.Range(selection.start, selection.end);
		const highlightedText = editor.document.getText(highlightedRange);

		const { exec } = require('child_process');
		const binaryPath = 'test_command';
		exec(binaryPath + ' ' + highlightedText, (err: any, stdout: any, stderr: any) => {
			if (err) {
				console.error(`Error executing ${binaryPath}: ${err}`);
				return;
			}

			editor.edit(editBuilder => {
				editBuilder.replace(highlightedRange, stdout);
			});
		});
	});

	context.subscriptions.push(custom);
}