const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hindiTextSchema = new Schema({
    fileName:{
        type: String,
        required: true,
        unique:true
    },
    hindiText:{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        default: false
    },
    speaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserBase'
    },
    inAccess: {
        type:Boolean,
        default: false
    }
});

var HindiText = mongoose.model("HindiText",hindiTextSchema);
module.exports=HindiText;