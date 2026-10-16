// Usage: node tools/pxt-test.cjs <path-to-node_modules>
const fs=require('fs'),path=require('path');
const modules=path.resolve(process.argv[2]||'node_modules');require(path.join(modules,'pxt-core/built/pxt.js'));
const target=require(path.join(modules,'pxt-microbit/built/target.json'));pxt.setAppTarget(target);
const root=path.resolve(__dirname,'..'),fileSystem={},sourceFiles=[];
const core=target.bundledpkgs.core;for(const name of JSON.parse(core['pxt.json']).files)if(name.endsWith('.ts')&&core[name]!=null){const key='pxt_modules/core/'+name;fileSystem[key]=core[name];sourceFiles.push(key);}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8'));for(const name of [...cfg.files,'test.ts'].filter(n=>n.endsWith('.ts'))){fileSystem[name]=fs.readFileSync(path.join(root,name),'utf8');sourceFiles.push(name);}
const opts={fileSystem,sourceFiles,target:{...target.compile,isNative:false},ast:true},result=ts.pxtc.compile(opts);
const diagnostics=result.diagnostics.map(d=>({code:d.code,message:d.messageText,file:d.fileName,line:d.line}));
fs.writeFileSync(path.join(root,'tests/pxt-compile.json'),JSON.stringify({success:result.success,targetVersions:target.versions,diagnostics,hardwareTested:false},null,2));
if(!result.success)throw Error(JSON.stringify(diagnostics));
const blocks=ts.pxtc.decompile(result.ast,opts,'test.ts');if(!blocks.success)throw Error(JSON.stringify(blocks.diagnostics));
const text=blocks.outfiles['test.blocks'];if(!text||text.includes('typescript_statement'))throw Error('Missing blocks or grey block');
fs.writeFileSync(path.join(root,'tests/test.blocks'),text);fs.writeFileSync(path.join(root,'tests/pxt-blocks.json'),JSON.stringify({success:true,greyBlocks:false,note:'Decompilation only; native Chinese encoding is still blocked.'},null,2));
console.log('PXT TypeScript compile + Blocks decompile PASS. This does not verify native Chinese.');
