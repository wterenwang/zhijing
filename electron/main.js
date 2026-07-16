const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startServer } = require('./server');

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {{ close: () => Promise<void>, url: string } | null} */
let localServer = null;

function contentRoot() {
  // 开发：项目根；打包后：asar 内与 electron 同级的资源
  return path.join(__dirname, '..');
}

async function createWindow() {
  localServer = await startServer(contentRoot(), 3000);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: '知径',
    backgroundColor: '#f0f4f8',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  await mainWindow.loadURL(localServer.url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow).catch((err) => {
    console.error(err);
    app.quit();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('before-quit', async (e) => {
    if (localServer) {
      e.preventDefault();
      const s = localServer;
      localServer = null;
      try {
        await s.close();
      } catch (_) {
        /* ignore */
      }
      app.exit(0);
    }
  });
}
