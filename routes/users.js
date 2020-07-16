const bodyParser = require('body-parser');
var User = require('../model/user');
var PasswordReset = require('../model/passwordReset');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')
var nodemailer = require('nodemailer');
var crypto = require("crypto");
// calling cors
const cors = require("./cors");


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
    console.log(err);
    if(err)
    {
      console.log("Here 1");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: "Error occured in the err part: "+err});
    }
    else{
      // if the user is successfully registered
      // set the firstname and the lastname
      // if(req.body.firstname)
      //   user.name = req.body.name;
      // if(req.body.lastname)
      //   user.gender = req.body.gender;
      console.log("Herer 2");
      user.save((err,user)=>{
        // if there is an erro
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: "Error occured in the save part: "+err});  
          return;        
        }
        // authenticate the same user to check if 
        // sighup was successful and this is the sytanx
        console.log("Herer 3");
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

// get the #of verifications and recroding for this user
router.route('/username/:username')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) =>{
  // console.log(req.user._id+"\n"+req.params.userId);
  User.findOne({"_id":req.user._id})
  .then((user)=>{
    if(user.username==req.params.username)
    {
      // console.log("User before Update: ",user);
      User.findByIdAndUpdate(req.user._id,{
        $set:{
          lastActive:Date.now()
        }
      },{new: true})
      .then((user)=>{
        // console.log(user);
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
  if(req.body && req.body.recorded!=null && req.body.recorded!=undefined){
    User.findOne({"_id":req.user._id})
    .then((user)=>{
      // check if requesting user same as the username provided
      if(user.username==req.params.username)
      {
        if(req.body.recorded){
          User.findByIdAndUpdate({"_id":req.user._id},{
            $inc :{
              recored:1
            },
            $set:{
              lastActive:Date.now()
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
            },
            $set:{
              lastActive:Date.now()
            }
          },{new:true})
          .then((user)=>{
            // console.log(user);
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
    });
  }
  else{
    res.statusCode=403;
    res.setHeader('Content-type','application/json');
    res.json({
      success:false,
      message:"Unauthorized Action"
    }); 
  }
});

// reset password
router.route('/resetPassword')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.post(cors.corsWithOptions,(req, res, next) =>{
  User.findOne({"username":req.body.email})
  .then((user)=>{
    if(user){
      // create token
      var resetToken = crypto.randomBytes(20).toString('hex');
      // Set the mail to be sent
      var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: 'datastack.ai@outlook.com',
          pass: 'ourfirstbusiness2020'
        }
      });

      var mailOptions = {
        from: 'datastack.ai@outlook.com',
        to: req.body.email,
        subject: 'Reset Password',
        text: 'Please click on the link to reset your password.\nLink will be valid for 1 hour\n\n'+
        'https://'+req.headers.host+'/reset/'+resetToken+
        '\n\n Ignore if you didnot request this mail.'
      };

      PasswordReset.findOne({eamil:req.body.email})
      .then((resp)=>{
        console.log("Check if present in Password Reset: "+resp);
        if(resp){
          PasswordReset.findByIdAndUpdate(resp._id,{
            $set:{
              token:resetToken,
              expiry:Date.now()+3600000
            }
          },{new:true})
          .then((resp)=>{
            console.log("Modified: "+resp);
            // send the mail
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json({
                  "success":false,
                  "message":"Error Occured. Please try again: "+error
              });
              } else {
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json({
                  "success":true,
                  "message":"Check your email for the link to reset password"
                });
              }
            });
          })
        }
        else{
          PasswordReset.create({
            eamil:req.body.email,
            token:resetToken,
            expiry:Date.now()+3600000
          })
          .then((resp)=>{
            console.log("Created: "+resp);
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json({
                  "success":false,
                  "message":"Error Occured. Please try again: "+error
              });
              } else {
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json({
                  "success":true,
                  "message":"Check your email for the link to reset password"
                });
              }
            });
          })
        }
      })
    }
    else{
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json({
        "success":false,
        "message":"Email Id not found"
      });  
    }  
  },(err)=>next(err))
  .catch((err)=>next(err));
})
.put(cors.corsWithOptions,(req, res, next) =>{
  PasswordReset.findOne({"eamil":req.body.email})
  .then((user)=>{
    if(user){
      // console.log(user.expiry.getTime()+'\n'+Date.now()+'\n');
      // console.log(user.expiry);
      if(user.token==req.body.token && user.expiry.getTime()>Date.now()){
        User.findOne({
          "username":user.eamil
        })
        .then((user)=>{
          // console.log(user);
          if(user){
            user.setPassword(req.body.password,(err,success)=>{
              if(err){
                console.log(err);
                res.statusCode=500;
                res.setHeader('Content-type','application/json');
                res.json({
                  "success":false,
                  "message":"Error: Setting Password"
                });
              }
              else{
                user.save()
                .then((user)=>{
                  // console.log("Inside Save \n"+user);
                  PasswordReset.findOneAndDelete({
                    eamil:user.username
                  })
                  .then((resp)=>{
                    console.log(resp);
                    res.statusCode=200;
                    res.setHeader('Content-type','application/json');
                    res.json({
                      "success":true,
                      "message":"Password Successfully Changed"
                    });
                  })
                  .catch((err)=>next(err));
                })
              }
            });
          }
          else{
            console.log(err);
            res.statusCode=404;
            res.setHeader('Content-type','application/json');
            res.json({
              "success":false,
              "message":"User Not Found"
            });
          }
        })
        .catch((err)=>next(err))
      }
      else{
        res.statusCode=403;
        res.setHeader('Content-type','application/json');
        res.json({
          "success":false,
          "message":"Token Expired"
        });
      }
    }
    else{
      res.statusCode=404;
      res.setHeader('Content-type','application/json');
      res.json({
        "success":false,
        "message":"Email not found"
      });  
    }  
  },(err)=>next(err))
  .catch((err)=>next(err));
})

module.exports = router;
