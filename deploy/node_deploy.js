const utils = require('../utilities.js')
const pass = process.env.SERVER_PASSWORD



exports.npmInstallAll = (stream) => {
    stream.stdin.write(`npm install\n`, (err) => {
        console.log(err, "hi")
    })

}

exports.npmInstallPackage = (stream,name) => {
    stream.stdin.write(`npm install ${name}\n`, (err) => {
        console.log(err, "hi")
    })

}

exports.runserver = (stream)=>{

stream.stdin.write(`npm run start\n`, (err) => {
        console.log(err, "hi")
    })
}




module.exports.default = (options)=>{
    const {name,link} =options ;
    
    utils.clone(stream, link, name)
    utils.cd(stream, `/home/kunal/projects/${name}`)
    utils.pwd(stream)
}
