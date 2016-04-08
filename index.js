#!/usr/local/bin/node
var watch   = require('watch');
var less    = require('less');
var fs      = require('fs');
var express = require('express');
var http    = require('http');
var app     = express();
var e       = require('child_process').execSync;
var colors  = require('colors');
var cheerio = require('cheerio');
var path    = require('path');
var io;


var commandLineArgs = require('command-line-args');
 
var cli = commandLineArgs([
  { name: 'port', alias: 'p', type: Number },
  { name: 'host', type: String },
  { name: 'help', alias: 'h'}
]);
var params = cli.parse();
if(params.help == true){
  console.log('SUPER SERVE'.bold)
  console.log(cli.getUsage());
} else {
  var exec = function(file,type){
  console.log(" * File Modified... * ".blue);
  try{
    buildStart(file);
    var a = file.split('.');
    b = a[a.length-1];
    delete a[a.length-1];
    var str = a.join('.');
    str = str.substring(0, str.length - 1);
    str = str.replace('src','dist');

        var filepath = file.split('/');
        delete filepath[0];
        delete filepath[filepath.length-1];
        filepath = filepath.join('/').substring(0, filepath.join('/').length - 1);

    switch(type){
      case "js":
        var result = e("node_modules/.bin/babel src   -d dist/ --presets es2015,stage-0 -s", {encoding:'utf-8'});
        console.log(" | ".yellow+getResult(result).grey);
        break;
      case "less":
        var result = e("node_modules/.bin/lessc -x "+file+" "+str+".css --source-map", {encoding:'utf-8'});
        console.log(" | ".yellow+getResult(result).grey);
        break;
      case "coffee":
        var result = e("node_modules/.bin/coffee --compile -m --output dist/"+filepath+" "+file, {encoding:'utf-8'});
        console.log(" | ".yellow+getResult(result).grey);
        break;
      case "scss":
      case "sass":
        var result = e("node_modules/.bin/node-sass "+file+" "+str+".css --source-map true --source-map-contents sass", {encoding:'utf-8'});
        console.log(" | ".yellow+getResult(result).grey);
        break;
      case "jade":
        var result = e('node_modules/.bin/jade '+file+' --out dist/'+filepath, {encoding:'utf-8'});
        console.log(" | ".yellow+getResult(result).grey);
        break;
      case "html":
        fs.writeFileSync(str+".html",fs.readFileSync(file,'utf-8'));
        console.log(" | ".yellow+"Copy File");
        break;
      case "css":
        fs.writeFileSync(str+".css",fs.readFileSync(file,'utf-8'));
        console.log(" | ".yellow+"Copy File");
        break;
    }
    buildEnd(file);
  } catch(e){
    console.log(e);
    console.log(" * BUILD FAILED * ".red);
  }
}
 watch.watchTree('./src',{ignoreDotFiles:true}, function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    } else if (prev === null) {
      var a = f.split('.');
      b = a[a.length-1];
      exec(f,b);
    } else if (curr.nlink === 0) {
      try{
        var a = f.split('.');
        b = a[a.length-1];
        delete a[a.length-1];
        var str = a.join('.');
        str = str.substring(0, str.length - 1);
        str = str.replace('src','dist');
        if(['sass','scss','css'].indexOf(b)>-1){
          str+=".css";
        } else if (['jade','html'].indexOf(b)>-1) {
          str+=".html"
        }
        fs.unlinkSync(str);
      } catch(e){}
    } else {
      var a = f.split('.');
      b = a[a.length-1];
      exec(f,b);
    }
  });
app.use(function(req,res,next){
  try{
    if(req.originalUrl == "/injector.js"){
      res.send(fs.readFileSync(__dirname+'/injector.js','utf-8'));
    } else if (req.originalUrl.indexOf('/socket.io')==0) {
      next();
    } else {
      var isIndex = (req.originalUrl.lastIndexOf('/')+1 == req.originalUrl.length);
      if(getExtension(req.originalUrl)!="html" && !isIndex){
        res.sendFile("./dist"+req.originalUrl);

      } else {
        var filepath = req.originalUrl.split('/');
        delete filepath[filepath.length-1];
        filepath = filepath.join('/').substring(0, filepath.join('/').length - 1);
        if(filepath!=""){
          var dir = fs.readdirSync('./dist'+filepath);
        } else {
          var dir = fs.readdirSync('./dist');
        }
        var $ = cheerio.load(fs.readFileSync("./dist"+(isIndex?req.originalUrl+"index.html":req.originalUrl),'utf-8'));
        dir.forEach(function(val){
          switch(getExtension(val)){
            case "js":
              $('body').append('<script src="'+filepath+"/"+val+'"></script>');
              return;
            case "css":
              $('head').append('<link rel="stylesheet" href="'+filepath+"/"+val+'"/>');
              return;
            
          }
        });
        $('body').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js"></script>');
        $('body').append('<script src="/injector.js"></script>');
        res.send($.html());
      }
    }
  } catch (e) {
    console.log(e);
    res.send("<h2>404</h2>");
  }
});
var server = app.listen((!params.port?8080:params.port),(!params.host?"localhost":params.host),function(){
  console.log(" App Listening On ".green+('http://'+(!params.host?"localhost":params.host)+":"+(!params.port?8080:params.port)).blue);
      io  = require('socket.io')(server);
});

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}
function buildStart(file){
  console.log((" | Building "+file+" ").yellow);
}
function buildEnd(file){
  console.log(" |".yellow+" ✔ ".green+" "+file+" ".white+new Date().toString().grey);
  console.log(" └ ".yellow+"Build Finished, Refreshing ".blue+"⟳".bold.blue);
  file = file.replace('src','').replace('.jade','.html');
  io.sockets.emit("server_refresh",{url:file});
}
function checkIsDir(name){
  return fs.fstatSync(name).isDirectory();
}
function getResult(str){
  return str.replace(/\n/g,'\n | '.yellow);
}
}

