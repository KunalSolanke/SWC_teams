require('dotenv').config()
const pass  = process.env.SERVER_PASSWORD

exports.mkdir =(stream,name)=>{
    stream.stdin.write(`mkdir /home/kunal/projects/${name}\n`, (err) => {
        console.log(err, "hi")
    })

}

exports.cd= (stream,path) => {
    stream.stdin.write(`cd ${path}\n`, (err) => {
        console.log(err, "hi")
    })

}

exports.pwd= (stream) => {
    stream.stdin.write('pwd\n', (err) => {
        console.log(err, "hi")
    })
}

exports.update= (stream) => {
    stream.stdin.write(`echo ${pass} | sudo -S apt-get update\n`, (err) => {
        console.log(err, "hi")
    })
}


exports.install = (stream,name) => {
    stream.stdin.write(`echo ${pass} | sudo -S apt-get install ${install}\n`, (err) => {
        console.log(err, "hi")
    })
}

exports.clone = (stream, url,name) => {
    stream.stdin.write(`git clone ${url} /home/kunal/projects/${name}\n`, (err) => {
        console.log(err, "hi")
    })
}




