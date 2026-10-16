const fs=require('fs'),path=require('path');
module.exports=(site,target)=>{const d=path.join(site,'static');fs.mkdirSync(d,{recursive:true});for(const f of ['utf8-logo.svg','logo.portrait.white.svg'])fs.copyFileSync(path.join(target,'docs/static',f),path.join(d,f));};
