const bodyParser = require('body-parser');
var PasswordReset = require('../model/passwordReset');
var express = require('express');
const url = require('url'); 
// calling cors
const cors = require("./cors");

const resetRouter = express.Router();
resetRouter.use(bodyParser.json());

resetRouter.route('/:token')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,(req, res, next) =>{
    res.redirect(url.format({
        pathname:'http://localhost:3001/resetPassword',
        query:{
            "token":req.params.token
        }
    }));
    // PasswordReset.findOne({
    //     token:req.params.token
    // })
    // .then((resp)=>{
    //     if(resp){
    //         if(resp.expiry<Date.now()){
    //             res.redirect('http://localhost:3001/tokenExpired');
    //         }
    //         else{
    //             res.redirect('http://localhost:3001/resetPassword')
    //         }
    //     }
    //     else{

    //     }
    // })
})


module.exports = resetRouter;