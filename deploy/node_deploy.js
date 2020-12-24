const utils = require('../utilities.js')
const pm2 = require('../command/pm2.js')
const nginx = require('../command/ngnix.js')
const docker = require('../command/docker.js')
const { Project } = require('../models/allModels')


commands = {
    "npmInstallAll": (path) => {
        let obj = {};
        obj.normal = `cd ${path} && npm install`;
        return obj;
    },
    "npmInstallPackage": (path, name) => {
        let obj = {};
        obj.normal = `npm install ${path} ${name}`;
        return obj;
    },
    "runserver": (path, name) => {
        let obj = {}
        obj.normal = `node ${path}/${name}/index.js`;
        return obj;
    }
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
            "command": {
                'normal': `cp docker_config/docker_node/Dockerfile ${dockerfilename}`,
            },
            "name": "copy docker file"
        },
        {
            "command": {
                "normal":
                    `cp docker_config/docker_node/.dockerignore ${dockerignorefile}`
            },
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
        "command": {
            "normal": `touch ${env.projectDir}/src/.env`
        },
        "name": "make .env file"
    }]



    for (let config of project.configs) {

        setup.push({
            "command": {
                "normal": `echo \`${config.key} = ${config.value}\` >> ${env.projectDir}/src/.env`
            },
            "name": "make values to .env"
        })

        setup.push({
            "command": {
                "normal": `sed -i 's+#<ENV>+ENV ${config.key} ${config.value}\n#<ENV>+g' ${dockerfilename}`
            },
            "name": "adding values to ENV"
        })
    }



    return setup


}



const dockerBuild = async (project, env) => {
    let totalproject = Project.find({})
    let port = 3000 + totalproject.length;
    let linked_containers = "";
    for (let db of project.databases) {
        linked_containers += `--link ${db.containername}`;
    }

    setup = [{
        "command": {
            "normal": `cd ${env.projectDir} && ${docker.commands["dockerBuildContext"](project.name, project.version).normal}`,
            "revert" :docker.commands["remove"]("image",project.name).normal 
        },
        "name": "docker build image"
    },
    {
        "command": docker.commands["dockerRun"](`docker run -dit --rm -e VIRTUAL_HOST =deploying.voldemort.wtf -e VIRTUAL_PORT =3000 --name ${project.name} --net nginx-proxy -p ${port}:3000 ${project.name}:${project.version}`),
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
        },

    ]

    let fallbackArr = [];



    try {

        fallbackArr.push({
            "command": {
                "normal": `rm -rf ${env.projectDir}`
            },
            "name": "There is a error in deploying hence removing project dir"
        });

        await utils.multiplecommands(basicsetup, "NODE SETUP", utils.cb, fallbackArr)

        //docker
        await utils.multiplecommands(dockersetup(project, env), "DOCKER SETUP", utils.cb, fallbackArr)

        //save configurations 
        await utils.multiplecommands(saveconfigurations(project, env), "DOCKER SETUP", utils.cb, fallbackArr)
       
         
        //docker 
        await utils.multiplecommands(dockerBuild(project, env), "DOCKER BUILD", utils.cb, fallbackArr)

     
       // await utils.multiplecommands(nginxNode(project, env), "NGINX NODE SETUP", utils.cb, fallbackArr);

    } catch (err) {
        console.log("Reverting changes".bgBlue, err)
        await utils.multiplecommands(fallbackArr, "mongo db creation block ", (err, name) => {
            console.log("Error while reverting changes".blink+name+"\n"+err);
        });
        if (err) throw err;
    }
}








module.exports = {
    deploy, commands
}