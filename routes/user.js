const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth')
const userController=require('../controllers/user_controller');
const { use } = require('bcrypt/promises');
var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        console.log(file);
        req.see=file.fieldname+'-'+Date.now();
        cb(null,req.see);
    }
});
 
var upload = multer({ storage: storage });
router.post('/signup',userController.signup);
router.post('/signin',userController.signin);
router.post('/verify',auth,userController.verify);
router.get('/verification/:token',userController.verification);
router.get('/getUser/:email',auth,userController.getuser);
router.post('/sendOtp',userController.sendOtp);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/changePassword',userController.changePassword);
router.post('/addComplaint',auth,upload.single('image'),userController.addComplaint);
router.get('/getComplaints/:email',auth,userController.getComplaints);
router.post('/getComplaintsFilter',auth,userController.getComplaintsFilter);
router.delete('/deleteComplain/:complain',auth,userController.deleteComplain);
router.put('/upgradeStatus',auth,userController.upgradeStatus);
router.put('/editComplaint',auth,upload.single('image'),userController.editComplaint);
module.exports = router;