const bodyParser = require('body-parser');
var User = require('../model/user');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')

// calling cors
const cors = require("./cors");

const adminRouter = express.Router();
adminRouter.use(bodyParser.json());

adminRouter.route('/users/:hours')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
    User.find({"lastActive":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)}})
    .then((users)=>{
        console.log(users.length)
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


adminRouter.route('/users/list/:hours')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
    User.find({"lastActive":{$gt:new Date(Date.now() - req.params.hours*60*60*1000)}})
    .then((users)=>{
        console.log(users.length)
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(users);    
    },(err)=>next(err))
    .catch((err)=>next(err));
})
module.exports = adminRouter;