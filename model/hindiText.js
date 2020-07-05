const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hindiTextSchema = new Schema({
    hindiTextFileName:{
        type: String,
        required: true,
        unique:true
    }
});

var HindiText = mongoose.model("HindiText",hindiTextSchema);
module.exports=HindiText;