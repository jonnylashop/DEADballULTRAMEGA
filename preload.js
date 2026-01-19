// Preload script para Electron
// Este script se ejecuta antes de cargar la página web

const { contextBridge } = require('electron');

// Exponer APIs seguras al frontend si es necesario
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    version: process.versions.electron
});