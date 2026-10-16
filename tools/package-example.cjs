// New-project example using the real versioned GitHub dependency.
// Existing projects should add the extension URL instead of importing this file.
// node tools/package-example.cjs <node_modules>
const fs=require('fs'),path=require('path'),lz=require(path.resolve(process.argv[2],'lzma'));
const root=path.resolve(__dirname,'..'),version=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8')).version;
const config={name:'oled-student-example',dependencies:{core:'*','tc-oled':'github:fd159-hub/pxt-tc-oled#v'+version},files:['main.ts','main.blocks'],preferredEditor:'blocksprj',supportedTargets:['microbit']};
const files={'pxt.json':JSON.stringify(config,null,2),'main.ts':fs.readFileSync(path.join(root,'test.ts'),'utf8'),'main.blocks':fs.readFileSync(path.join(root,'tests/test.blocks'),'utf8')};
const payload=JSON.stringify({meta:{cloudId:'pxt/microbit',name:'中文 OLED 詞句選單範例',editor:'blocksprj'},source:JSON.stringify(files)});
lz.compress(payload,7,(b,e)=>{if(e)throw e;const bytes=Buffer.from(b);lz.decompress(bytes,(actual,e)=>{if(e||actual!==payload)throw Error('Roundtrip failed');fs.writeFileSync(path.join(root,'../oled-student-example-v'+version+'.mkcd'),bytes);console.log('Versioned GitHub example PASS: '+bytes.length+' bytes');});});
