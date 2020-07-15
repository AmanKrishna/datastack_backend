const bodyParser = require('body-parser');
var User = require('../model/user');
var Audio = require('../model/audio');
var express = require('express');
const HindiText = require('../model/hindiText');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')
var fs = require('fs');
// calling cors
const cors = require("./cors");

const adminRouter = express.Router();
adminRouter.use(bodyParser.json());


// check if admin!
adminRouter.route('/isAdmin')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  // console.log(req.params.minVerify+" "+req.params.maxVerify);
  User.findById(req.user._id)
    .then((user)=>{
      if(!user){
        // console.log(user)
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json({
          "success":false
        });
        return;
      }
      if(user.admin){
        // console.log(user)
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json({
          "success":true
        });
        return;
      }
      // console.log(user)
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json({
        "success":false
      });
    },(err)=>next(err))
    .catch((err)=>next(err));
})
// Count user By lastActive
adminRouter.route('/users/:hours/:minRecord/:maxRecord/:minVerify/:maxVerify')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  // console.log(req.params.minVerify+" "+req.params.maxVerify);
  User.countDocuments({
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
    .then((count)=>{
        // console.log(users)
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(count);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

// get list of user based on conditions
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
        // console.log(users.length)
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
adminRouter.route('/audio/list/time/:hours/:maxNumber/:verified/:verificationResult')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  console.log("kjndjkasdasjhdoiajdoiajsd");
  Audio.find({
    "updatedAt":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)},
    "verified":parseInt(req.params.verified),
    "verificationResult":parseInt(req.params.verificationResult)
  })
  .limit(parseInt(req.params.maxNumber))
  .populate("speaker")
  .populate("textInfo")
  .lean()
  .then((audios)=>{
    console.log(audios);
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    for(let i=0;i<audios.length;++i){
      var wavFile = fs.readFileSync("./public/audio/"+audios[i].fileName.substr(0,audios[i].fileName.lastIndexOf("."))+'.wav','binary');
      audios[i].wavFile = wavFile;
    }
    res.json(audios);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

// get specidifc Audio file
adminRouter.route('/audio/file/:fileName')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  console.log(req.params.fileName);
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
    var wavFile = fs.readFileSync("./public/audio/"+audio[0].fileName.substr(0,audio[0].fileName.lastIndexOf("."))+'.wav','binary');
    audio[0].wavFile = wavFile;
    res.json(audio);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})


// Endpoints for Getting Text Files

adminRouter.route('/text/file/:fileName')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  console.log(req.params.fileName);
  HindiText.find({
    "fileName":req.params.fileName
  })
  .populate("speaker")
  .lean()
  .then((text)=>{
    // console.log(audio);
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    res.json(text);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})

adminRouter.route('/text/fileDelete/:textId/:fileName')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    HindiText.findByIdAndDelete(req.params.textId)
    .then((resp)=>{
        Audio.findOne({"fileName":req.params.fileName})
        .then((audio)=>{
          if(!audio){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({
                success:true
            });
            return;
          }
          Audio.findByIdAndDelete(audio._id)
          .then((resp)=>{
            // console.log(hindiText);
            fs.unlinkSync('./public/audio/'+req.params.fileName.substr(0,req.params.fileName.lastIndexOf("."))+'.wav');
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({
                success:true
            });
          })
        })
    },(err)=>next(err))
    .catch((err)=>next(err));
})

adminRouter.route('/text/upload/:from/:to')
.options(cors.cors,(req,res)=>res.sendStatus=200)
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
  console.log("In Post\n")
  for(let i=parseInt(req.params.from);i<=parseInt(req.params.to);++i){
    var filePath = "./public/hindiText_to_upload/"+"sample_"+i+".txt";
    if(fs.existsSync(filePath)){
      var buffer = fs.readFileSync(filePath).toString();
      HindiText.create({
          fileName:"sample_"+i+".txt",
          hindiText: buffer,
      })
      .then((resp)=>console.log(resp))
    }
    else{
      console.log("in else");
    }
  }
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({"success":"true"});
})

module.exports = adminRouter;