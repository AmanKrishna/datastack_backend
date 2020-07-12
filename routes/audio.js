const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AudioData = require('../model/audio');
const cors = require("./cors");
let multer = require('multer');
const HindiText = require('../model/hindiText');
var authenticate = require('../authenticate');
var fs = require('fs');

const audio = express.Router();
audio.use(bodyParser.json());

audio.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    AudioData.aggregate([
        {$match:{verified:0}},
        {$lookup: {
            from: HindiText.collection.name,
            localField: "textInfo",
            foreignField: "_id",
            as: "hindiText"
        }},
        {$sample:{size:1}}
    ])
    // AudioData.findOne({})
    // .populate('speaker')
    // .populate('textInfo')
    .then((audio)=>{
        // console.log(typeof(audio[0].textInfo));
        if(audio.length===0){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({
                "success":false
            });
            return;
        }
        // console.log("Audio Get Request: ",audio);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        var buffer = fs.readFileSync("./public/audio/"+audio[0].fileName+".txt");
        res.json({
            "success":true,
            "_id":audio[0]._id,
            "speaker":audio[0].speaker,
            "textInfo":audio[0].hindiText[0].hindiText,
            "audioBlob":buffer.toString()
        })
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
                res.setHeader('Content-Type','application/json');
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
// Verificatoin of an audio
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    AudioData.findByIdAndUpdate(req.body._id,
        {
            $set:{
                verified:1,
                verificationResult:req.body.verificationResult
            }
        },
        {new:true}
    )
    .then((audio)=>{
        console.log(audio);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({
            "success":true
        });
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    AudioData.remove({})
    .then((resp)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

audio.route('/:audioId')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    AudioData.findByIdAndDelete(req.params.audioId)
    .then((resp)=>{
        console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

module.exports = audio;