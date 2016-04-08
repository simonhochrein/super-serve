var e = require('child_process').execSync;
console.log(e('cd '+__dirname+' && npm install',{encoding:'utf-8'}));
