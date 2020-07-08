const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HindiText = require('../model/hindiText');
const cors = require("./cors");
let multer = require('multer');
let upload = multer();
var fs = require('fs');
var authenticate = require('../authenticate');

const downloadAudioRouter = express.Router();
downloadAudioRouter.use(bodyParser.json());

module.exports = downloadAudioRouter;
downloadAudioRouter.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    HindiText.findOne({status:false})
    .then((hindiText)=>{
        if(hindiText.length===0){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/son');
            res.json({
                fileName: "None",
                hindiText: "Try Again Later"
            });
            return;
        }
        // console.log("Audio Get Request: ",audio);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json(hindiText);
    })
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.setHeader('Content-Type','application/son');
    res.json({"Status":"Not Allowed"});

    // console.log("In Post\n")
    // for(let i=0;i<20;++i){
    //     var buffer = fs.readFileSync("./public/hinditext/"+"sample_"+i+".txt").toString();
    //     HindiText.create({
    //         fileName:"sample_"+i+".txt",
    //         hindiText: buffer
    //     })
    //     .then((resp)=>console.log(resp))
    // }
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.setHeader('Content-Type','application/son');
    res.json({"Status":"Not Allowed"});
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    HindiText.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})