const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Admin = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
// adds the username and hashed password
Admin.plugin(passportLocalMongoose);

module.exports = mongoose.model('admin',Admin);