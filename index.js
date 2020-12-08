const express = require('express')
const path = require('path')
const app = express()
const logger = require('morgan');
const db = require('./db/db') ;
const {User}=require('./models/allModels.js')
const LocalStrategy = require("passport-local");
const passport = require('passport')
const session = require('express-session')
const expressejsLayout = require('express-ejs-layouts')
const helmet = require('helmet') ;




//env
require('dotenv').config()


//logging and data parsers
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(logger('tiny'))
app.use(helmet()) ;
app.use('/static',express.static(path.join(__dirname, 'public')));





//passport

app.use(session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 24 * 60 * 60 * 2 },
    //cookie:{maxAge:1000}
})); 



//initialize passport
app.use(passport.initialize());
app.use(passport.session());



//strategy to use for passport authentication
passport.use(new LocalStrategy(User.authenticate()));


//get user data from strategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 



//view engine
app.use(expressejsLayout)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



/* 
=====================
ROUTES
===================== 
*/


//bind user to response
app.use((req, res, next) => {
    try {
        
        res.locals.user = req.user || null;
        
        next()
    } catch {
        res.send("Error")
    }
})



//router
const router = require('./router/index') ;
app.use('',router) ;


//start server
app.listen(process.env.PORT,()=>{
    console.log(`listening at http://localhost:${process.env.PORT}`)
})

