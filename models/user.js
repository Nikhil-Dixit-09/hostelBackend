const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
    name: {type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    rollNumber:{type:String, required:true},
    isStudent:{type:Boolean,required:true},
    isVerified:{type:Boolean,default:false},
    forgotPassword:{type:String,default:"#"}
});
const User=mongoose.model('User',userSchema);
module.exports=User;