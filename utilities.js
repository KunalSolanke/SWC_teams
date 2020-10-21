const pass  = process.env.SERVER_PASSWORD
const {spawn} = require('child_process')

const cb = function (err, data="") {
    if (err) throw err;
    console.log("data" + data + "error" + err)

}

const logger = async (child,name)=>{

   
  child.stderr.pipe(process.stderr)
  child.stdout.pipe(process.stdout)
    let data = "";
    for await (const chunk of child.stdout) {
        console.log('stdout chunk: ' + chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error('stderr chunk: ' + chunk);
        error += chunk;
    }
    const exitCode = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`subprocess error exit ${exitCode}, ${error}`);
    }
    return data;

}



const mkdir =async (name,cb)=>{
    let child = spawn(`mkdir /home/kunal/projects/${name}`, {
        shell: true,
        
    })

    try {
        let data = await logger(child, "mkdir")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }

}



const cd= async (path,cb) => {
    

    let child = spawn(`cd ${path}`, {
        shell: true,
        
    })

    try {
        let data = await logger(child, "cd")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }

}


const pwd= async (cb) => {
   

   let  child = spawn('pwd', {
        shell: true,
        
    })

    try {
        let data = await logger(child, "pwd")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }
}


const update= async (cb) => {
    

    let child = spawn(`echo ${pass} | sudo -S apt-get update`, {
        shell: true,
        
    })

    try {
        let data = await logger(child, "update")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }
}


const install = async (name,cb) => {
   
    let child = spawn(`echo ${pass} | sudo -S apt-get install ${name}`, {
        shell: true,
        
    })

    try {
        let data = await logger(child, "install")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }
}


const clone = async ( url,name,cb) => {
  

    let child = spawn(`git clone ${url} /home/kunal/projects/${name}`, {
        shell: true,
        
    })

    try {
        let data = await logger(child, "clone")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }
}

module.exports ={
    cb : cb,
    logger : logger,
    cd : cd ,
    mkdir : mkdir ,
    pwd : pwd ,
    clone : clone ,
    install : install,
    update : update
}


