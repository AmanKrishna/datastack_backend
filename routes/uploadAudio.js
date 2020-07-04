const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AudioData = require('../model/audio');
const cors = require("./cors");
let multer = require('multer');
let upload = multer();
var fs = require('fs');

const uploadAudioRouter = express.Router();
// uploadAudioRouter.use(upload.array());
// uploadAudioRouter.use(upload.single('audio_data'));
uploadAudioRouter.use(bodyParser.json());


console.log("Disabled COrs!!\n\n")
// uploadAudioRouter.use(function(req, res, next) {
//     console.log('here');
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

uploadAudioRouter.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,(req,res,next)=>{
    AudioData.find({})
    .then((audio)=>{
        if(audio.length===0){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/son');
            res.json({});
            return;
        }
        console.log("Audio Get Request: ",audio);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        var buffer = fs.readFileSync("./public/audio/"+audio[0].audioBlob+".txt");
        res.json({"name":audio[0].audioBlob,"audioBlob":buffer.toString()});
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,(req,res,next)=>{
    console.log("This is the body of request ",req.body)
    AudioData.create({audioBlob:req.body.name})
    .then((audio)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json({"Success":true});
    },(err)=>next(err))
    .catch((err)=>next(err));
    var writer = fs.createWriteStream('./public/audio/'+req.body.name+'.txt');
    writer.write(req.body.audioBlob);
    console.log("Maybe Successfull\n\n");
})
.delete(cors.corsWithOptions,(req,res,next)=>{
    AudioData.remove({})
    .then((resp)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
module.exports = uploadAudioRouter;