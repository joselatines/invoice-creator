// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDevEnvironment = process.env.NODE_ENV !== 'production';

// menu template
const templateMenu = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New Product',
				accelerator: 'Ctrl+N',
				click() {},
			},
			{
				label: 'Remove All Products',
				click() {},
			},
			{
				label: 'Exit',
				accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				},
			},
		],
	},
];

if (isDevEnvironment) {
	// reload app on changes
	/* 	require('electron-reload')(__dirname, {
		// reload on changes in .js files
		electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
	});
 */
	// devTools
	templateMenu.push({
		label: 'DevTools',
		submenu: [
			{
				label: 'Show/Hide Dev Tools',
				accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
			{
				role: 'reload',
			},
		],
	});
}

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');


	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
