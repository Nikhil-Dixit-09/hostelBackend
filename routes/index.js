const express=require('express');
const router=express.Router();
const homeController=require('../controllers/home_controller.js');
router.use('/user',require('./user'));
router.get('/',(req,res)=>{
    return res.send('<h1>Server Running</h1>');
});
module.exports=router;

