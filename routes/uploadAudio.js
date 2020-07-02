const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AudioData = require('../model/audio');
const cors = require("./cors");
let multer = require('multer');
let upload = multer();

const uploadAudioRouter = express.Router();
uploadAudioRouter.use(upload.array());
uploadAudioRouter.use(bodyParser.json());

uploadAudioRouter.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,(req,res,next)=>{
    AudioData.find({})
    .then((audio)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json(audio);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,(req,res,next)=>{
    console.log("This is the body of request ",req.body,req.file)
    AudioData.create(req.body)
    .then((audio)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/son');
        res.json({"Success":true});
    },(err)=>next(err))
    .catch((err)=>next(err));
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