const express = require('express')
const Client=require('ssh2').Client
const app = express()
const bodyParser = require('body-parser')
const { mkdir,cd,pwd,update,install,clone} = require('./utilities.js')
const {npmInstallAll,runserver,npmInstallPackage} = require('./deploy/node_deploy.js')
require('dotenv').config()
app.use(bodyParser.urlencoded({extended:true}))
app.get('/',(req,res)=>{
    res.sendFile('index.html',{root:__dirname})
})

app.post("/deploy",(req,res)=>{
    let {name,link} = req.body ;
    console.log(req.body) 
    var conn = new Client();
    conn.on('ready', function() {
    console.log('Client :: ready');
    conn.shell(function(err, stream) {
        if (err){
            throw err;
            console.log('Encounter with error')
        }
        stream.stdout.pipe(process.stdout);
        stream.stderr.pipe(process.stderr);
        clone(stream,link,name)
        cd(stream,`/home/kunal/projects/${name}`)
        pwd(stream)
        
        
        stream.on('close', function() {
          console.log('Stream :: close');
          conn.end();
        }).on('data', function(data) {
          console.log('OUTPUT: ' + data);
        });
        stream.end('ls -l\nexit\n');
      });
    }).connect({
    host: '0.tcp.ngrok.io',
    port: 12632,
    username: 'kunal',
    password:"Kunal1234##"
    });
})

app.listen(3000,()=>{
    console.log("listening at 3000")
})