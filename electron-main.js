const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Puerto del servidor backend
const PORT = 3000;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'build', 'icon.png'),
        title: 'DEADball Ultra Mega',
        show: false // No mostrar hasta que esté listo
    });

    // Crear menú personalizado
    const menuTemplate = [{
            label: 'Juego',
            submenu: [
                { role: 'reload', label: 'Recargar' },
                { type: 'separator' },
                { role: 'quit', label: 'Salir' }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [{
                    label: 'Instrucciones',
                    click: () => {
                        mainWindow.loadURL(`http://localhost:${PORT}/frontend/menu.html`);
                    }
                },
                { type: 'separator' },
                { label: 'Versión 1.0.0', enabled: false }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Esperar a que el servidor esté listo antes de cargar
    setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${PORT}/frontend/index.html`);
        mainWindow.show();
    }, 2000);

    // Abrir DevTools en desarrollo (comentar en producción)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackendServer() {
    console.log('Iniciando servidor backend...');

    const serverPath = path.join(__dirname, 'backend', 'server.js');

    // Iniciar el servidor Node.js
    serverProcess = spawn('node', [serverPath], {
        cwd: path.join(__dirname, 'backend'),
        env: {...process.env, PORT: PORT }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`[SERVER]: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[SERVER ERROR]: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Servidor cerrado con código ${code}`);
    });
}

function stopBackendServer() {
    if (serverProcess) {
        console.log('Deteniendo servidor backend...');
        serverProcess.kill();
        serverProcess = null;
    }
}

// Eventos de la aplicación
app.on('ready', () => {
    startBackendServer();
    createWindow();
});

app.on('window-all-closed', () => {
    stopBackendServer();
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    stopBackendServer();
});

// Manejo de errores
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});