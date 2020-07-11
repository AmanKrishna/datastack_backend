const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HindiText = require('../model/hindiText');
const cors = require("./cors");
let multer = require('multer');
let upload = multer();
var fs = require('fs');
var authenticate = require('../authenticate');

const hindiText = express.Router();
hindiText.use(bodyParser.json());

hindiText.route('/')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    // HindiText.find({})
    // .then((hindiText)=>{
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type','application/json');
    //     res.json(hindiText);
    //     return;
    // })
    HindiText.aggregate([
        {$match:{status:false,inAccess:false}},
        {$sample:{size:1}}
    ])
    .then((hindiText)=>{
        if(hindiText.length===0){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({
                fileName: "None",
                hindiText: "Try Again Later",
                _id:""
            });
            return;
        }
        // console.log(hindiText);
        HindiText.findByIdAndUpdate(hindiText[0]._id,{
            $set: {
                inAccess: true
            }
        },{ new: true })
        .then((hindiText)=>{
            // console.log("Audio Get Request: ",hindiText);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(hindiText);
        },(err)=>next(err))
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    // res.statusCode = 403;
    // res.setHeader('Content-Type','application/json');
    // res.json({"Status":"Not Allowed"});

    console.log("In Post\n")
    for(let i=0;i<20;++i){
        var buffer = fs.readFileSync("./public/hinditext/"+"sample_"+i+".txt").toString();
        HindiText.create({
            fileName:"sample_"+i+".txt",
            hindiText: buffer,
        })
        .then((resp)=>console.log(resp))
    }
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({"success":"true"});
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    HindiText.findByIdAndUpdate(req.body.hindiTextId,{
        $set:{
            inAccess:false
        }
    },{new:true})
    .then((hindiText)=>{
        console.log(hindiText);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({"success":true});
    })
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    HindiText.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
})


hindiText.route('/:hindiTextId')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    HindiText.findById(req.params.hindiTextId)
    .then((hindiText)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(hindiText);
        return;
    })
    .catch((err)=>next(err));
});


module.exports = hindiText;