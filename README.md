# VSCode plugin demo

Plugin that modifies text using shell utilities.

## In Rust
Implemented using `napi-rs` - a framework for building compiled Node.js add-ons in Rust via Node-API. 

#### Structure:
 - src/ - contains extension source functions that interact with VSCode API 
 - custom_command/ - contains Napi project with Rust source files that will be build into native module for Node.js

#### To build:
1. Go to project directory:
```bash
cd ./plugin_rs
```
2. Install extension dependencies
```bash
npm install
```
3. Build Rust module:
```bash
cd custom_command
```
- install dependencies with
```bash
yarn install
```
- install `napi` cli
```bash
npm install -g @napi-rs/cli
```
- build module
```bash
napi build --platform --release
```

#### To run in debug mode:
When plugin is built, it can be run in debug mode to test functionality.
1. Open `extension.ts` in VSCode and run with F5.
2. Select text to modify and open `Command Palette` by pressing `Ctrl` + `Shift` + `P` or by navigating to `View` -> `Command Palette` in VSCode menu.
3. Select `CustomTextModification: Modify text with utility` and select command from history or type command in window.

#### To build extension package:
1. Install Visual Studio Code Extensions command line tool `vsce`:
```bash
npm install -g @vscode/vsce
```
2. Build extension package:
```bash
vsce package
```
3. Run in VSCode:
- switch to `Extensions` panel
- select `Install from VSIX` in menu
- select .vsix package created by previous command

## In TypeScript
Implemented with plain TypeScript. 

#### Structure:
 - src/ - contains extension source functions that interact with VSCode API.

#### To build:
1. Go to project directory:
```bash
cd ./plugin_ts
```
2. Install extension dependencies
```bash
npm install
```

#### To run in debug mode:
When plugin is built, it can be run in debug mode to test functionality.
1. Open `extension.ts` in VSCode and run with F5.
2. Select text to modify and open `Command Palette` by pressing `Ctrl` + `Shift` + `P` or by navigating to `View` -> `Command Palette` in VSCode menu.
3. Select `CustomTextModification: Modify text with utility` and select command from history or type command in window.

#### To build extension package:
1. Install Visual Studio Code Extensions command line tool `vsce`:
```bash
npm install -g @vscode/vsce
```
2. Build extension package:
```bash
vsce package
```
3. Run in VSCode:
- switch to `Extensions` panel
- select `Install from VSIX` in menu
- select .vsix package created by previous command
