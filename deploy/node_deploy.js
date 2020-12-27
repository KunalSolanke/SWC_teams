const utils = require("../utilities.js");
const docker = require("../command/docker.js");
const { Project } = require("../models/allModels");
const fs = require("fs");

commands = {
  npmInstallAll: (path) => {
    let obj = {};
    obj.normal = `cd ${path} && npm install`;
    return obj;
  },
  npmInstallPackage: (path, name) => {
    let obj = {};
    obj.normal = `npm install ${path} ${name}`;
    return obj;
  },
  runserver: (path, name) => {
    let obj = {};
    obj.normal = `node ${path}/${name}/index.js`;
    return obj;
  },
};

const dockersetup = async (project, env) => {
  let dockerfilename = env.projectDir + "/Dockerfile";
  let dockerignorefile = env.projectDir + "/.dockerignore";
  console.log("here");
  setup = [
    {
      command: {
        normal: `cp ./docker_config/docker_node/Dockerfile ${dockerfilename}`,
      },
      name: "copy docker file",
    },
    {
      command: {
        normal: `cp ./docker_config/docker_node/.dockerignore ${dockerignorefile}`,
      },
      name: "copy docker file",
    },
  ];

  return setup;
};

const saveconfigurations = (project, env) => {
  let dockerfilename = env.projectDir + "/Dockerfile";

  setup = [
    {
      command: {
        normal: `touch ${env.projectDir}/src/.env`,
      },
      name: "make .env file",
    },
  ];

  for (let config of project.config_vars) {
    setup.push({
      command: {
        normal:
          "echo " +
          config.key +
          "=" +
          config.value +
          `>> ${env.projectDir}/src/.env`,
      },
      name: "make values to .env",
    });
  }

  return setup;
};

const dockerBuild = async (project, env) => {
  let totalproject = await Project.find({});
  let port = 3000 + totalproject.length;
  let linked_containers = "";
  for (let db of project.databases) {
    linked_containers += `--link ${db.containername}`;
  }

  setup = [
    {
      command: {
        normal: `cd ${env.projectDir} && ${
          docker.commands["dockerBuildContext"](
            project.version + ".0",
            project.name.toLowerCase() + "/test"
          ).normal
        }`,
        revert: docker.commands["remove"]("image", project.name).normal,
      },
      name: "docker build image",
    },
    {
      command: docker.commands["dockerRun"](
        `-i --rm -e VIRTUAL_HOST=localhost -e VIRTUAL_PORT=3000 --env-file ${
          env.projectDir
        }/src/.env --name ${project.name.toLowerCase()} --net nginx-proxy -p ${port}:3000 ${project.name.toLowerCase()}/test:${
          project.version
        }.0 node /usr/src/app/src/app.js`
      ),
      name: "docker run",
    },
  ];

  project.port = port;
  project.save();
  return setup;
};

const getprojectEnv = async (project) => {
  const serverBasePath = process.env.SERVER_BASE_PATH;
  return {
    server_username: process.env.SERVER_USERNAME,
    projectDir: serverBasePath + project.name,
  };
};

const intialSetup = async (project) => {
  const env = getprojectEnv(project);

  let basicsetup = [
    {
      command: utils.commands["mkdir"](`-p ${env.projectDir}`),
      name: "make project dir",
    },
    {
      command: utils.commands["mkdir"](`-p ${env.projectDir}/src`),
      name: "make project dir",
    },
    {
      command: utils.commands["clone"](
        project.repoUrl,
        env.projectDir + "/src"
      ),
      name: "clone repo",
    },
  ];

  let fallbackArr = [];
  try {
    fallbackArr.push({
      command: {
        normal: `rm -rf ${env.projectDir}`,
      },
      name: "There is a error in deploying hence removing project dir",
    });

    await utils.multiplecommands(
      basicsetup,
      "NODE SETUP",
      utils.cb,
      fallbackArr
    );

    //docker
    await utils.multiplecommands(
      await dockersetup(project, env),
      "DOCKER SETUP",
      utils.cb,
      fallbackArr
    );
    //env file
    await utils.multiplecommands(
      await saveconfigurations(project, env),
      "DOCKER SETUP",
      utils.cb,
      fallbackArr
    );
  } catch (err) {
    console.log("Reverting changes".bgBlue, err);
    await utils.multiplecommands(
      fallbackArr,
      "mongo db creation block ",
      (err, name) => {
        console.log("Error while reverting changes".blink + name + "\n" + err);
      }
    );
    if (err) throw err;
  }
};

const saveEnv = async (config) => {
  const env = getprojectEnv(project);
  let fallbackArr = [];
  try {
    //save to env
    await utils.multiplecommands(
      [
        {
          command: {
            normal:
              "echo " +
              config.key +
              "=" +
              config.value +
              `>> ${env.projectDir}/src/.env`,
          },
          name: "save to .env",
        },
      ],
      "SAVING TO ENV FILE",
      utils.cb,
      fallbackArr
    );
  } catch (err) {
    console.log("Reverting changes".bgBlue, err);
    await utils.multiplecommands(
      fallbackArr,
      "mongo db creation block ",
      (err, name) => {
        console.log("Error while reverting changes".blink + name + "\n" + err);
      }
    );
    if (err) throw err;
  }
};

const updateEnv = async (config, state = "update") => {
  const env = getprojectEnv(project);
  let fallbackArr = [];
  try {
    fs.readFile(
      `${env.projectDir}/src/.env`,
      { encoding: "utf-8" },
      function (err, data) {
        if (err) throw error;

        let dataArray = data.split("\n");
        const searchKeyword = config.key;
        let lastIndex = -1;

        for (let index = 0; index < dataArray.length; index++) {
          if ((dataArray[index].split("=")[0] = searchKeyword)) {
            lastIndex = index;
            break;
          }
        }

        dataArray.splice(lastIndex, 1);

        const updatedData = dataArray.join("\n");
        fs.writeFile(`${env.projectDir}/src/.env`, updatedData, (err) => {
          if (err) throw err;
          console.log("Successfully updated the file data");
        });
      }
    );
    if (state != "del") {
      await utils.multiplecommands(
        [
          {
            command: {
              normal:
                "echo " +
                config.key +
                "=" +
                config.value +
                `>> ${env.projectDir}/src/.env`,
            },
            name: "update .env",
          },
        ],
        "UPDATING  ENV FILE",
        utils.cb,
        fallbackArr
      );
    }
  } catch (err) {
    console.log("Reverting changes".bgBlue, err);
    await utils.multiplecommands(
      fallbackArr,
      "mongo db creation block ",
      (err, name) => {
        console.log("Error while reverting changes".blink + name + "\n" + err);
      }
    );
    if (err) throw err;
  }
};

const deploy = async (project) => {
  const env = getprojectEnv(project);
  let fallbackArr = [];
  try {
    await utils.multiplecommands(
      await dockerBuild(project, env),
      "DOCKER BUILD",
      utils.cb,
      fallbackArr
    );
  } catch (err) {
    console.log("Reverting changes".bgBlue, err);
    await utils.multiplecommands(
      fallbackArr,
      "mongo db creation block ",
      (err, name) => {
        console.log("Error while reverting changes".blink + name + "\n" + err);
      }
    );
    if (err) throw err;
  }
};

module.exports = {
  deploy,
  commands,
  updateEnv,
  saveEnv,
  intialSetup,
};
