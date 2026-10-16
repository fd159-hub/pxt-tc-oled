// Run the actual renderer against a virtual SSD1306. This is NOT a hardware test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
require(path.resolve(process.argv[2]||'node_modules/pxt-core','built/pxt.js'));
const root=path.resolve(__dirname,'..'),manifest=require(path.join(root,'tests/font-manifest.json'));
let ram=Buffer.alloc(1024),writes=[],column=0,page=0,start=0,end=127,endPage=7;
const pins={createBuffer:n=>Buffer.alloc(n),i2cWriteBuffer:(address,b)=>{
 assert.equal(address,60);writes.push([...b]);
 if(b[0]===0){if(b[1]===0x21){start=column=b[2];end=b[3];assert.equal(b[4],0x22);page=b[5];endPage=b[6];assert(start>=0&&end<128&&page>=0&&endPage<8);}}
 else{assert.equal(b[0],0x40);assert(b.length<=17);for(const value of b.subarray(1)){ram[page*128+column]=value;if(++column>end){column=start;if(++page>endPage)page=endPage;}}}
}};
const context=vm.createContext({pins,Math,hex:s=>Buffer.from(s[0],'hex')});
for(const file of JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8')).files.filter(f=>f.endsWith('.ts')))vm.runInContext(ts.transpile(fs.readFileSync(path.join(root,file),'utf8')),context);
const api=context.tcOLED,checks=[];function check(name,fn){fn();checks.push(name);}
check('未啟用時拒絕顯示',()=>{api.showLine(1,'你好');assert.equal(api.lastError(),'NOT_INITIALIZED');});
check('一鍵啟用載入完整字庫並首次同步1024 bytes',()=>{api.start();assert.equal(api.lastError(),'');assert.equal(api.bytesSent(),1024);});
check('全部4943個字形逐像素解壓與點陣SHA256一致',()=>{
 const chars=Array.from(fs.readFileSync(path.join(root,'sources/included-characters.txt'),'utf8')),hash=crypto.createHash('sha256');
 assert.equal(chars.length,4943);
 for(const ch of chars){writes=[];api.showLine(1,ch);assert.equal(api.lastError(),'');const bytes=Buffer.alloc(32),w=ch.charCodeAt(0)<127?8:16;ram.copy(bytes,0,0,w);ram.copy(bytes,w,128,128+w);hash.update(bytes);}
 assert.equal(hash.digest('hex'),manifest.bitmapSha256);
});
check('四組中文字及數字標點混排',()=>{api.showLine(1,'你好世界');api.showLine(2,'六年級');api.showLineNumber(3,'今天溫度',25);api.showLine(4,'恭喜過關！');assert.equal(api.lastError(),'');assert(ram.some(v=>v));});
let digitBytes=0;
check('25變26只傳變動欄且保留其他三行',()=>{const before=Buffer.from(ram);writes=[];api.showLineNumber(3,'今天溫度',26);digitBytes=api.bytesSent();assert(digitBytes>0&&digitBytes<=16);assert.deepEqual(ram.subarray(0,512),before.subarray(0,512));assert.deepEqual(ram.subarray(768),before.subarray(768));for(const b of writes.filter(b=>b[0]===0)){assert(b[2]>=72&&b[3]<80);assert(b[5]>=4&&b[5]<=5);}});
check('相同畫面零傳輸',()=>{writes=[];api.showLineNumber(3,'今天溫度',26);assert.equal(api.bytesSent(),0);assert.equal(writes.length,0);});
check('文字縮短清掉尾字',()=>{api.showLine(1,'你');for(const p of [0,1])assert(ram.subarray(p*128+16,p*128+128).every(v=>v===0));});
check('清除單行保留其他行',()=>{const before=Buffer.from(ram);api.clearLine(2);assert(ram.subarray(256,512).every(v=>v===0));assert.deepEqual(ram.subarray(0,256),before.subarray(0,256));assert.deepEqual(ram.subarray(512),before.subarray(512));});
check('行號與長度錯誤不修改畫面',()=>{const before=Buffer.from(ram);for(const n of [0,5,1.5]){api.showLine(n,'你好');assert.equal(api.lastError(),'LINE_RANGE');}api.showLine(1,'一二三四五六七八九');assert.equal(api.lastError(),'LINE_OVERFLOW');assert.deepEqual(ram,before);});
check('罕用字顯示方框並回報缺字',()=>{api.showLine(1,'龘');assert.equal(api.lastError(),'MISSING_GLYPH');assert.equal(api.missingCharacters(),'龘');assert(ram.subarray(0,16).some(v=>v));});
check('非法字庫拒絕且原字庫仍可用',()=>{assert.equal(api.loadCommonFont(Buffer.alloc(2),Buffer.alloc(2),Buffer.alloc(4),[]),false);assert.equal(api.loadCommonFont(Buffer.from([65,0]),Buffer.alloc(2),Buffer.alloc(4),[Buffer.alloc(1)]),false);api.showLine(1,'你好');assert.equal(api.lastError(),'');});
check('重現原生字串截斷是已知失敗案例',()=>{const low=Array.from('你好世界',c=>String.fromCharCode(c.charCodeAt(0)&255)).join('');api.showLine(1,low);assert.equal(api.lastError(),'TEXT_CONTROL');});
check('完整字庫壓縮後資料小於145000 bytes',()=>{assert(manifest.packedBytes+manifest.lookupBytes+manifest.offsetBytes+manifest.treeBytes<145000);});
check('數值字碼與文字路徑逐像素一致',()=>{
 for(const text of ['你好世界','六年級','今天溫度25℃','恭喜過關','歡迎光臨','請開始挑戰','學習真有趣']){
  api.showLine(1,text);const expected=Buffer.from(ram);api.showLineCodePoints(1,Array.from(text,c=>c.charCodeAt(0)));assert.equal(api.lastError(),'');assert.deepEqual(ram,expected);
 }
});
check('不合法數值字碼不修改畫面',()=>{const before=Buffer.from(ram);for(const points of [[31],[65536],[55296],[1.5],[NaN],Array(9).fill(20320)]){api.showLineCodePoints(1,points);assert(api.lastError());assert.deepEqual(ram,before);}});
check('實機測試主程式啟動及AB雙向切換',()=>{
 const file=path.join(root,'examples/hardware-diagnostic.ts'),source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 function visit(n){if(ts.isStringLiteral(n))assert(!/[^\x00-\x7f]/.test(n.text),'Native diagnostic must have ASCII-only string literals');ts.forEachChild(n,visit);}visit(ast);
 const handlers={},errors=[];context.Button={A:0,B:1};context.input={onButtonPressed:(button,fn)=>handlers[button]=fn};context.led={plot:()=>{}};context.basic={showString:s=>errors.push(s)};
 vm.runInContext(ts.transpile(source),context);
 function same(words,temp){assert.equal(errors.length,0);assert.equal(api.lastError(),'');const actual=Buffer.from(ram);api.showLine(1,words[0]);api.showLine(2,words[1]);api.showLine(3,'今天溫度'+temp+'℃');api.showLine(4,words[2]);assert.deepEqual(ram,actual);}
 same(['你好世界','六年級','恭喜過關'],25);
 handlers[0]();assert.equal(api.bytesSent(),11);same(['你好世界','六年級','恭喜過關'],26);
 handlers[1]();same(['歡迎光臨','請開始挑戰','學習真有趣'],26);
 handlers[0]();assert.equal(api.bytesSent(),11);same(['歡迎光臨','請開始挑戰','學習真有趣'],25);
 handlers[1]();same(['你好世界','六年級','恭喜過關'],25);
});
check('學生選單24組詞句與原始中文字形一致',()=>{
 const phrases=JSON.parse(fs.readFileSync(path.join(root,'tests/phrases.json'),'utf8'));
 for(const p of phrases){api.showLine(1,p.text);const expected=Buffer.from(ram);api.showCommonLine(1,p.value);assert.equal(api.lastError(),'');assert.deepEqual(ram,expected);}
});
check('學生中文搭配數字及局部更新',()=>{
 api.showCommonLineNumber(3,context.TCText.Temperature,25);const original=Buffer.from(ram);api.showCommonLineNumber(3,context.TCText.Temperature,26);assert.equal(api.bytesSent(),11);assert.deepEqual(ram.subarray(0,512),original.subarray(0,512));assert.deepEqual(ram.subarray(768),original.subarray(768));api.showLine(3,'今天溫度26');const expected=Buffer.from(ram);api.showCommonLineNumber(3,context.TCText.Temperature,26);assert.deepEqual(ram,expected);assert.equal(api.bytesSent(),0);
});
check('學生英數積木與長度檢查',()=>{api.showAsciiLine(2,'Hello 123');assert.equal(api.lastError(),'');const before=Buffer.from(ram);api.showAsciiLine(2,'ABCDEFGHIJKLMNOPQ');assert.equal(api.lastError(),'LINE_OVERFLOW');assert.deepEqual(ram,before);api.showAsciiLine(2,'你好');assert.equal(api.lastError(),'ASCII_ONLY');assert.deepEqual(ram,before);});
check('不合法詞句代碼不清除原畫面',()=>{const before=Buffer.from(ram);api.showCommonLine(1,-1);assert.equal(api.lastError(),'CODE_RANGE');assert.deepEqual(ram,before);});
check('未完成的自由中文輸入積木已隱藏',()=>{
 const source=fs.readFileSync(path.join(root,'oled.ts'),'utf8');for(const name of ['showLine','showLineNumber']){const pos=source.indexOf('export function '+name+'(');assert(pos>0);assert(source.slice(Math.max(0,pos-260),pos).includes('blockHidden=true'));}
});
fs.writeFileSync(path.join(root,'tests/engine-results.json'),JSON.stringify({automatedPass:true,checks,checkCount:checks.length,digitUpdateBytes:digitBytes,hardwareTested:false,baseDiagnosticHardwareResult:'user reported pass; see HARDWARE-ACCEPTANCE.md',directChineseNativeSupported:false},null,2));
console.log(`${checks.length} automated checks PASS; all 4943 glyphs exact; digit update ${digitBytes} bytes; hardware NOT tested; direct native Chinese NOT supported.`);
