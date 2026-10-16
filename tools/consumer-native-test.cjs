// Verify that this extension compiles as an ordinary dependency, not as a
// replacement student project. node tools/consumer-native-test.cjs <modules> <stage>
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),modules=path.resolve(process.argv[2]),stage=path.resolve(process.argv[3]);
assert(stage!==root);fs.mkdirSync(stage,{recursive:true});
const source=fs.readFileSync(path.join(root,'test.ts'),'utf8');fs.writeFileSync(path.join(stage,'main.ts'),source);
fs.writeFileSync(path.join(stage,'pxt.json'),JSON.stringify({name:'classroom-oled-test',dependencies:{core:'*','tc-oled':'file:'+path.relative(stage,root).replace(/\\/g,'/')},files:['main.ts'],supportedTargets:['microbit']},null,2));
const result=cp.spawnSync(process.execPath,['-e',`require(${JSON.stringify(path.join(modules,'pxt-core/built/pxt.js'))}).mainCli(${JSON.stringify(path.join(modules,'pxt-microbit'))},['build','--install'])`],{cwd:stage,encoding:'utf8'});
fs.writeFileSync(path.join(root,'tests/consumer-native.log'),result.stdout+'\n'+result.stderr);assert.equal(result.status,0,'Native dependency build failed');assert.equal(fs.readFileSync(path.join(stage,'main.ts'),'utf8'),source);
const asm=fs.readFileSync(path.join(stage,'built/mbcodal-binary.asm'),'utf8'),capacity=asm.match(/total bytes: (\d+).*?with (\d+) free/);assert(capacity);assert(Number(capacity[2])>=16384);
assert(fs.readFileSync(path.join(stage,'built/mbdal-binary.asm'),'utf8').includes('compilation disabled'));
let literals=0;for(const file of ['common-font.ts',...Array.from({length:8},(_,i)=>`font-bank-${i}.ts`)])for(const m of fs.readFileSync(path.join(root,file),'utf8').matchAll(/hex`([0-9a-f]+)`/g)){assert(asm.toLowerCase().includes(m[1]));literals++;}assert.equal(literals,11);
const bytes=fs.readFileSync(path.join(stage,'built/mbcodal-binary.hex'));
const report={success:true,dependencyInstall:true,mainSourceUnchanged:true,targetVersions:require(path.join(modules,'pxt-microbit/built/target.json')).versions,usedFlash:+capacity[1],freeFlash:+capacity[2],fontLiterals:literals,v1Disabled:true,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),studentInterfaceHardwareTested:false,rendererDiagnosticHardwarePass:'user reported; separate firmware; see HARDWARE-ACCEPTANCE.md'};
fs.writeFileSync(path.join(root,'tests/consumer-native.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
