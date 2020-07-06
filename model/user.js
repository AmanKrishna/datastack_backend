const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    gender: {
        type: Boolean,
        required: true
        // 0 male
        // 1 Female
    }
});
// adds the username and hashed password
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('UserBase',User);