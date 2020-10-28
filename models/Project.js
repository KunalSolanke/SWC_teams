const mongoose = require('mongoose')


const ProjectSchmea = mongoose.Schema({
    version :Number,
    name: {
        type: String,
        required: true,
        unique: true
    },
    domain :{
        type : String,
        unique : true
    },
    platform : {
        type : String,
        required : true
    },
    repoUrl: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    databases: [{
          type: mongoose.Schema.Types.ObjectId,
          ref : 'Database'
    }],
    config_vars: [{
        key: String,
        value: String
    }],
    databaseConfigured : Boolean
}, {
    timestamps: true
})

const Project = mongoose.model('Project', ProjectSchmea)
module.exports = Project