// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';
import * as child_process from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld-sample" is now active!');
	let panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
		"HelloWorld",
		"HelloWorld",
		vscode.ViewColumn.One,
		<vscode.WebviewOptions>{
			enableScripts: true,
			enableCommandUris: false,
			retainContextWhenHidden: true,
			localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'ui'))],
		}
	);
	let disposables: vscode.Disposable[] = [];
	panel.webview.onDidReceiveMessage(
		message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
			}
		},
		null,
		disposables
	);

	panel.onDidDispose(() => {
		panel.dispose();
		while (disposables.length) {
			const x = disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}, null, disposables);

	let options = <http.RequestOptions>{
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
    function evalHtml(html: string): string {
        // convert relative "src", "href" paths to absolute
        let linkReg = /(src|href)\s*=\s*([`"'])(.+?)\2/ig;
        let base: string = path.join(context.extensionPath, 'ui');
        html = html.replace(linkReg, (match, ...subs) => {
            let file = subs[2] as string;
            if (!path.isAbsolute(file)) file = path.join(base, file);
			if (!fs.existsSync(file)) return match;
            let uri = panel.webview.asWebviewUri(vscode.Uri.file(file));
            return `${subs[0]}=${subs[1]}${uri}${subs[1]}`;
        });
        return html;
    }

	let process : any =child_process.spawn("python",["-m","SimpleHTTPServer","8090"]);
	console.log(`Congratulations, your extension "helloworld-sample" is now active!${process.pid}`);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('extension.helloWorld',async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
		let file = path.join(context.extensionPath, 'ui','ui.html');
		panel.webview.html = evalHtml(fs.readFileSync(file).toString());
		if(!panel.visible){
			panel.reveal();
		}
		let p = new Promise<Buffer>((resolve, reject) => {
			let haserr:boolean = false;

			let responseCallback = (res: http.IncomingMessage) => {
				res.on('data', function (chunk: Buffer) {
					panel.webview.postMessage({
						refresh: true,
						content: chunk.toString()
					})
				});
			}
			let req:any = undefined;
			try{
				req = http.request(options, responseCallback);
			}catch(error){
				console.log(error);
			}

			req.on('error', (err: Error) => {
				haserr = true;
				console.log(`http erroe!${err}`);;
			});
			req.on('close', ()=>{
				if(haserr){
					reject("failed to receive");
				}
				console.log(`http erroe!`);
			});
			req.end();
		});
		await p.then(()=>{});
	});
	context.subscriptions.push(disposable)
}
