const {Project } = require('../models/allModels') ;
const {images} = require('../command/docker.js')
const allDeploy = require('../deploy/all_deploy.js');
const { postProfile } = require('./user');



//post request for create project page with initial page info 
exports.postCreateProject = function (req,res){
    
    let {name,link,platform,domain} = req.body ;
    console.log(req.body) ;
    if(domain === ""){
        domain = name +'.voldemort.wtf'
    }
    let project =new  Project({name:name,repoUrl:link,user :req.user._id,platform:platform,domain:domain,version:1})
    project.save(function(err){
        console.log(err)
    })
  
   console.log(project._id);
    res.setHeader("Content-Type", "text/html")
    res.redirect(`/project/${project._id}`) ;

}




//render project project with project_id
exports.getProject =function (req,res){
    const projectId = req.params.id ;
    console.log(req) ;
    console.log(projectId) ;

    Project.findById(projectId).then(project=>{
      
        console.log(project)
        console.log(project.user);
        project.populate('user').execPopulate() ;
        let databases = [{
            "name": "MongoDb",
            "desciption": "NoSQL database",
            "image": "",
            "formname": "mongo"
        },
        {
            "name": "PostgresDb",
            "desciption": "SQL database",
            "image": "",
            "formname": "postgres"
        }
        ]

        res.render("projectdetails", { "project": project, "databases": databases })

    }) ;
   
}







//configuring project with databaseConfigurtions
exports.postDatabase = async (req,res)=>{
    const projectId = req.params.id 
    const project = await Project.findById(projectId).populated('user').populate('databases').execPopulate() ;

   

  for (const [k,v] of Object.entries(req.body)){

    if(k=="DBCONFIGURED"){
        if(v){
            project.databaseConfigured = true ;
            project.save()
        }

    }else{
        if(v){
              await images[k](project)
        }
    }

    
  }
}







//project config variabeles
exports.postConfig =  async (req, res) => {
    let { key,value} = req.body;
    const projectId = req.params.id 
    const project = await Project.findById(projectId).populated('user').populate('databases').execPopulate() ;
    
    try{
    project.config = project.config.concat([{
        key : key,
        value : value
    }])
    await project.save()

    res.send("config_added")
    }catch(e){
        res.json({
            "error" : e
        })
}
    
}




//finally deploy the project with above configurations
exports.postProject = async (req, res) => {
    const projectId = req.params.id ;
    const project = await Project.findById(projectId).populated('user').populate('databases').execPopulate();
    if (!project.databaseConfigured) {
        res.send("can't deploy")
    }
    try {
        let appToDeploy = allDeploy.default["node"]
        appToDeploy.deploy(project)
    } catch (err) {
        console.log(err)
        res.json({
            "error": err
        })
    }

}




exports.getCreateProject = (req, res) => {
    res.render("deployPage")
}

