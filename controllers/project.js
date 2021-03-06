const { Project } = require("../models/allModels");
const { images } = require("../command/docker.js");
const allDeploy = require("../deploy/all_deploy.js");
const { postProfile } = require("./user");
const fs = require('fs');
const utilities = require("../utilities");

//post request for create project page with initial page info
exports.postCreateProject = async (req, res) => {
  let { name, link, platform, domain } = req.body;
  if (domain === "") {
    domain = name + ".voldemort.wtf";
  }
  try {
    let project = await new Project({
      name: name,
      repoUrl: link,
      user: req.user._id,
      platform: platform,
      domain: domain,
      version: 1,
      config_vars:[
        {
          key:'mainfile',
          value:'index.js'
        }
      ]
    });
    await project.save(function (err) {
      console.log(err);
    });
    let appToDeploy = allDeploy.default["node"];
    await appToDeploy.intialSetup(project);
    res.setHeader("Content-Type", "text/html");
    res.redirect(`/project/${project._id}`);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

//render project project with project_id
exports.getProject = function (req, res) {
  const projectId = req.params.id;

  Project.findById(projectId).then((project) => {
    project.populate("user").execPopulate();

    let databases = [
      {
        name: "MongoDb",
        desciption: "NoSQL database",
        image: "",
        formname: "mongo",
      },
      {
        name: "PostgresDb",
        desciption: "SQL database",
        image: "",
        formname: "postgres",
      },
    ];
    res.render("projectdetails", { project: project, databases: databases });
  });
};

//configuring project with databaseConfigurtions
exports.postDatabase = async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  await project.populate("user").execPopulate();
  await project.populate("databases").execPopulate();

  console.log(req.body);
  for (const [k, v] of Object.entries(req.body)) {
    if (k == "DBCONFIGURED") {
      if (v) {
        project.databaseConfigured = true;
        project.save();
      }
    } else {
      if (v) {
        try {
          await images[k](project);
        } catch (err) {
          console.log(err);
          res.status(400).json({
            success: false,
            message: err.message,
          });
          if (err) throw err;
        }
      }
    }
  }
};

//project config variabeles
exports.postConfig = async (req, res) => {
  let { key, value } = req.body;

  const projectId = req.params.id;
  const project = await Project.findById(projectId);

  try {
    project.config_vars = project.config_vars.concat([
      {
        key: key,
        value: value,
      },
    ]);
    await project.save();
    res.json({
      success: true,
      message: "configuration update",
      status: 200,
    });
  } catch (e) {
    res.json({
      error: e,
    });
  }
};

exports.updateConfig = async (req, res) => {
  let { key, value } = req.body;
  const projectId = req.params.id;
  const project = await Project.findById(projectId);

  try {
    project.config_vars.forEach((obj) => {
      if (obj.key == key) obj.value = value;
    });

    await project.save();
    res.json({
      success: true,
      message: "configuration update",
      status: 200,
    });
  } catch (e) {
    res.status(400).json({
      error: e,
    });
  }
};


exports.deleteConfig = async (req, res) => {
  let { key, value } = req.body;
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  try {
    project.config_vars = project.config_vars.filter((obj) => {
      return !(obj.key == key);
    });

    await project.save();
    res.json({
      success: true,
      message: "configuration update",
      status: 200,
    });
  } catch (e) {
    res.json({
      error: e,
    });
  }
};

//finally deploy the project with above configurations
exports.postProject = async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  await project.populate("databases").execPopulate();
  await project.populate("user").execPopulate();
  if (!project.databaseConfigured) {
    res.send("can't deploy");
  }
  try {
    let appToDeploy = allDeploy.default["node"];
    await appToDeploy.deploy(project);
  } catch (err) {
    console.log(err);
    res.json({
      error: err,
    });
  }
};

exports.getCreateProject = (req, res) => {
  res.render("deployPage");
};
