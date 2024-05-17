const mongoose = require('mongoose');

// schema for single user
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required:true
    },
    tasks:[{
        taskname:{
            type:String
        },
        taskstatus:{
            type:Boolean,
            default:false
        }
    }]
},{timestamps:true})

const User = mongoose.model('user',userSchema);
module.exports=User;