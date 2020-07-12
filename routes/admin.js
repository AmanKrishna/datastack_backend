const bodyParser = require('body-parser');
var User = require('../model/user');
var Audio = require('../model/audio');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')
var fs = require('fs');
// calling cors
const cors = require("./cors");

const adminRouter = express.Router();
adminRouter.use(bodyParser.json());

// get By lastActive
adminRouter.route('/users/:hours/:minRecord/:maxRecord/:minVerify/:maxVerify')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  console.log(req.params.minVerify+" "+req.params.maxVerify);
  User.find({
      "lastActive":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)},
      "verified":{
        $gte:req.params.minVerify,
        $lte:req.params.maxVerify
      },
      "recored":{
        $gte:req.params.minRecord,
        $lte:req.params.maxRecord
      }
    })
    .then((users)=>{
        console.log(users)
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(users.length);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})
// .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
//     User.remove({})
//     .then((resp)=>{
//         console.log("Audio Uploaded");
//         res.statusCode = 200;
//         res.setHeader('Content-Type','application/json');
//         res.json(resp);
//     },(err)=>next(err))
//     .catch((err)=>next(err));
// })


adminRouter.route('/users/list/:hours/:minRecord/:maxRecord/:minVerify/:maxVerify')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  User.find({
    "lastActive":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)},
    "verified":{
      $gte:req.params.minVerify,
      $lte:req.params.maxVerify
    },
    "recored":{
      $gte:req.params.minRecord,
      $lte:req.params.maxRecord
    }
  })
  .then((users)=>{
        console.log(users.length)
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(users);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

// get User by username
adminRouter.route('/users/:username')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  User.find({
    "username":req.params.username
  })
  .then((users)=>{
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(users);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

// get count of recording done in the timespan
adminRouter.route('/audio/count/time/:hours')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  Audio.count({
    "updatedAt":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)}
  })
  .then((count)=>{
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(count);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

// get audio by number
adminRouter.route('/audio/list/time/:hours/:maxNumber')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  Audio.find({
    "updatedAt":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)}
  })
  .limit(parseInt(req.params.maxNumber))
  .populate("speaker")
  .populate("textInfo")
  .lean()
  .then((audios)=>{
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    for(let i=0;i<audios.length;++i){
      var buffer = fs.readFileSync("./public/audio/"+audios[i].fileName+".txt");
      audios[i].audioBlob = buffer.toString();
    }
    res.json(audios);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

adminRouter.route('/audio/file/:fileName')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  console.log(req.params.fileName);
  var audioBlob=[]
  Audio.find({
    "fileName":req.params.fileName
  })
  .populate("speaker")
  .populate("textInfo")
  .lean()
  .then((audio)=>{
    // console.log(audio);
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    var buffer = fs.readFileSync("./public/audio/"+audio[0].fileName+".txt");
    audio[0].audioBlob = buffer.toString();
    res.json(audio);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

module.exports = adminRouter;