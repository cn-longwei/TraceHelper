"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const http = require("http");
const fs = require("fs");
const child_process = require("child_process");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld-sample" is now active!');
    let panel = vscode.window.createWebviewPanel("HelloWorld", "HelloWorld", vscode.ViewColumn.One, {
        enableScripts: true,
        enableCommandUris: false,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'ui'))],
    });
    let disposables = [];
    panel.webview.onDidReceiveMessage(message => {
        switch (message.command) {
            case 'alert':
                vscode.window.showErrorMessage(message.text);
                return;
        }
    }, null, disposables);
    panel.onDidDispose(() => {
        panel.dispose();
        while (disposables.length) {
            const x = disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }, null, disposables);
    let options = {
        protocol: "http:",
        auth: null,
        host: "127.0.0.1:8090",
        hostname: "127.0.0.1",
        port: 8090,
        method: "GET",
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    };
    function evalHtml(html) {
        // convert relative "src", "href" paths to absolute
        let linkReg = /(src|href)\s*=\s*([`"'])(.+?)\2/ig;
        let base = path.join(context.extensionPath, 'ui');
        html = html.replace(linkReg, (match, ...subs) => {
            let file = subs[2];
            if (!path.isAbsolute(file))
                file = path.join(base, file);
            if (!fs.existsSync(file))
                return match;
            let uri = panel.webview.asWebviewUri(vscode.Uri.file(file));
            return `${subs[0]}=${subs[1]}${uri}${subs[1]}`;
        });
        return html;
    }
    let process = child_process.spawn("python", ["-m", "SimpleHTTPServer", "8090"]);
    console.log(`Congratulations, your extension "helloworld-sample" is now active!${process.pid}`);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('extension.helloWorld', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
        let file = path.join(context.extensionPath, 'ui', 'ui.html');
        panel.webview.html = evalHtml(fs.readFileSync(file).toString());
        if (!panel.visible) {
            panel.reveal();
        }
        let p = new Promise((resolve, reject) => {
            let haserr = false;
            let responseCallback = (res) => {
                res.on('data', function (chunk) {
                    panel.webview.postMessage({
                        refresh: true,
                        content: chunk.toString()
                    });
                });
            };
            let req = undefined;
            try {
                req = http.request(options, responseCallback);
            }
            catch (error) {
                console.log(error);
            }
            req.on('error', (err) => {
                haserr = true;
                console.log(`http erroe!${err}`);
                ;
            });
            req.on('close', () => {
                if (haserr) {
                    reject("failed to receive");
                }
                console.log(`http erroe!`);
            });
            req.end();
        });
        await p.then(() => { });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map