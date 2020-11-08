const {Project } = require('../models/allModels') ;
const {images} = require('../command/docker.js')
const allDeploy = require('../deploy/all_deploy.js')



//post request for create project page with initial page info 
exports.postCreateProject = async (req,res)=>{
    
    let {name,link,platfrom,domain} = req.body ;
    if(domain === ""){
        domain = name +'.voldemort.wtf'
    }
    let project = await new Project({name:name,repoUrl:link,user :req.user._id,platfrom:platfrom,domain:domain,version:1})

    res.redirect(`/project/${project._id}`)
    
}




//render project project with project_id
exports.getProject =async (req,res)=>{
    const projectId = req.query.id 
    const project = await (await Project.findById(projectId)).populate('user').populate('databases').execPopulate();



    let databases = [{
        "name" : "MongoDb",
        "desciption" : "NoSQL database",
         "image" : "",
         "formname":"mongo"
      },
        {
            "name": "PostgresDb",
            "desciption": "SQL database",
            "image": "",
            "formname": "postgres"
        }
]

    res.render("projectdetails",{"project":project,"databases":databases})
}







//configuring project with databaseConfigurtions
exports.postDatabase = async (req,res)=>{
    const projectId = req.query.id 
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
    const projectId = req.query.id 
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
    const projectId = req.query.id
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

