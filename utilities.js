
const {spawn} = require('child_process')


const multiplecommands = async (commands,blockName,callback)=>{
 
    for(let i=0 ;i<commands.length ;i++){
        let c=commands[i] ;
        try {
        await spawnCommand(c["command"],c["name"],callback)
        } catch (err) {
            return callback(err, blockName)
        }
    }
}



const cb = function (err,name, data="") {
    if (err) throw err;
    console.log(`${name}\ndata ` + data +"\n"+ "error " + err)

}


const spawnCommand  = async(command,commandname,cb)=>{
    let child = spawn(command, {
        shell: true,
    })
    try {
        let data = await logger(child, commandname)
        cb(null, commandname, data)
    } catch (error) {
        console.log(error)
        return cb(error, commandname);
    }
}



const logger = async (child,name)=>{

   
  child.stderr.pipe(process.stderr)
  child.stdout.pipe(process.stdout)
  
    let data = "";
    for await (const chunk of child.stdout) {
        console.log(`${name}\n stdout chunk: ` + chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error(`${name}\n stderr chunk: ` + chunk);
        error += chunk;
    }
    const exitCode = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`${name}\n subprocess error exit ${exitCode}, ${error}`);
    }
    return data;

}




commands = {
    "install": (pass,name) => `echo ${pass} | sudo -S apt-get install ${name}`,
    "update": (pass)=>`echo ${pass} | sudo -S apt-get update`,
    "mkdir": (name) => `mkdir ${name}`,
    "cd": (path) => `cd ${path}`,
    "pwd": "pwd",
    "clone": (url, name) => `git clone ${url} ${name}`,
    "changeinfile":(pass,old,new_entry,file,separator="/")=>{
       // console.log(`echo ${pass} | sudo -S sed -i 's/${old}/${new_entry}/g' ${file}`)
        return `echo ${pass} | sudo -S sed -i 's${separator}${old}${separator}${new_entry}${separator}g' ${file}`},
    "executable" : (filename) =>`chmod +x ${filename}`,
    "changeDirOwner":(pass,dir)=>`echo ${pass} | sudo -S chown -R $USER:$USER ${dir}`,
    "giveReadWriteAccess": (pass,dir) => `echo ${pass} | sudo -S chmod -R 755 ${dir}`
}




module.exports ={
    cb : cb,
    logger : logger,
    spawnCommand:spawnCommand,
    commands : commands,
    multiplecommands:multiplecommands
}


