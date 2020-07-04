const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const audioSchema = new Schema({
    audioBlob:{
        type: String,
        required: true,
        unique:true
    }
});

var Audio = mongoose.model("AudioData",audioSchema);
module.exports=Audio;