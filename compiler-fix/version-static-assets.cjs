const fs=require('fs'),path=require('path'),crypto=require('crypto');
function version(site){for(const f of fs.readdirSync(site).filter(f=>f.endsWith('.html'))){let s=fs.readFileSync(path.join(site,f),'utf8');for(const name of ['pxtapp.js','pxtlib.js','pxtembed.js','pxtworker.js','target.js']){const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex').slice(0,12);s=s.split('/pxt-tc-oled/'+name+'"').join('/pxt-tc-oled/'+name+'?v='+hash+'"');}fs.writeFileSync(path.join(site,f),s);}}
if(require.main===module)version(path.resolve(__dirname,'../outputs/utf8-editor/pxt-tc-oled'));
module.exports=version;
