
function isLoggedin(req,res,next){
    if(req.user){
        req.isLoggedin = true ;
     next()
    }else{
    res.redirect('/accounts/login')}
}

module.exports = isLoggedin ;
