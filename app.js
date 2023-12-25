const express=require("express")
require('dotenv').config()

const session=require('express-session')
const mongoose = require("mongoose")
const multer=require("multer")
const bodyParser = require('body-parser');
const usrouter=require("./server/routes/user_route")
const adrouter=require("./server/routes/admin_route")
const path=require("path")
const ejs=require("ejs")

const nocache=require("nocache")
const flash=require("express-flash")


const port=process.env.PORT

const MONGO_URL=process.env.MONGO_URL



mongoose
.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
  console.log("connect aayi mwone");
})
.catch((err)=>{
  console.log(err);
})


const app=express()
app.use(nocache())
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));


app.use(bodyParser.json()); 
app.use(express.urlencoded({extended:true}))
app.use(flash());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/usersassets'));
app.use(express.static(__dirname + '/public/adminassets'));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs")




app.use("/",usrouter)

app.use("/admin",adrouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

app.use('/uploads',express.static('uploads'))
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})



const upload =multer({storage:storage})