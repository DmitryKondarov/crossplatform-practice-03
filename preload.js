const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('api',{
  listDir:dir=>ipcRenderer.invoke('list-dir',dir),
  hideWindow:()=>ipcRenderer.invoke('hide-window')
});
