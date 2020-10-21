const utils = require('../utilities.js')
const pm2 = require('../command/pm2.js')
const nginx = require('../command/ngnix.js')
const pass = process.env.SERVER_PASSWORD
const serverBasePath = process.env.SERVER_BASE_PATH ;


commands ={
    "npmInstallAll" :(path)=>`npm install ${path}`,
    "npmInstallPackage" : (path,name)=>`npm install ${path} ${name}`,
    "runserver" : (path,name)=>`node ${path}/${name}/index.js`
}




const pm2Node = (options,projectDir)=>{

   

    let setup = [
        {
            "command": pm2.commands["start"](projectDir + "/index.js"),
            "name": "initiate process manager"
        },
        {
            "command": pm2.commands["addtoboot"],
            "name": "add process to boot"
        },
        {
            "command": pm2.commands["userBoot"],
            "name": "complete startup process"
        }
    ]

    return setup

   
}


const nginxNode = (options,projectDir) => {
    let setup = [
        {
            "command": nginx.commands["cpDefault"]("node", options.name),
            "name": "copy default nginx file"
        },
        {
            "command": nginx.commands["check"],
            "name": "check nginx file"
        },
       /* {
            "command": utils.commands["changeinfile"](link, projectDir),
            "name": "check nginx file"
        },
        {
            "command":utils.commands["changeinfile"](link, projectDir),
            "name": "check nginx file"
        },*/
        {
            "command": utils.commands["enablefile"](options.name+".voldemort.wtf"),
            "name": "enable file"
        },
        {
            "command": nginx.commands["restart"],
            "name": "restart nginx "
        }
    ]



    return setup

}

const deploy = async (options)=>{
    const {name,link} =options ;
    const projectDir = serverBasePath+name

    //await utils.spawnCommand("git clone fsfaw", "cd", utils.cb)
    let basicsetup = [
        {
            "command": utils.commands["clone"](link, projectDir),
            "name":"clone repo"
        },
        {
            "command": commands["npmInstallAll"](projectDir),
            "name":"install npm packages"
        },
        {
            "command": utils.commands["executable"](projectDir + "/index.js"),
            "name":"make file executable"
        }
    ]

   await utils.multiplecommands(basicsetup,"NODE SETUP",utils.cb)



   //start process manager
    await utils.multiplecommands(pm2Node(options,projectDir), "PM2 NODE SETUP", utils.cb)

   //start nginx
    await utils.multiplecommands(nginxNode(options, projectDir), "NGINX NODE SETUP", utils.cb)
}



module.exports = {
    deploy,commands
}