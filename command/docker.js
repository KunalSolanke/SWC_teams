const utils = require('../utilities.js');
const { Database } = require('../models/allModels.js')


let commands = {
    "createVolume": (name) => {
        let obj = {}
        obj["normal"] = `docker volume create ${name}`;
        obj["revert"] = `docker volume rm /${name}`;
        return obj
    },
    "remove": (type,name) => {
        let obj = {}
        obj["normal"] = `docker ${type} rm -f ${name}`;
        return obj
    },
    "dockerBuildContext": (version, name) => {
        let obj = {}
        obj["normal"] = `docker build -t ${name}:${version} .`;
        obj["revert"] = `docker rm -f /${name}`;
        return obj;
    },
    "dockerRun":
        (options, container) => {
            let obj = {}
            obj["normal"] = `docker run ${options}`
            obj["revert"] = `docker rm -f /${container}`
            return obj
        },
    "dockerList": () => {
        let obj = {};
        obj["normal"] = "docker ps"
        obj["revert"] = ""
        return obj
    }
}




dockerimages = {
    "postgres": async (project) => {
        let containername = "postgres-" + project.name;
        let volumeName = 'postgresdb-' + project.name;
        let totalPostgresDb = await Database.find({ name: "postgres" }).exec()
        let port = 5432 + totalPostgresDb.length;

        await utils.spawnCommand(commands["createVolume"](volumeName), "create pg vol", utils.cb);

        /*pending*/
        await utils.spawnCommand(`docker run -it --rm -d \
        --name ${containername} \
        -p ${port}:5432 \
        -e POSTGRES_PASSWORD = ${containername}\
        -e POSTGRES_USER = ${project.user.username} \
        -e POSTGRES_DB = ${project.name} \
        -e PGDATA = /var/lib/postgresql/data/${project.name} \
        -v / ${volumeName}: /var/lib/postgresql/data \
        postgres`, `pg container ${project.name}`, utils.cb)


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

        database.save();
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
        //mongo 
        let containername = "mongo_" + project.name;
        let volumeName = 'mongodb_' + project.name;
        containername.toLowerCase();
        volumeName.toLowerCase();

        let volumeConfig = 'mongodb_config_' + project.name;
        volumeConfig.toLowerCase();
        let totalMongoDb = await Database.find({ name: "mongo" }).exec();
        let port = 27017 + totalMongoDb.length;
        let fallbackArr = []
        try {
            await utils.spawnCommand(commands["createVolume"](volumeName), "create mongo vol ", utils.cb, fallbackArr);
            await utils.spawnCommand(commands["createVolume"](volumeConfig), "create mongo config vol ", utils.cb, fallbackArr);
            await utils.spawnCommand(commands['dockerRun'](`-dit --rm --name ${containername} --net nginx-proxy -p ${port}:27017 mongo`, containername), `mongo container ${project.name}`, utils.cb, fallbackArr)

        } catch (err) {
            console.log("reverting changes", err)
            await utils.multiplecommands(fallbackArr, "mongo db creation block ", (err, name) => {
                console.log(err)
            });
            if (err) throw err;
        }


        let database = await new Database({
            project: project._id, user: project.user._id, containername: containername, name: "mongo", port: port
            , type: "NOSQL"
        })


        console.log(database.configs, database);
        database.configs.push({ key: "MONGO_URI", value: `mongodb://${containername}:27017/${project.name}` })
        database

        project.databases.push(database._id)
        project.config_vars.push({ key: "MONGO_URI", value: `mongodb://${containername}:27017/${project.name}` })
        project.save()
    }



}



exports.commands = commands
exports.images = dockerimages;


