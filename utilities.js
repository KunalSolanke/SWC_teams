
const { spawn } = require('child_process')



const multiplecommands = async (commands, blockName, callback, fallbackcommandArr = []) => {
    for (let i = 0; i < commands.length; i++) {
        let c = commands[i];
        try {
            await spawnCommand(c["command"], c["name"], callback, fallbackcommandArr)
        } catch (err) {
            return callback(err, blockName)
        }
    }
}





const cb = function (err, name, data = "") {
    if (err) {
        console.log(`${name}\nError`.bold.red, err);
        throw new Error(err) ;
    }
    console.log(`${name}\nSuccess:`.underline.green, + data + "\n")
}




const spawnCommand = async (command, commandname, cb, fallbackcommandArr) => {



    if (!command.normal || command.normal == false) {
        fallbackcommandArr.push({
            "command": {
                "normal": command.revert,
            },
            "name": `${commandname} revert`
        })
        return;
    }
    console.log("Running ".cyan, command.normal, commandname)

    let child = spawn(command.normal, {
        shell: true,
    })

    try {
        let data = await logger(child, commandname)
        if (command.revert) {
            fallbackcommandArr.push({
                "command": {
                    "normal": command.revert,
                },
                "name": `${commandname} revert`
            })
        }
        cb(null, commandname, data)
    } catch (error) {
        return cb(error, commandname);
    }
}





const logger = async (child, name) => {


    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)

    let data = "";
    for await (const chunk of child.stdout) {
        //console.log(`${name}\n output: ` + chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        //console.error(`${name}\n error: ` + chunk);
        error += chunk;
    }
    const exitCode = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`${name}\n Error`.bold.red + `${exitCode}, ${error}`);
    }
    return data;

}






commands = {
    "install": (pass, name) => {
        let obj = {};
        obj.normal = `echo ${pass} | sudo -S apt-get install ${name}`
    },
    "update": (pass) => {
        let obj = {};
        obj.normal = `echo ${pass} | sudo -S apt-get update`
        return obj
    },
    "mkdir": (name) => {
        let obj = {};
        obj.normal = `mkdir ${name}`
        return obj
    },
    "clone": (url, name) => {
        let obj = {};
        obj.normal = `git clone ${url} ${name}`
        return obj;
    },
    "changeinfile": (pass, old, new_entry, file, separator = "/") => {
        let obj = {}
        obj.normal = `echo ${pass} | sudo -S sed -i 's${separator}${old}${separator}${new_entry}${separator}g' ${file}`;
        return obj;
    },
    "executable": (filename) => {
        let obj = {};
        obj.normal = `chmod +x ${filename}`;
        return obj;
    },
    "changeDirOwner": (pass, dir) => {
        let obj = { "normal": `echo ${pass} | sudo -S chown -R $USER:$USER ${dir}` }
        return obj;
    },
    "giveReadWriteAccess": (pass, dir) => `echo ${pass} | sudo -S chmod -R 755 ${dir}`
}







module.exports = {
    cb: cb,
    logger: logger,
    spawnCommand: spawnCommand,
    commands: commands,
    multiplecommands: multiplecommands
}


