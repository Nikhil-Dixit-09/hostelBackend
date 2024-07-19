const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Complaints = require('../models/complain');
const nodemailer = require('nodemailer');
const { use } = require('bcrypt/promises');
const fs = require('fs');
const path = require('path');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "nikhil09.dixit@gmail.com",
        pass: "hsohtbpxkudzweef"
    }
});
var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage });
module.exports.signin = async function (req, res) {
    // console.log(req.body);
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (!existingUser) {
            return res.status(200).json({ message: "User does not exist" });
        }
        const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(200).json({ message: "Invalid Credentials" });
        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id, isStudent: existingUser.isStudent }, 'hostel', { expiresIn: "8d" });
        return res.status(200).json({ result: existingUser, token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}
module.exports.signup = async function (req, res) {
    console.log(req.body);
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        console.log(existingUser);
        if (existingUser) return res.status(200).json({ message: "User already exists" });
        let str = req.body.email;
        console.log(str);
        str = str.slice(-12);
        console.log('hiii');
        if (str != '@iiitm.ac.in') {
            return res.status(200).json({ message: "Enter institute email ID" });
        }
        console.log('hiiiiiiiii');
        if (req.body.password != req.body.confirmPassword) {
            return res.status(200).json({ message: "Passwords don't match" });
        }
        console.log('byyyyyyyyyyyyy');
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const result = await User.create({ email: req.body.email, password: hashedPassword, name: req.body.name, rollNumber: req.body.rollNumber, isStudent: req.body.isStudent });


        const token = jwt.sign({ email: result.email, id: result._id, isStudent: result.isStudent }, 'hostel', { expiresIn: "8d" });
        // console.log(result);
        return res.status(200).json({ result, token });
    } catch (err) {
        console.log(err);
    }
}
module.exports.verify = async function (req, res) {
    try {
        const token = jwt.sign({ email: req.email, id: req.userId }, 'verify', { expiresIn: "10m" });

        const mailConfigurations = {


            from: 'nikhil09.dixit@gmail.com',

            to: req.email,


            subject: 'Email Verification',


            text: `Hi! There, You have recently visited 
           our website and entered your email.
           Please follow the given link to verify your email
           http://localhost:8000/user/verification/${token} 
           Thanks`

        };
        transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) throw Error(error);
            console.log('Email Sent Successfully');
            console.log(info);
        });
        return res.status(200).json({ message: "verification email sent successfully" });
    } catch (err) {
        console.log(err);
    }
}
module.exports.verification = async function (req, res) {
    try {
        console.log(req.params);
        let decodedData;
        decodedData = jwt.verify(req.params.token, 'verify');
        const user = await User.findOne({ email: decodedData.email });
        user.isVerified = true;
        user.save();
        return res.status(200).json({ message: "Verification successfull" });
    } catch (err) {
        return res.status(200).json({ message: `${err.message}` });
    }
}
module.exports.getuser = async function (req, res) {
    try {
        console.log(req.params);
        const user = await User.findOne({ email: req.params.email });
        return res.status(200).json({ data: user });
    } catch (err) {
        console.log(err);
    }
}
module.exports.sendOtp = async function (req, res) {
    try {
        console.log(req.body);
        const user = await User.findOne({ email: req.body.email });
        if (user === null) {
            return res.status(200).json({ message: "user don't exist" });
        }
        var min = 10000;
        var max = 99999;
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(num);
        const mailConfigurations = {
            from: 'nikhil09.dixit@gmail.com',
            to: req.body.email,
            subject: 'Forgor password OTP',
            text: `Your OTP is ${num}`
        };
        transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) throw Error(error);
            console.log('Email Sent Successfully');
            console.log(info);
        });
        let str = toString(num);
        const hashedPassword = await bcrypt.hash(str, 12);
        user.forgotPassword = hashedPassword;
        user.save();
        return res.status(200).json({ message: 'otp sent successfully' });
    } catch (err) {
        console.log(err);
    }
}
module.exports.verifyOtp = async function (req, res) {
    try {
        console.log(req.body);
        const user = await User.findOne({ email: req.body.email });
        let otp = parseInt(req.body.otp);
        let str = toString(otp);
        const isPasswordCorrect = await bcrypt.compare(str, user.forgotPassword);
        if (isPasswordCorrect) {
            user.forgotPassword = "#";
            user.save();
            return res.status(200).json({ message: "correct otp" });
        } else {
            return res.status(200).json({ message: "invalid otp" });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.changePassword = async function (req, res) {
    try {
        console.log(req.body);
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(200).json({ message: "passwords don't match" });
        }
        const user = await User.findOne({ email: req.body.email });
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        user.password = hashedPassword;
        user.save();
        return res.status(200).json({ message: "password changed successfully" });
    } catch (err) {
        console.log(err);
    }
}
module.exports.addComplaint = async function (req, res) {
    try {
        console.log('heyyyyyy');
        console.log(req.body,'hiiiiiiiiiiiiiiiiiiiiiii');
        console.log(__dirname);
        
        // let imag = {
        //     data: fs.readFileSync(path.join(__dirname, '../' + '/uploads/' + req.see)),
        //     contentType: 'image/png'
        // }
        // let save = imag.data.toString('base64');
        // fs.unlinkSync(path.join(__dirname, '../' + '/uploads/' + req.see));
        // console.log('hiii', 'aaaa');
        // console.log(req.userId);
        await Complaints.create({ description: req.body.description, hostel: req.body.hostel, roomNumber: req.body.roomNumber, genre: req.body.genre,  person: req.userId,img:req.body.image });
        return res.status(200).json({ message: "success" });
    } catch (err) {
        console.log(err);
        return res.status(200).json({data:err.message});
    }
}
module.exports.getComplaints = async function (req, res) {
    try {
        if (req.isStudent === true) {
            console.log('hiiiiiiiiiiiiiiiiii')
            const all=await Complaints.find();
            console.log(all);
            console.log(req.userId);
            const data = await Complaints.find({ person: req.userId });
            console.log('hii');
            console.log(data);
            return res.status(200).json({ data: data });
        } else {
            const data = await Complaints.find();
            console.log('hiibye');
            return res.status(200).json({ data: data });
        }


    } catch (err) {
        console.log(err);
    }
}
module.exports.getComplaintsFilter = async function (req, res) {
    try {
        let see;
        if (req.isStudent === true) {
            const complaints = await Complaints.find({ person: req.userId });
            see = complaints;
            console.log('asdfggghh');
        } else {
            const data = await Complaints.find();
            see = data;
            console.log('gggggggg');
        }
        console.log(req.body);
        let data = [];
        const tags = new Map();
        for (const key in req.body) {
            if (req.body[`${key}`] === true) {
                console.log(key);
                tags.set(key, 1);
            }
        }
        console.log(tags);

        let arr = ["NA", "pending", "inProgress", "resolved"]
        for (let i = 0; i < see.length; i++) {
            let myMap = new Map();
            myMap.set("all", 1);
            let genre = see[i].genre;
            genre = genre.toLowerCase();
            myMap.set(genre, 1);
            let status = arr[see[i].status];
            myMap.set(status, 1);
            let hos;
            if (see[i].hostel === 'BH-1') {
                hos = "bh1";
            } else if (see[i].hostel === 'BH-2') {
                hos = "bh2";
            } else if (see[i].hostel === 'BH-3') {
                hos = "bh3";
            } else {
                hos = "gh1";
            }
            let floor;
            if (see[i].roomNumber.length === 2) {
                floor = "gf";
            } else if (see[i].roomNumber[0] === '1') {
                floor = "ff";
            } else if (see[i].roomNumber[0] === '2') {
                floor = "sf";
            } else if (see[i].roomNumber[0] === '3') {
                floor = 'tf';
            }
            myMap.set(floor, 1);
            myMap.set(hos, 1);
            let add = 1;
            if(tags.size===0){
                add=-1;
            }
            for (const [key, value] of tags.entries()) {
                if (myMap.has(key)) {

                } else {
                    add = -1
                    break;
                }
            }
            if (add === 1) {
                data.push(see[i]);
            }
        }
        return res.status(200).json({ payload: data });
    } catch (err) {
        console.log(err);
    }
}
module.exports.deleteComplain = async function (req, res) {
    try {
        console.log(req.params.complain);
        const deleted = await Complaints.findOne({ _id: req.params.complain });
        const complain = await Complaints.deleteOne({ _id: req.params.complain });
        console.log(complain);
        return res.status(200).json({ data: deleted });
    } catch (err) {
        console.log(err);
    }
}
module.exports.upgradeStatus = async function (req, res) {
    try {
        const complaint = await Complaints.findById(req.body.complain);
        if (complaint.status === 1) {
            complaint.status = 2;
        } else if (complaint.status == 2) {
            complaint.status = 3;
        }
        console.log(complaint);
        complaint.save();
        return res.status(200).json({ data: complaint });
    } catch (err) {
        console.log(err);
    }
}
module.exports.editComplaint=async function(req,res){
    try{
        const complaint=await Complaints.findById(req.body.id);
        complaint.hostel=req.body.hostel;
        complaint.description=req.body.description;
        complaint.roomNumber=req.body.roomNumber;
        complaint.genre=req.body.genre;
        complaint.img=req.body.img;
        // if(req.see!==undefined){
        //     let imag = {
        //         data: fs.readFileSync(path.join(__dirname, '../' + '/uploads/' + req.see)),
        //         contentType: 'image/png'
        //     }
        //     let sav = imag.data.toString('base64');
            
        //     fs.unlinkSync(path.join(__dirname, '../' + '/uploads/' + req.see));
        //     complaint.img=sav;
        // }
        complaint.save();
        return res.status(200).json({data:complaint});
    }catch(err){
        console.log(err);
    }
}