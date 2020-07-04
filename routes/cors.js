const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://shad3-GE63-Raider-RGB-8RF:3001",
    "http://datastack.ml"
];

var cosrOptionsDelegate = (req,callback) =>{
    var corsOptions;
    // check if the incoming request is in the whitelist
    if(whitelist.indexOf(req.header('Origin'))!==-1){
        // telling client that the request is from a whitelisted origin
        console.log("White Listed\n\n")
        corsOptions = {origin: true};
    }
    else{
        console.log("Disabled COrs!!\n\n")
        corsOptions = {origin:false};
    }
    callback(null,corsOptions);
};

// this export allows any origin as true 
// true: Telling client (browser) the origin is a whitelisted origin
exports.cors = cors();
// this export allows only whitelisted origin as true
exports.corsWithOptions = cors(cosrOptionsDelegate);