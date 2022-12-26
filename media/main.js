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
            const xDispatch = node.getAttribute('x-dispatch');
            const xData = node.getAttribute('x-data');
            if (xDispatch) {
                vscode.postMessage({
                    command: 'x-dispatch',
                    xDispatch,
                    xData,
                });
                event.preventDefault();
                return;
            }
            node = node.parentNode;
        }
    }, true);    
}());
