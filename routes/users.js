const bodyParser = require('body-parser');
var User = require('../model/user');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')

// calling cors
const cors = require("./cors");

/* GET users listing. */
// in case of Preflight
// router.options('*',cors.corsWithOptions,(req,res)=>{res.status=200;})
router.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
  User.find({})
  .then((users)=>{
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    res.json(users);    
  },(err)=>next(err))
  .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
  User.remove({})
  .then((resp)=>{
      console.log("Audio Uploaded");
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(resp);
  },(err)=>next(err))
  .catch((err)=>next(err));
})

router.route('/signup')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.post(cors.corsWithOptions,function(req,res,next){
  // check if username already exist
  // console.log(req.headers.authorization);
  if(req.user){
    // req.flash("You are already Signed in");
    res.redirect("/");
    return;
  }
  User.register(new User({
    username: req.body.username,
    name: req.body.name,
    gender: req.body.gender
  }),
    req.body.password, (err,user)=>{
      console.log(req.body)
    if(err)
    {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else{
      // if the user is successfully registered
      // set the firstname and the lastname
      // if(req.body.firstname)
      //   user.name = req.body.name;
      // if(req.body.lastname)
      //   user.gender = req.body.gender;
      user.save((err,user)=>{
        // if there is an erro
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});  
          return;        
        }
        // authenticate the same user to check if 
        // sighup was successful and this is the sytanx
        passport.authenticate('local')(req, res, ()=>{
          res.statusCode=200;
          res.setHeader('Content-Type','application/json');
          res.json({success: true,status: "registration succeeded"});
        });
      });  
    }
  });
});

// when a login req comse the passport.authenticate
// will automatically send back a failure message
// and (req,res,next) will be executed after successful login
// create JWT token as well
router.route('/login')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.post(cors.corsWithOptions,(req,res,next)=>{
  if(req.user){
    // req.flash("You are already Signed in");
    res.redirect("/");
    return;
  }
  // err: Genuine error
  // info: If user doesnot exist or wrong pass then extra info
  // that makes more sense than "unauthorized"
  // and yes this is the syntax
  passport.authenticate('local',(err,user,info)=>{
    if(err)
      return next(err);
    
    // info will carry more info
    if(!user){
      res.statusCode=401;
      res.setHeader('Content-Type','application/json');
      res.json({
        success: false,
        status: "Login Unsuccessful",
        // send the JWT token
        err: info
      });
    }
    // in case of successful user password combination
    req.login(user,(err)=>{
      if(err){
        res.statusCode=401;
        res.setHeader('Content-Type','application/json');
        res.json({
          success: false,
          status: "Login Unsuccessful",
          // send the JWT token
          err: "Couldnot Login User!"
        });
      }

       // create JWT token after succefull authentication
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      res.json({
        success: true,
        status: "Login Successful!",
        // send the JWT token
        token: token
      });
    });
  })(req,res,next);
});

router.route('/:username')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) =>{
  // console.log(req.user._id+"\n"+req.params.userId);
  User.findOne({"_id":req.user._id})
  .then((user)=>{
    if(user.username==req.params.username)
    {
      User.findOne({"_id":req.user._id})
      .then((user)=>{
        console.log(user);
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json({
          verified:user.verified,
          recorded:user.recored
        });    
      },(err)=>next(err))
      .catch((err)=>next(err));
    }
    else{
      res.statusCode=403;
      res.setHeader('Content-type','application/json');
      res.json({
        success:false,
        message:"Unauthorized Action"
      }); 
    }
  })
  })

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) =>{
  User.findOne({"_id":req.user._id})
  .then((user)=>{
    if(user.username==req.params.username)
    {
      if(req.body.recorded){
        User.findByIdAndUpdate({"_id":req.user._id},{
          $inc :{
            recored:1
          }
        },{new:true})
        .then((user)=>{
          console.log(user);
          res.statusCode=200;
          res.setHeader('Content-type','application/json');
          res.json({
            success:true,
            message:"Recod count incremented"
          });    
        },(err)=>next(err))
        .catch((err)=>next(err));
      }
      else{
        User.findByIdAndUpdate({"_id":req.user._id},{
          $inc :{
            verified:1
          }
        },{new:true})
        .then((user)=>{
          console.log(user);
          res.statusCode=200;
          res.setHeader('Content-type','application/json');
          res.json({
            success:true,
            message:"Verify count incremented"
          });    
        },(err)=>next(err))
        .catch((err)=>next(err));
      }
    }
    else{
      res.statusCode=403;
      res.setHeader('Content-type','application/json');
      res.json({
        success:false,
        message:"Unauthorized Action"
      }); 
    }
  })
})

module.exports = router;
