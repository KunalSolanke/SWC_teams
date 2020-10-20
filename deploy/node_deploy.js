require('dotenv').config()
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

exports.runsrever = (stream)=>{

stream.stdin.write(`npm run start\n`, (err) => {
        console.log(err, "hi")
    })
}

