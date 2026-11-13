const fs = require('node:fs/promises');
const path = require('node:path');
async function listDirectory(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > 4096 || input.includes('\0'))
    return {ok:false, error:'Укажите корректный путь к каталогу.'};
  const resolved = path.resolve(input);
  try {
    const entries = await fs.readdir(resolved, {withFileTypes:true});
    return {ok:true, path:resolved, entries:entries.map(e=>({name:e.name,isDir:e.isDirectory()}))
      .sort((a,b)=>Number(b.isDir)-Number(a.isDir)||a.name.localeCompare(b.name,'ru'))};
  } catch (error) {
    const messages = {ENOENT:'Каталог не найден.',ENOTDIR:'Указанный путь не является каталогом.',EACCES:'Нет доступа к каталогу.',EPERM:'Операция запрещена.'};
    return {ok:false,error:messages[error.code]||'Не удалось прочитать каталог.'};
  }
}
module.exports={listDirectory};
