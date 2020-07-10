const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const audioSchema = new Schema({
    fileName:{
        type: String,
        required: true,
        unique:true
    },
    verified:{
        type:Number,
        default:0
    },
    verificationResult:{
        type:Number,
        default:0
    },
    speaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserBase'
    },
    textInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HindiText'
    }
});

var Audio = mongoose.model("AudioData",audioSchema);
module.exports=Audio;