const User = require("../models/user");
const jwt = require("jsonwebtoken");
const _ = require('lodash');
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox7e27e9a9e5ab47d0a8dde9dd310588b1.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

exports.signup = (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACC_ACTIVATE,
      { expiresIn: "20m" }
    );

    const data = {
      from: "noreply@hello.com",
      to: email,
      subject: "Account Activation Link",
      html: `
            <h1>Please click on given link to activate you account</h1>
            <a href="${process.env.CLIENT_URL}/authentication/activate/${token}">${process.env.CLIENT_URL}/authentication/activate/${token}</a>`,
    };
    mg.messages().send(data, function (error, body) {
      if (error) {
        return res.json({
          message: error.message,
        });
      }
      return res.json({
        message: "Email has been sent kindly activate your account",
      });
      console.log(body);
    });
  });
};

exports.activateAccount = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(token, process.env.JWT_ACC_ACTIVATE, (err, decodeToken) => {
      if (err) {
        return res.status(400).json({ error: "Incorrect or Expired link" });
      }
      const { name, email, password } = decodeToken;
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          return res
            .status(400)
            .json({ error: "user with this email already exist" });
        }
        let newUser = new User({ name, email, password });
        newUser.save((err, success) => {
          if (err) {
            return res.status(400).json({ error: 'Error activating account' });
          }
          res.json({
            message: "Signup success",
          });
        });
      });
    });
  } else {
    return res.json({ error: "Something went wrong!!" });
  }
};

exports.forgotPassword = (req,res) =>{
    const{email} = req.body;

    User.findOne({email},(err,user) =>{
        if(err || !user){
            return res.status(400).json({error:"User with this email does not exist"})
        }
        const token = jwt.sign({_id:user._id},process.env.RESET_PASSWORD_KEY,{expiresIn:'20m'});
        const data = {
            from:'noreply@hello.com',
            to:email,
            subject:'Reset password',
            html:`
                <h2>Please click on given link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>`
        }
        return user.updateOne({resetLink:token},(err,success) =>{
            if(err){
                return res.status(400).json({error:'reset password link error'})
            }else{
                mg.messages().send(data,(error,body) =>{
                    if(error){
                        return res.json({
                            error:error.message
                        })
                    }
                    return res.json({message:'Email has been sent, Kindly follow the instructions'})
                })
            }

        })
    })
}

exports.resetPassword = (req,res) =>{
    const {resetLink,newPass} = req.body;

    if(resetLink){

        jwt.verify(resetLink,process.env.RESET_PASSWORD_KEY,(err,decodedData) =>{
            if(err){
                return res.status(401).json({
                    error:'Incorrect token or it is expired'
                })
            }
            User.findOne({resetLink},(err,user) =>{
                if(err || !user){
                    return res.status(401).json({error:'User with this token does not exist'})
                }
                const obj = {
                    password:newPass,
                    resetLink:''

                }
                user = _.extend(user,obj)

                user.save((err,result) =>{
                    if(err){
                        return res.status(400).json({error:"Reset password error"})
                    }else{
                        return res.status(200).json({message:'Your password has been changed'})
                    }
                })
            })
        });

    }else{
        return res.status(401).json({error:"Authentication error"})
    }
}
exports.signin = (req,res) =>{

    const {email,password} = req.body;

    User.findOne({email}).exec((err,user) =>{
        if(err || !user){
            return res.status(400).json({
                message:'This user does not exist signup first'
            })
        }

        if(user.password !== password){
            return res.status(400).json({
                error:'Email or password incorrect'
            })
        }

        const token = jwt.sign({_id:user._id},process.env.JWT_SIGNIN_KEY,{expiresIn:'7d'})
        const {_id,name,email} = user
        res.json({
            token,
            user:{_id,name,email}
        })

    })
}



//Create user without email account activation
// exports.signup = (req, res) => {
//   console.log(req.body);
//   const { name, email, password } = req.body;
//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res
//         .status(400)
//         .json({ error: "User with this email already exists" });
//     }
//     let newUser = new User({ name, email, password });
//     newUser.save((err, success) => {
//       if (err) {
//         console.log("Error in signup:", err);
//         return res.status(400).json({ error: err });
//       }
//       res.json({
//         message: "Signup success",
//       });
//     });
//   });
// };
