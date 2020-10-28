const express = require('express')
const allDeploy = require('./deploy/all_deploy.js')
const path = require('path')
const app = express()
var logger = require('morgan');
const db = require('./db/db') ;
const {User,Project}=require('./models/allModels.js')
const LocalStrategy = require("passport-local");
const passport = require('passport')
const session = require('express-session')
const {images} = require('./command/docker.js')
var expressejsLayout = require('express-ejs-layouts')




//env
require('dotenv').config()


//logging and data parsers
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(logger('dev'))
app.use('/static',express.static(path.join(__dirname, 'public')));


//passport

app.use(session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 24 * 60 * 60 * 2 },
    //cookie:{maxAge:1000}
})); 

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 




//view engine
app.use(expressejsLayout)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');







/* ==============
ROUTES
===================== */





//bind user to response
app.use((req, res, next) => {
    try {
        
        res.locals.user = req.user || null;
        
        next()
    } catch {
        res.send("Error")
    }
})








app.get('/',(req,res)=>{
    res.render("home")
})





app.get('/test', (req, res) => {
    res.render("test")
})


app.get('/test2', (req, res) => {
    res.render("projectdetails")
})


app.get('/create-project', (req, res) => {
    res.render("deployPage")
})






app.post("/create-project",isLoggedin,async (req,res)=>{
    
    let {name,link,platfrom,domain} = req.body ;
    if(domain === ""){
        domain = name +'.voldemort.wtf'
    }
    let project = await new Project({name:name,repoUrl:link,user :req.user._id,platfrom:platfrom,domain:domain,version:1})

    res.redirect(`/project/${project._id}`)
    
})





app.get("/project/:id",async (req,res)=>{
    const projectId = req.query.id 
    const project = await (await Project.findById(projectId)).populated('user').populate('databases').execPopulate();



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
})








app.post("/project/:id/databases",async (req,res)=>{
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
})








app.post("/project/:id/config", async (req, res) => {
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
    
})


app.post("/project/:id", async (req, res) => {
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

})








// project pages 

app.get("/myprojects",isLoggedin,async (req,res)=>{
    res.render("projects")
})





// Handling user signup -login



app.get('/logout',(req,res)=>{
    if(req.user){
        req.logout()
    }

    res.redirect('/accounts/login')
})







app.get("/accounts/register", function (req, res) {
    res.render("register");
});









app.post("/accounts/register", function (req, res) {
   let {username,email,password} = req.body ;
    User.register(new User({ username: username,email:email }),
        password, function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect("/accounts/register");
            }

            passport.authenticate("local")(
                req, res, function () {
                    res.redirect('/create-project');
                });
        });
});








//Showing login form const LocalStrategy = require("passport-local");

app.get("/accounts/login", function (req, res) {
    res.render("login");
});



//Handling user login 
app.post("/accounts/login", passport.authenticate("local", {
    successRedirect: "/create-project",
    failureRedirect: "/accounts/login"
}), function (req, res) {
    console.log(req.user)
}); 






function isLoggedin(req,res,next){
    if(req.user){
        req.isLoggedin = true ;
     next()
    }else{
    res.redirect('/accounts/login')}
}






app.listen(process.env.PORT,()=>{
    console.log("listening at http://localhost:8000")
})

