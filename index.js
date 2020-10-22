const express = require('express')
const allDeploy = require('./deploy/all_deploy.js')
const path = require('path')
const app = express()
var logger = require('morgan');
const db = require('./db/db') ;
const {User}=require('./models/allModels.js')
const LocalStrategy = require("passport-local");
const passport = require('passport')
var expressejsLayout = require('express-ejs-layouts')



//env
require('dotenv').config()


//logging and data parsers
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(logger('dev'))
app.use('/static',express.static(path.join(__dirname, 'public')));


//passport

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 




//view engine
app.use(expressejsLayout)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
    res.render("home")
})



app.get('/deploy', (req, res) => {
    res.render("deployPage")
})




app.post("/deploy",async (req,res)=>{
    let appToDeploy = allDeploy.default["node"]
    appToDeploy.deploy(req.body)
    res.redirect('/')
    
})





// Handling user signup -login

app.get("/accounts/register", function (req, res) {
    res.render("register");
});


app.post("/accounts/register", function (req, res) {
   let {username,email,password} = req.body ;
    User.register(new User({ username: username,email:email }),
        password, function (err, user) {
            if (err) {
                console.log(err);
                return res.render("register");
            }

            passport.authenticate("local")(
                req, res, function () {
                    res.render("deployPage");
                });
        });
});





//Showing login form 
app.get("/accounts/login", function (req, res) {
    res.render("login");
});



//Handling user login 
app.post("/accounts/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/account/login"
}), function (req, res) {
}); 




app.listen(3001,()=>{
    console.log("listening at http://localhost:3001")
})

