const utils = require('../utilities.js')
const pm2 = require('../command/pm2.js')
const nginx = require('../command/ngnix.js')


commands ={
    "npmInstallAll" :(path)=>`cd ${path} && npm install`,
    "npmInstallPackage" : (path,name)=>`npm install ${path} ${name}`,
    "runserver" : (path,name)=>`node ${path}/${name}/index.js`
}


const pm2Node = (options,env)=>{


    let setup = [
        {
            "command": pm2.commands["start"](env.projectDir + "/index.js"),
            "name": "initiate process manager"
        },
        /*{
            "command": pm2.commands["addtoboot"],
            "name": "add process to boot"
        },
       /* {
            "command": pm2.commands["userBoot"](env.pass,env.server_username),
            "name": "complete startup process"
        }*/
    ]

    return setup

   
}


const nginxNode = (options,env) => {
    let nginxFilename = `/etc/nginx/sites-available/${options.name}.${options.domain}.conf`
    let setup = [
        {
            "command": nginx.commands["cpDefault"](env.pass,"node",nginxFilename),
            "name": "copy default nginx file"
        },
        
        {
            "command": utils.commands["changeinfile"](env.pass,'root', `root /home/kunal/projects/${options.name}`,nginxFilename,separator="+"),
            "name": "change nginx file-root"
        },
        {
            "command": utils.commands["changeinfile"](env.pass,'port', options.port,nginxFilename),
            "name": "change nginx file-port"
        },
        {
            "command":utils.commands["changeinfile"](env.pass,'domain', options.domain,nginxFilename),
            "name": "change nginx file-domain"
        },
        {
            "command": nginx.commands["check"](env.pass),
            "name": "check nginx file"
        },
        {
            "command": nginx.commands["enablefile"](env.pass,nginxFilename),
            "name": "enable file"
        },
        {
            "command": nginx.commands["restart"](env.pass),
            "name": "restart nginx "
        }
    ]



    return setup

}

const deploy = async (options)=>{
    const {name,link} =options ;
    options.domain = `${name}.voldemort.wtf` ;
    const serverBasePath = process.env.SERVER_BASE_PATH;
    options.port = 3000 ;
    const env ={
        pass : process.env.SERVER_PASSWORD,
        server_username:process.env.SERVER_USERNAME,
        projectDir: serverBasePath + name
    }

   
    
    let basicsetup = [
        {
            "command": utils.commands["clone"](link, env.projectDir),
            "name":"clone repo"
        },
        {
            "command": utils.commands["mkdir"](`-p ${env.projectDir}/node_modules`),
            "name": "make dir node_modules"
        },
        {
            "command": commands["npmInstallAll"](`${env.projectDir}`),
            "name":"install npm packages"
        },
        {
            "command": utils.commands["executable"](env.projectDir + "/index.js"),
            "name":"make file executable"
        }
    ]

   await utils.multiplecommands(basicsetup,"NODE SETUP",utils.cb)
  



   //start process manager
    await utils.multiplecommands(pm2Node(options,env), "PM2 NODE SETUP", utils.cb)

   //start nginx
    await utils.multiplecommands(nginxNode(options, env), "NGINX NODE SETUP", utils.cb)
}



module.exports = {
    deploy,commands
}