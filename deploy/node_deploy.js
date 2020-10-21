const utils = require('../utilities.js')
const pm2 = require('../command/pm2.js')
const nginx = require('../command/ngnix.js')
const pass = process.env.SERVER_PASSWORD
const serverBasePath = process.env.SERVER_BASE_PATH ;


commands ={
    "npminstallAll" :(path)=>`npm install ${path}`,
    "npmInstallPackage" : (path,name)=>`npm install ${path} ${name}`,
    "runserver" : (path,name)=>`node ${path}/${name}/index.js`
}




const pm2Node = async(options,projectDir)=>{
    await utils.spawnCommand(pm2.commands["start"](projectDir+"/index.js"), "initiate process manager", utils.cb)
    await utils.spawnCommand(pm2.commands["addtoboot"], "add process to boot", utils.cb)
    await utils.spawnCommand(pm2.commands["userBoot"], "complete startup process", utils.cb)
}


const nginxNode = async (options) => {
    await utils.spawnCommand(nginx.commands["cpDefault"]("node",options.name), "copy default nginx file", utils.cb)
   /* await utils.spawnCommand(utils.commands["changeinfile"](link, projectDir), "cd", utils.cb)
    await utils.spawnCommand(utils.commands["changeinfile"](link, projectDir), "cd", utils.cb) */
    await utils.spawnCommand(nginx.commands["check"](link, projectDir), "check nginx file", utils.cb)
    await utils.spawnCommand(utils.commands["enablefile"](link, projectDir), "enable file", utils.cb)
    await utils.spawnCommand(nginx.commands["restart"](link, projectDir), "restart nginx ", utils.cb)
    

}

const deploy = async (options)=>{
    const {name,link} =options ;
    const projectDir = serverBasePath+name


   await utils.spawnCommand(utils.commands["clone"](link,projectDir),"cd",utils.cb)
   await utils.spawnCommand(commands["npmInstallAll"](projectDir),"npm install",utils.cb)
   await utils.spawnCommand(commands["executable"](projectDir+"/index.js"), "npm install", utils.cb)
   


   //start process manager
   await pm2Node(options,projectDir)

   //start nginx
   await nginxNode(options)
}



module.exports = {
    deploy,commands
}