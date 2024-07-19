const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const port = 8000;
const dotenv=require('dotenv');
dotenv.config();
const router = require('./routes/index.js');
const app = express();
const http = require('http').Server(app);
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "https://hostel-client-rouge.vercel.app"
    }
});

let users = [];
let rooms=[];
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('message', (data) => {
     
      socketIO.emit('messageResponse', data);
    });
    socket.on('newUser', (data) => {
      data.socketID=socket.id;
      let see=users.filter((user)=>user.socketID===socket.id);
      if(see.length===0){
        users.push(data);
      }
      
      console.log(data);
      console.log(users);
      socketIO.emit('newUserResponse', users);
    });
   
    socket.on('leaving',()=>{
      users = users.filter((user) => user.socketID !== socket.id);
      socketIO.emit('newUserResponse', users);
    });
    
    socket.on('disconnect', () => {
      users = users.filter((user) => user.socketID !== socket.id);
      socketIO.emit('newUserResponse', users);
      console.log('🔥: A user disconnected');
    });
});
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
const corsOptions ={
  origin:'https://hostel-client-rouge.vercel.app', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use('/', router);
const db = require('./config/mongoose');
console.log('hi');
http.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });

