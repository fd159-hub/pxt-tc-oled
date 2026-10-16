// Self-contained project for reviewing the student blocks before publication.
// This is a starter project, not a URL extension installation into an old project.
// node tools/package-preview.cjs <node_modules>
const fs=require('fs'),path=require('path'),lz=require(path.resolve(process.argv[2],'lzma'));
const root=path.resolve(__dirname,'..'),cfg=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8'));
const files={};for(const name of cfg.files)files[name]=fs.readFileSync(path.join(root,name),'utf8');
cfg.name='oled-student-preview';cfg.files.push('main.ts','main.blocks');cfg.testFiles=[];cfg.preferredEditor='blocksprj';delete cfg.public;
files['pxt.json']=JSON.stringify(cfg,null,2);files['main.ts']=fs.readFileSync(path.join(root,'test.ts'),'utf8');files['main.blocks']=fs.readFileSync(path.join(root,'tests/test.blocks'),'utf8');
if(files['main.blocks'].includes('typescript_statement'))throw Error('Grey block');
const payload=JSON.stringify({meta:{cloudId:'pxt/microbit',name:'中文 OLED 學生介面預覽',editor:'blocksprj'},source:JSON.stringify(files)});
lz.compress(payload,7,(bytes,error)=>{if(error)throw error;const data=Buffer.from(bytes);lz.decompress(data,(actual,error)=>{if(error||actual!==payload)throw Error('Roundtrip failed');fs.writeFileSync(path.join(root,'../oled-student-preview-v0.2.0.mkcd'),data);console.log('Self-contained preview project PASS: '+data.length+' bytes; not an extension URL.');});});
