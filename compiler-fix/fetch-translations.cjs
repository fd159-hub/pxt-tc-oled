// Public MakeCode translations. Run after build.cjs; no credentials required.
const fs=require('fs'),path=require('path');
const root=path.join(path.resolve(process.env.OLED_OUTPUT_ROOT||path.join(__dirname,'../../utf8-editor')),'pxt-tc-oled/locales/zh-TW');
fs.mkdirSync(root,{recursive:true});
(async()=>{for(const [file,remote]of [['strings.json','strings.json'],['target-strings.json','microbit/target-strings.json'],['bundled-strings.json','microbit/bundled-strings.json'],['sim-strings.json','microbit/sim-strings.json']]){const r=await fetch('https://makecode.com/api/translations?lang=zh-TW&filename='+encodeURIComponent(remote)+'&approved=true');if(!r.ok)throw Error('Translations '+r.status);const t=await r.text();JSON.parse(t);fs.writeFileSync(path.join(root,file),t);console.log(file);}})().catch(e=>{console.error(e.message);process.exitCode=1;});
