const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const {listDirectory}=require('../directory');
test('directory listing preserves names, orders folders first and handles errors',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'practice03-'));
 try{await fs.mkdir(path.join(root,'Папка'));await fs.writeFile(path.join(root,'<example>.txt'.replace(/[<>]/g,'_')),'test');
 const r=await listDirectory(root);assert.equal(r.ok,true);assert.equal(r.entries[0].name,'Папка');assert.equal(r.entries[0].isDir,true);assert.equal(r.entries.length,2);
 assert.equal((await listDirectory(path.join(root,'absent'))).ok,false);
 assert.equal((await listDirectory(path.join(root,'_example_.txt'))).ok,false);
 assert.equal((await listDirectory(42)).ok,false);assert.equal((await listDirectory('')).ok,false);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
