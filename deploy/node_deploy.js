const utils = require('../utilities.js')
const pm2 = require('../command/pm2.js')
const nginx = require('../command/ngnix.js')
const docker = require('../command/docker.js')
const { Project } = require('../models/allModels')


commands = {
    "npmInstallAll": (path) => `cd ${path} && npm install`,
    "npmInstallPackage": (path, name) => `npm install ${path} ${name}`,
    "runserver": (path, name) => `node ${path}/${name}/index.js`
}


const pm2Node = (project, env) => {


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



const nginxNode = (project, env) => {
    let nginxFilename = `/etc/nginx/sites-available/${project.name}.${project.domain}.conf`


    let setup = [
        {
            "command": nginx.commands["cpDefault"](env.pass, "node", nginxFilename),
            "name": "copy default nginx file"
        },

        /* {
              "command": utils.commands["changeinfile"](env.pass,'root', `root /home/kunal/projects/${project.name}`,nginxFilename,separator="+"),
              "name": "change nginx file-root"
          },*/
        {
            "command": utils.commands["changeinfile"](env.pass, 'port', project.port, nginxFilename),
            "name": "change nginx file-port"
        },
        {
            "command": utils.commands["changeinfile"](env.pass, 'domain', project.domain, nginxFilename),
            "name": "change nginx file-domain"
        },
        {
            "command": nginx.commands["check"](env.pass),
            "name": "check nginx file"
        },
        {
            "command": nginx.commands["enablefile"](env.pass, nginxFilename),
            "name": "enable file"
        },
        {
            "command": nginx.commands["restart"](env.pass),
            "name": "restart nginx "
        }
    ]




    return setup

}


const dockersetup = async (project, env) => {

    let dockerfilename = env.projectDir + "/Dockerfile"
    let dockerignorefile = env.projectDir + "/.dockerignore"
    setup = [
        {
            "command": `cp docker_config/docker_node/Dockerfile ${dockerfilename}`,
            "name": "copy docker file"
        },
        {
            "command": `cp docker_config/docker_node/.dockerignore ${dockerignorefile}`,
            "name": "copy docker file"
        },
        {
            "command": utils.commands["changeinfile"](env.pass, '<main-file>', 'index.js', dockerfilename),
            "name": "change docker file"
        }
    ]




    return setup
}




const saveconfigurations = (project, env) => {
    let dockerfilename = env.projectDir + "/Dockerfile";

    setup = [{
        "command": `touch ${env.projectDir}/src/.env`,
        "name": "make .env file"
    }]

    for (let config of project.configs) {

        setup.push({
            "command": `echo \`${config.key} = ${config.value}\` >> ${env.projectDir}/src/.env`,
            "name": "make values to .env"
        })

        setup.push({
            "command": `sed -i 's+#<ENV>+ENV ${config.key} ${config.value}\n#<ENV>+g' ${dockerfilename}`,
            "name": "adding values to ENV"
        })
    }



    return setup


}


const dockerBuild = async (project, env) => {
    let totalproject = Project.find({})
    let port = 3000 + totalproject.length;
    let linked_containers="";
    for (let db of project.databases){
        linked_containers += `--link ${db.containername}` ;
    }
        setup = [{
            "command": `cd ${env.projectDir} && ${docker.commands["dockerBuildContext"](project.name, project.version)}`,
            "name": "docker build image"
        },
        {
            "command": docker.commands["dockerRun"](project.name, port, 3000, name,addstring),
            "name": "docker run"
        }
        ]

    project.port = port;
    project.save()

    return setup;
}








const deploy = async (project) => {

    const serverBasePath = process.env.SERVER_BASE_PATH;


    const env = {
        pass: process.env.SERVER_PASSWORD,
        server_username: process.env.SERVER_USERNAME,
        projectDir: serverBasePath + name
    }



    // let basicsetup = [
    //     {
    //         "command": utils.commands["clone"](link, env.projectDir),
    //         "name":"clone repo"
    //     },
    //     {
    //         "command": utils.commands["mkdir"](`-p ${env.projectDir}/node_modules`),
    //         "name": "make dir node_modules"
    //     },
    //     {
    //         "command": commands["npmInstallAll"](`${env.projectDir}`),
    //         "name":"install npm packages"
    //     },
    //     {
    //         "command": utils.commands["executable"](env.projectDir + "/index.js"),
    //         "name":"make file executable"
    //     }
    // ]


    let basicsetup = [
        {
            "command": utils.commands["mkdir"](`-p ${env.projectDir}`),
            "name": "make project dir"
        },
        {
            "command": utils.commands["mkdir"](`-p ${env.projectDir}/src`),
            "name": "make project dir"
        },
        {
            "command": utils.commands["clone"](link, env.projectDir + "/src"),
            "name": "clone repo"
        }

    ]

    await utils.multiplecommands(basicsetup, "NODE SETUP", utils.cb)


    //docker 
    await utils.multiplecommands(dockersetup(project, env), "DOCKER SETUP", utils.cb)


    //save configurations 
    await utils.multiplecommands(saveconfigurations(project, env), "DOCKER SETUP", utils.cb)



    //docker 
    await utils.multiplecommands(dockerBuild(project, env), "DOCKER BUILD", utils.cb)

    //start process manager
    //  await utils.multiplecommands(pm2Node(project,env), "PM2 NODE SETUP", utils.cb)

    //start nginx
    await utils.multiplecommands(nginxNode(project, env), "NGINX NODE SETUP", utils.cb)
}



module.exports = {
    deploy, commands
}