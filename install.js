var e = require('child_process').execSync;
if(require('os').platform().indexOf('win')>-1){
console.log(e('cd '+__dirname+' && npm install',{encoding:'utf-8'}));
} else {
console.log(e('cd '+__dirname+' && sudo npm install',{encoding:'utf-8'}));
}
