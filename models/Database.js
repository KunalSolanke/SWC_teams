const mongoose = require('mongoose')

const DatabaseSchmea = mongoose.Schema({
 name : {
     type:String,
     required:true,
     unique : true
 },
 containername :String,
 user : {
     ref : 'User',
     type : mongoose.Schema.Types.ObjectId
 },
project: {
        ref: 'Project',
        type: mongoose.Schema.Types.ObjectId
},
 type :{
     type : String,
     required: true
 },
 configs  :[
     {
         key : String,
         value : String
     }
 ],
 port : Number

},{
    timestamps : true
})

const Database = mongoose.model('Database',DatabaseSchmea) ;
module.exports = Database ;