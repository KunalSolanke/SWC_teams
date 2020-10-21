const express = require('express')
const allDeploy = require('./deploy/all_deploy.js')
const app = express()
require('dotenv').config()



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/',(req,res)=>{
    res.sendFile('index.html',{root:__dirname})
})




app.post("/deploy",async (req,res)=>{
    console.log(req.body)
    let route = require('./deploy/node_deploy.js')
    route.deploy(req.body)
    res.redirect('/')
    
})




app.listen(3000,()=>{
    console.log("listening at 3000")
})

