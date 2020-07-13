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
        console.log(audio);
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
        var wavFile = fs.readFileSync("./public/audio/"+audio[0].fileName.substr(0,audio[0].fileName.lastIndexOf("."))+'.wav','binary');
        
        res.json({
            "success":true,
            "_id":audio[0]._id,
            "speaker":audio[0].speaker,
            "textInfo":audio[0].hindiText[0].hindiText,
            "wavFile":wavFile
        })
    },(err)=>next("Audio Fetch failed!!!!"))
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
                // console.log(typeof(req.body.audioBlob));
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json({"success":true});
                var after_split = req.body.audioBlob.split(',')[1]
                var buffer = new Buffer(after_split,'base64');
                var writer = fs.createWriteStream('./public/audio/'+req.body.fileName.substr(0,req.body.fileName.lastIndexOf("."))+'.wav');
                writer.write(buffer);
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
        // console.log("Audio Uploaded");
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

audio.route('/:audioId/:textId')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    AudioData.findByIdAndDelete(req.params.audioId)
    .then((resp)=>{
        HindiText.findByIdAndUpdate(req.params.textId,{
            $set: {
                status: false,
                speaker: null,
                inAccess:false
            }
        },{new:true})
        .then((hindiText)=>{
            // console.log(hindiText);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({
                success:true
            });
        })
    },(err)=>next(err))
    .catch((err)=>next(err));
})

module.exports = audio;