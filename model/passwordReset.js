const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var passwordReset = new Schema({
    eamil: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiry:{
        type:Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PasswordReset',passwordReset);