// @ts-nocheck
// This script will be run within the webview itself. It cannot access the main VS Code APIs directly,
// so use postMessage to pass information to be subsequently handled by onDidReceiveMessage.

(function () {
    const vscode = acquireVsCodeApi();

    document.addEventListener('click', event => {
        if (!event || !event.target) {
            return;
        }

        let node = event.target;
        while (node) {
            const xDispatchValue = node.getAttribute('x-dispatch');
            if (xDispatchValue) {
                vscode.postMessage({
                    command: 'x-dispatch',
                    xDispatch: xDispatchValue,
                    data: node.title
                });
                event.preventDefault();
                return;
            }
            node = node.parentNode;
        }
    }, true);    
}());
