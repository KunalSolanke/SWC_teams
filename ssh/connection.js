const Client = require('ssh2').Client
const allDeploy = require('../deploy/all_deploy.js')



module.exports.default = (type,options) =>{

    var conn = new Client();
    conn.on('ready', function () {
        console.log('Client :: ready');
        conn.shell(function (err, stream) {
            if (err) {
                throw err;
                console.log('Encounter with error')
            }
            stream.stdout.pipe(process.stdout);
            stream.stderr.pipe(process.stderr);


            let deployRoute = allDeploy[type]() ;
            deployRoute(options)
            
            stream.on('close', function () {
                console.log('Stream :: close');
                conn.end();
            }).on('data', function (data) {
                console.log('OUTPUT: ' + data);
            });
            stream.end('ls -l\nexit\n');
        });
    }).connect({
        host: process.env.HOST_NAME,
        port: 12632,
        username: 'kunal',
        password: process.env.SERVER_PASSWORD
    });
}