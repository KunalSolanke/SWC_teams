const express = require('express')
const app = express()



const IntializeDeploy = require('./ssh/connection.js')
require('dotenv').config()




app.get('/',(req,res)=>{
    res.sendFile('index.html',{root:__dirname})
})



app.post("/deploy",async (req,res)=>{
    IntializeDeploy("node",req.body)
    res,send("Deployed")
})




app.listen(3000,()=>{
    console.log("listening at 3000")
})