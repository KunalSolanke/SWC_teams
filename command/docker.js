const utils = require('../utilities.js');
const {Database} = require('../models/allModels.js')


let commands = {
    "createVolume" : (name)=>`docker volume create ${name}`,
    "dockerBuildContext":(version,name)=>`docker build -t ${name}:${version} .`,
    "dockerRun" : 
    (contianername,portin,portto,image,string) =>
    {return `docker run -it --rm -d -p  ${string} ${portin}:${portto} --name ${contianername} ${image}`},
    "dockerList" : "docker ps"   
}




dockerimages = {
    "postgres" : async (project)=>{
        let containername = "postgres-" + project.name;
        let volumeName ='postgresdb-'+project.name ;
        let totalPostgresDb = await Database.find({ name: "postgres" }).exec()
        let port = 5432 + totalPostgresDb.length;
        
        await  utils.spawnCommand(commands["createVolume"](volumeName),"create pg vol",utils.cb) ;
        
        await utils.spawnCommand(`docker run -it --rm -d \
        --name ${containername} \
        -p ${port}:5432 \
        -e POSTGRES_PASSWORD = ${containername}\
        -e POSTGRES_USER = ${project.user.username} \
        -e POSTGRES_DB = ${project.name} \
        -e PGDATA = /var/lib/postgresql/data/${project.name} \
        -v / ${volumeName}: /var/lib/postgresql/data \
        postgres`,`pg container ${project.name}`,utils.cb)


        let database = await new Database({
            project: project._id, user: project.user, contianername: contianername, name: "postgres", port: port
            , type: "SQL"
        })


        database.configs = database.configs.concat([{ key: "DATABASE_URI", value: `${container_name}:${port}` },
            { key: "POSTGRES_USER", value: `${project.user.username}` },
            { key: "POSTGRES_HOST", value: `${contianername}` },
            { key: "POSTGRES_PASSWORD", value: `${contianername}` },
            { key: "POSTGRES_DB", value: `${project.name}` },
            { key: "POSTGRES_PORT", value: `${project.port}` }

    ])

        database.save() ;
        project.databases = project.databases.concat([database._id])

        project.configs = project.configs.concat([{ key: "DATABASE_URI", value: `${container_name}:${port}` },
        { key: "POSTGRES_USER", value: `${project.user.username}` },
        { key: "POSTGRES_HOST", value: `${contianername}` },
        { key: "POSTGRES_PASSWORD", value: `${contianername}` },
        { key: "POSTGRES_DB", value: `${project.name}` },
        { key: "POSTGRES_PORT", value: `${project.port}` }

        ])
        project.save() 

    },



    "mongo": async (project) => {

        let containername = "mongo_"+project.name ;
        let volumeName = 'mongodb_' + project.name;
        containername.toLowerCase();
        volumeName.toLowerCase();
        
        let volumeConfig = 'mongodb_config_' +project.name;
        volumeConfig.toLowerCase();
        let totalMongoDb = await Database.find({ name: "mongo" }).exec() ;
        let port = 27017 + totalMongoDb.length ;
        await utils.spawnCommand(commands["createVolume"](volumeName), "create mongo vol ", utils.cb);
        await utils.spawnCommand(commands["createVolume"](volumeConfig), "create mongo config vol ", utils.cb);
        await utils.spawnCommand(`docker run -dit --rm --name ${containername} -p ${port}:27017 mongo`, `mongo container ${project.name}`, utils.cb)
        
        
      let database = await new Database({ project: project._id, user: project.user._id, containername: containername, name: "mongo", port: port
    ,type : "NOSQL"})
        
    console.log(database.configs , database) ;
    database.configs.push({key : "DATABASE_URI",value :`${containername}:${port}`})
    database.save()
    

    project.databases.push(database._id)
    project.config_vars.push({ key: "DATABASE_URI", value: `${containername}:${port}` })
    project.save()


    }




}



exports.commands = commands
exports.images = dockerimages ;


