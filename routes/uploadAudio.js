const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AudioData = require('../model/audio');
const cors = require("./cors");
let multer = require('multer');
const HindiText = require('../model/hindiText');
var authenticate = require('../authenticate');
var fs = require('fs');

const uploadAudioRouter = express.Router();
uploadAudioRouter.use(bodyParser.json());

uploadAudioRouter.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    AudioData.find({})
    .populate('speaker')
    .populate('textInfo')
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
        var buffer = fs.readFileSync("./public/audio/"+audio[0].fileName+".txt");
        res.json({
            "fileName":audio[0].fileName,
            "speaker":audio[0].speaker,
            "textInfo":audio[0].textInfo,
            "audioBlob":buffer.toString()});
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    if(req.body!=null){
        AudioData.create({
            fileName: req.body.fileName,
            speaker: req.user._id,
            textInfo: req.body.textInfo
        })
        .then((audio)=>{
            HindiText.findByIdAndUpdate(req.body.textInfo,{
                $set: {
                    status: true,
                    speaker: req.user._id
                }
            })
            .then((resp)=>{
                console.log("Audio Uploaded");
                res.statusCode = 200;
                res.setHeader('Content-Type','application/son');
                res.json({"success":true});
                var writer = fs.createWriteStream('./public/audio/'+req.body.fileName+'.txt');
                writer.write(req.body.audioBlob)
            },err=>next(err))
        },(err)=>next(err))
        .catch((err)=>next(err));
    }
    else{
        err = new Error('Audio Not found in the body');
        err.status = 404;
        return next(err);   
    }
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
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