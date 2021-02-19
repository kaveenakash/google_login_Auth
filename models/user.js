const mongoose = require('mongoose')
const crypto = require('crypto')

//user schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        max:64
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    resetLink:{
        data:String,
        default:``
    }
    
},{timestamps:true})

module.exports = mongoose.model('User',userSchema);