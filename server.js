const express = require('express');
const app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cors = require("cors");
const router = require('./Routes/route')

dotenv.config();
const env = process.env;
app.use(express());
app.use(express.json());
app.use(cors());



mongoose.connect(process.env.DB).then(()=>{
    app.listen(env.PORT,()=>{
        console.log("http://localhost:"+env.PORT);
    })
}).catch((error)=>{
    console.log(error);
});


app.use(router);