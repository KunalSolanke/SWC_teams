const mongoose = require('mongoose') ;
var passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: false
    },
    password: {
        type: String,
        minLength: 8
    },
}, {
    timestamps: true
})
UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', UserSchema);
module.exports = User;