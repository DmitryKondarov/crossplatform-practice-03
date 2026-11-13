const {app,BrowserWindow,ipcMain,Tray,Menu,nativeImage} = require('electron');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {listDirectory} = require('./directory');
let win, tray, quitting=false;
const page=pathToFileURL(path.join(__dirname,'index.html')).href;
function showWindow(){
  if(!win || win.isDestroyed()) createWindow();
  if(win.isMinimized()) win.restore();
  win.show(); win.focus();
}
function createWindow(){
  win=new BrowserWindow({width:1050,height:740,minWidth:720,minHeight:520,
    title:'Практика 3 — Кондаров',icon:path.join(__dirname,'assets/icon.ico'),
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',event=>event.preventDefault());
  win.webContents.session.setPermissionRequestHandler((_web,_permission,callback)=>callback(false));
  win.on('close',event=>{if(!quitting){event.preventDefault();win.hide();}});
  win.on('closed',()=>{win=null;});
  win.loadFile('index.html');
}
function trusted(event){return win && event.sender===win.webContents && event.senderFrame===win.webContents.mainFrame && event.senderFrame.url===page;}
ipcMain.handle('list-dir',async(event,dir)=>{
  if(!trusted(event)) return {ok:false,error:'Недопустимый источник запроса.'};
  return listDirectory(dir);
});
ipcMain.handle('hide-window',event=>{if(trusted(event)){win.hide();return true;}return false;});
app.on('before-quit',()=>{quitting=true;});
app.whenReady().then(async()=>{
  createWindow();
  const icon=nativeImage.createFromPath(path.join(__dirname,'assets/icon.ico'));
  tray=new Tray(icon);
  tray.setToolTip('Файловый обозреватель — Кондаров');
  tray.setContextMenu(Menu.buildFromTemplate([{label:'Показать',click:showWindow},{type:'separator'},{label:'Выйти',click:()=>app.quit()}]));
  tray.on('double-click',showWindow);
  app.on('activate',showWindow);
  if(process.argv.includes('--review-tray')) setTimeout(()=>tray.popUpContextMenu(undefined,{x:760,y:330}),1800);
  if(process.argv.includes('--smoke-test')) {
    const fs=require('node:fs/promises');
    await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    const wait=()=>new Promise(resolve=>setTimeout(resolve,600));await wait();
    const results=await win.webContents.executeJavaScript(`(async()=>({requireType:typeof require,api:typeof window.api.listDir,valid:await window.api.listDir('.'),invalid:await window.api.listDir(42),missing:await window.api.listDir('__missing_practice_03__')}))()`);
    results.versions=process.versions;results.trayAlive=!tray.isDestroyed();
    await fs.mkdir(path.join(__dirname,'evidence'),{recursive:true});
    await fs.writeFile(path.join(__dirname,'evidence/window.png'),(await win.webContents.capturePage()).toPNG());
    win.close();results.hiddenOnClose=!win.isVisible();showWindow();results.restored=win.isVisible();
    await fs.writeFile(path.join(__dirname,'evidence/smoke.json'),JSON.stringify(results,null,2));
    app.quit();
  }
}).catch(error=>{console.error(error);app.exit(1);});
// Tray keeps the application alive when the window is hidden.
app.on('window-all-closed',()=>{if(!tray && process.platform!=='darwin')app.quit();});
app.on('will-quit',()=>{if(tray&&!tray.isDestroyed())tray.destroy();});
