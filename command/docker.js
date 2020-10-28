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

        
        await  utils.spawnCommand(commands["createVolume"](volumeName),"create pg vol ",utils.cb) ;

        
        await utils.spawnCommand(`docker run -it --rm -d \
        --name ${containername} \
        -p ${port}:5432 \
        -e POSTGRES_PASSWORD = ${contianername}\
        -e POSTGRES_USER = ${project.user.username} \
        -e POSTGRES_DB = ${project.name} \
        -e PGDATA = /var/lib/postgresql/data/${name} \
        -v / ${volumeName}: /var/lib/postgresql/data \
        postgres`,`pg container ${project.name}`,utils.cb)


        let database = await Database({
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

        database.save() 
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

        let containername = "mongo-"+name ;
        let volumeName = 'mongodb-' + name;
        let volumeConfig = 'mongodb_config-' + name;
        let totalMongoDb = await Database.find({ name: "mongo" }).exec()
        let port = 27017 + totalMongoDb.length ;
        await utils.spawnCommand(commands["createVolume"](volumeName), "create mongo vol ", utils.cb);
        await utils.spawnCommand(commands["createVolume"](volumeConfig), "create mongo config vol ", utils.cb);

        await utils.spawnCommand(`docker run -it --rm -d \
        --name ${containername} \
         -p ${port}:27017 \
        -v / ${volumeName}: /data/db \
        -v / ${volumeConfig}: /data/configdb \
        mongo`, `pg container ${project.name}`, utils.cb)

        
        
      let database = await Database({ project: project._id, user: project.user._id, contianername: contianername, name: "mongo", port: port
    ,type : "NOSQL"})
        

    database.configs = database.configs.concat([{key : "DATABASE_URI",value :`${container_name}:${port}`}])
    database.save()
    

    project.databases = project.databases.concat([database._id])
    database.configs = project.configs.concat([{ key: "DATABASE_URI", value: `${container_name}:${port}` }])
    project.save()


    }




}



exports.commands = commands
exports.images = dockerimages ;


