'use strict';

import * as vscode from 'vscode';

interface CustomCommand {
    alias: string;
    path: string;
	detail: string;
    label: string;
	keybinding: string;
}

// Function to dynamically assign keybindings
function assignKeybindings(keybinding: string, alias: string) {
    // Define the keybinding
    //const keybinding = 'ctrl+shift+h';

    // Register the keybinding
    const disposable = vscode.commands.registerCommand('extension.assignKeybinding', () => {
        vscode.commands.executeCommand('setContext', 'dynamicKeybinding', true); // Set context
        vscode.commands.executeCommand('workbench.action.openGlobalKeybindings'); // Open keybindings settings
    });
	vscode.window.showErrorMessage(keybinding);
    // Execute the command to open keybindings settings
    vscode.commands.executeCommand('extension.assignKeybinding').then(() => {
        // Add keybinding in the opened keybindings settings
        vscode.commands.executeCommand('workbench.action.openGlobalKeybindings').then(() => {
            vscode.commands.executeCommand('editor.action.addKeybinding', {
                keybinding,
                command: `extension.${alias}`,
                when: 'dynamicKeybinding' // Condition to apply keybinding
            });
        });
    });

    return disposable;
}

// Function to handle configuration changes
function handleConfigurationChange(context: vscode.ExtensionContext, event: vscode.ConfigurationChangeEvent) {
    if (event.affectsConfiguration('customModification.custom')) {
        // The 'customModification.custom' setting has changed
        // Perform actions in response to the change
		registerAliasCommands(context);
    }
}

// Function to register commands for each alias
function registerAliasCommands(context: vscode.ExtensionContext) {
	// Get the configuration for the current workspace
	const config = vscode.workspace.getConfiguration();

	// Get the value of customModification.custom from the configuration
	const custom = config.get<CustomCommand[]>('customModification.custom') || [];

	// Get the current keybindings configuration
	//const currentKeybindings: { key: string, command: string }[] = vscode.workspace.getConfiguration('keyboard').get('customKeybindings') || [];

	// Register a command for each alias
	custom.forEach((customCommand) => {
		const alias = customCommand.alias;
		const utility = customCommand.path;
		const command = vscode.commands.registerCommand(`extension.${alias}`, () => executeAliasCommand(alias, utility));
		context.subscriptions.push(command);

		const keybinding = customCommand.keybinding;

		// if(keybinding) {
		// 	vscode.window.showErrorMessage(keybinding);
		// 	// Assign keybindings dynamically
		// 	const disposable = assignKeybindings(keybinding, alias);
		// 	context.subscriptions.push(disposable);
		// }

		// // Define the new keybinding
		// const newKeybinding = {
		// 	key: keybinding,
		// 	command: `extension.${alias}`
		// };
	
		// // Add the new keybinding to the configuration
		// currentKeybindings.push(newKeybinding);
	});
	
	// Update the keybindings configuration
	//vscode.workspace.getConfiguration('keyboard').update('customKeybindings', currentKeybindings, vscode.ConfigurationTarget.Global);
}

// Function to execute the command associated with the alias
async function executeAliasCommand(alias: string, utility: string) {
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.selection;
	if (!editor || !selection || selection.isEmpty) {
		return;
	}

	// Get the configuration for the current workspace
	const config = vscode.workspace.getConfiguration();

	const highlightedRange = new vscode.Range(selection.start, selection.end);
	const highlightedText = editor.document.getText(highlightedRange);

	const { exec } = require('child_process');
	exec(utility + ' ' + highlightedText, (err: any, stdout: any, stderr: any) => {
		if (err) {
			vscode.window.showErrorMessage(`Error: ${err}`);
			// console.error(`Error executing ${binaryPath}: ${err}`);
			return;
		}

		if (stderr) {
			vscode.window.showErrorMessage(`Error: ${stderr}`);
			// console.error(`Error executing ${binaryPath}: ${err}`);
			return;
		}

		editor.edit(editBuilder => {
			editBuilder.replace(highlightedRange, stdout + ' ' + utility);
		});
	});
}

// Function to select the command by its keybinding
async function selectAliasCommand(keybinding: string) {

	// Get the configuration for the current workspace
	const config = vscode.workspace.getConfiguration();

	// Get the value of customModification.custom from the configuration
	const custom = config.get<CustomCommand[]>('customModification.custom') || [];

	// Create an array of QuickPick items representing custom commands
	let customCommands: vscode.QuickPickItem[] = [];

	let utility: string;
	// Register a command for each alias
	custom.forEach((customCommand) => {
		//const alias = customCommand.alias;
		const commandUtility = customCommand.path;
		//const label = customCommand.label || alias;
		const commandKeybinding = customCommand.keybinding;
		if(commandKeybinding == keybinding) {
			utility = commandUtility;
		}
	});

	return utility;
}

const listCommandsCommand = vscode.commands.registerCommand('extension.listCustomCommands', () => {

	// Get the configuration for the current workspace
	const config = vscode.workspace.getConfiguration();

	// Get the value of customModification.custom from the configuration
	const custom = config.get<CustomCommand[]>('customModification.custom') || [];

	// Create an array of QuickPick items representing custom commands
	let customCommands: vscode.QuickPickItem[] = [];
	// Register a command for each alias
	custom.forEach((customCommand) => {
		const alias = customCommand.alias;
		const utility = customCommand.path;
		const label = customCommand.label || alias;
		const detail = customCommand.detail || 'Modify with ' + utility;
		customCommands.push({ label, detail })
	});

    // Show the QuickPick menu to the user
    vscode.window.showQuickPick(customCommands).then(selectedItem => {
        if (selectedItem) {
			custom.forEach((customCommand) => {
				const label = customCommand.label || customCommand.alias;
				if (selectedItem.label == label) {
					executeAliasCommand(customCommand.alias, customCommand.path)
				}
			});
        }
    });
});

const executeCustomCommand = vscode.commands.registerCommand('extension.customKeybings', () => {

	// Get the configuration for the current workspace
	const config = vscode.workspace.getConfiguration();

	// Get the value of customModification.custom from the configuration
	const custom = config.get<CustomCommand[]>('customModification.custom') || [];

	// Create an array of QuickPick items representing custom commands
	let customCommands: vscode.QuickPickItem[] = [];
	// Register a command for each alias
	custom.forEach((customCommand) => {
		const alias = customCommand.alias;
		const utility = customCommand.path;
		const keybinding = customCommand.keybinding;
		const label = customCommand.label || alias;
		const detail = customCommand.detail || 'Modify with ' + utility;
		customCommands.push({ label, detail })
	});

    // Show the QuickPick menu to the user
    vscode.window.showQuickPick(customCommands).then(selectedItem => {
        if (selectedItem) {
			custom.forEach((customCommand) => {
				const label = customCommand.label || customCommand.alias;
				if (selectedItem.label == label) {
					executeAliasCommand(customCommand.alias, customCommand.path)
				}
			});
        }
    });
});

export function activate(context: vscode.ExtensionContext) {
	registerAliasCommands(context);

	// Subscribe to the configuration change event
	//const disposable = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => { handleConfigurationChange(context, event);});
	context.subscriptions.push(listCommandsCommand);
	// Add the disposable to the context subscriptions so it gets disposed when the extension is deactivated
	//context.subscriptions.push(disposable);

	    // Register the command without contributing it to the Command Palette
		context.subscriptions.push(vscode.commands.registerCommand('extension.customPlaceholder3', () => {
			vscode.window.showErrorMessage("placeholder 3");
			//handleMyCommand();
		}));
}