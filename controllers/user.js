const passport = require('passport') ; 
const isLoggedin = require('../middlewares/auth') ;




exports.getMyProjects = async (req,res)=>{
    res.render("projects")
}



// Handling user signup -login

exports.logout = (req,res)=>{
    if(req.user){
        req.logout()
    }
    res.setHeader("Content-Type", "text/html")
    res.redirect('/accounts/login')
}



exports.getSignup = function (req, res) {
    res.render("register");
}



exports.postSignup = function (req, res) {
   let {username,email,password} = req.body ;
    User.register(new User({ username: username,email:email }),
        password, function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect("/accounts/register");
            }

            passport.authenticate("local")(
                req, res, function () {
			res.redirect('/project/create');
                });
        });
};




//Showing login form const LocalStrategy = require("passport-local");

exports.getLogin = function (req, res) {
    res.render("login");
} ;



//Handling user login 
exports.postLogin = passport.authenticate("local", {
	successRedirect: "/project/create",
    failureRedirect: "/accounts/login"
}), function (req, res) {
    console.log(req.user)
}; 

exports.getProfile = async(req,res) =>{
	res.send("under construction") ;
}

exports.postProfile = async (req,res)=> {
	res.send("under construction") ;
}



