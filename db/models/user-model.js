const mongoose=require('mongoose');
const connection=require('../connection');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    username:String,
    googleId:String,
    photo:String,
    transactions:[
        {
            category:String,
            amount:Number,
            date:Date
        }
    ]
})

const User=mongoose.model('user',userSchema);
module.exports=User;