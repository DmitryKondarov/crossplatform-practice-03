const form=document.querySelector('#form');
const input=document.querySelector('#path');
const list=document.querySelector('#entries');
const status=document.querySelector('#status');
const button=document.querySelector('#refresh');
async function refresh(){
  button.disabled=true;status.textContent='Чтение каталога…';list.replaceChildren();
  try {
    const result=await window.api.listDir(input.value);
    if(!result.ok){status.textContent=result.error;return;}
    document.querySelector('#location').textContent=result.path;
    for(const entry of result.entries){
      const li=document.createElement('li');
      const symbol=document.createElement('span');symbol.className='symbol';symbol.textContent=entry.isDir?'▣':'□';
      const name=document.createElement('span');name.textContent=entry.name;name.className=entry.isDir?'folder':'';
      const type=document.createElement('span');type.className='type';type.textContent=entry.isDir?'Каталог':'Файл';
      li.append(symbol,name,type);list.append(li);
    }
    const dirs=result.entries.filter(e=>e.isDir).length;
    status.textContent=result.entries.length ? `${result.entries.length} объектов · ${dirs} каталогов · ${result.entries.length-dirs} файлов`:'Каталог пуст.';
  } catch {status.textContent='Не удалось связаться с главным процессом.';}
  finally {button.disabled=false;}
}
form.addEventListener('submit',e=>{e.preventDefault();refresh();});
document.querySelector('#hide').addEventListener('click',()=>window.api.hideWindow());
refresh();
