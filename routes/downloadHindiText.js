const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HindiText = require('../model/hindiText');
const cors = require("./cors");
let multer = require('multer');
let upload = multer();
var fs = require('fs');

const downloadAudioRouter = express.Router();
downloadAudioRouter.use(bodyParser.json());

module.exports = downloadAudioRouter;
downloadAudioRouter.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,(req,res,next)=>{
    HindiText.find({})
    .then((hindiText)=>{
        if(hindiText.length===0){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/son');
            res.json({});
            return;
        }
        // console.log("Audio Get Request: ",audio);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        var buffer = fs.readFileSync("./public/hinditextUnused/"+hindiText[0].hindiTextFileName);
        var myString = JSON.parse( JSON.stringify( buffer.toString('utf8') ) )
        console.log(myString)
        res.json({"FileName":hindiText[0].hindiTextFileName,"File":myString});
    })
})
.post(cors.corsWithOptions,(req,res,next)=>{
    res.statusCode = 403;
    res.setHeader('Content-Type','application/son');
    res.json({"Status":"Not Allowed"});
    return;
    // console.log("In Post\n")
    // for(let i=0;i<20;++i){
    //     HindiText.create({hindiTextFileName:"sample_"+i+".txt"})
    //     .then((resp)=>console.log(resp))
    // }
})