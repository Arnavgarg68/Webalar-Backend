const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const jwtKey = process.env.JWTKEY
const User = require('../Models/user')
const Team = require('../Models/team')
// for login
router.post('/userLogin',async(req,res)=>{
    const {email,password} = req.body;
    if(!(email&&password)){
        res.status(200).json({error:"email or password not found"});
        return
    }
    const user = await User.find({email:email,password:password});
    if(user.length==0){
        res.status(200).json({error:"email or password is incorrect"});
        return
    }
    jwt.sign({email,password},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
            res.status(400).json({error:"server error try after sometime"});
            return
        }
        res.status(200).json({user:user,auth:token});
    })
})

// for signup
router.post('/userSignup',async(req,res)=>{
    const {name,email,password} = req.body;
    if(!(email&&password&&name)){
        res.status(401).json({error:"invalid format form filled"});
        return
    }
    try{
        const newuser =await User.create({email:email,password:password,name:name});
        jwt.sign({newuser},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
                res.status(400).json({error:"server error try after sometime"});
                return
            }
            res.status(200).json({user:newuser,auth:token});
        })
    }
    catch(error){
        res.status(400).json(error.errmsg);
        console.log(error);
        return
    }
    
    
})

// new task update
router.post("/newtask/:id",jwtVerify,async(req,res)=>{
    const {id} = req.params;
    const {taskname,taskstatus}=req.body
    try{
        const updateUser = await User.findById(id)
            if(!updateUser){
                res.status(200).json({error:"user not found try login again"});
                return;
            }
            const newtask = {taskname,taskstatus};
            updateUser.tasks.push(newtask);
            await updateUser.save();
            res.status(200).json(updateUser);    }
    catch(error){
        console.log(error);
        res.status(400).json({ error: "Internal Server Error" });
    }
});

// task status update
router.patch("/status/:id/:taskId",jwtVerify,async(req,res)=>{
    const {id,taskId} = req.params;
    const {newtaskstatus} = req.body;
    if(!(newtaskstatus==true||newtaskstatus==false)){
        res.status(200).json({error:"new task status is invalid"})
        return;
    }
    try{
    const user= await User.findOne({_id:id});
    if(user){
        const taskindex= user.tasks.findIndex(t=>t._id.equals(taskId));
        user.tasks[taskindex].taskstatus = newtaskstatus;
        const newtasks = user.tasks;
        const newprofile = {...user,tasks:newtasks}
        console.log(newprofile)
        const newuser = await User.findByIdAndUpdate(id,newprofile,{new:true})
        res.status(200).json(newuser);
    }else{
        console.log("unable to find user try login again");
        res.status(200).json({error:"unable to find user try login again"})

    }}
    catch(error){
        console.log(error);
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})

//delete task
router.delete("/delete/:id/:taskId",jwtVerify,async(req,res)=>{
    const {id,taskId} = req.params;
    try{
    const user= await User.findOne({_id:id});
    if(user){
        const name = user.name;
        const email = user.email;
        const password = user.password;
        const newtasks= user.tasks.filter(t=>!t._id.equals(taskId));
        const newprofile = {name:name,email:email,password:password,tasks:newtasks}
        console.log(newprofile)
        const newuser = await User.findByIdAndUpdate(id,newprofile,{new:true})
        res.status(200).json(newuser);
        return
    }else{
        res.status(200).json({error:"user is not found try logging again"});
        return
    }}
    catch(error){
        console.log(error)
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})
// create team room
router.post('/create-team',async(req,res)=>{
    const {groupId} = req.body;
    if(!groupId){
        res.status(200).json({error:"empty group Id try again"})
        return;
    }
    try {
        const team = await Team.create({groupId});
        res.status(200).json(team);
        return;
    } catch (error) {
        if(error.errmsg.split(' ')[0]=='E11000'){

            res.status(400).json({error:"Kindly choose another Group Id"})
            return
        }
        res.status(400).json({error:error.errmsg})
    }
})
// get room data
router.get('/team/:groupId',async(req,res)=>{
    const {groupId} = req.params;
    try {
        if(!groupId){
            res.status(200).json({error:"Invalid Room number"})
            return;
        }
        const team = await Team.find({groupId});
        if(!team){
            res.status(200).json({error:`Room not found with groupId:${groupId}`});
            return;
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({error:error.errmsg})
    }
    
})

// create task
router.post("/team/newtask/:id",async(req,res)=>{
    const {id} = req.params;
    const {taskname,taskstatus}=req.body
    try{
        const updateTeam = await Team.findById(id)
            if(!updateTeam){
                res.status(200).json({error:"room not found try joining again"});
                return;
            }
            const newtask = {taskname,taskstatus};
            updateTeam.tasks.push(newtask);
            await updateTeam.save();
            res.status(200).json(updateTeam);    }
    catch(error){
        console.log(error);
        res.status(400).json({ error: "Internal Server Error" });
    }
});

// delete task

router.delete("/team/delete/:id/:taskId",async(req,res)=>{
    const {id,taskId} = req.params;
    try{
    const team= await Team.findOne({_id:id});
    if(team){
        const groupId = team.groupId;
        const newtasks= team.tasks.filter(t=>!t._id.equals(taskId));
        const newprofile = {groupId:groupId,tasks:newtasks}
        console.log(newprofile)
        const newteam = await Team.findByIdAndUpdate(id,newprofile,{new:true})
        res.status(200).json(newteam);
        return
    }else{
        res.status(200).json({error:"Invalid room Id try again"});
        return
    }}
    catch(error){
        console.log(error)
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})

// change task status


// middle

function jwtVerify(req,res,next){
    const tokenbody = req.headers['authorization'];
    if (!tokenbody) {
        res.status(401).json({error:"Invalid authorization"})
        return
    }
    const token = tokenbody.split(' ')[1];
    jwt.verify(token,jwtKey,(err,valid)=>{
        if(err){
            console.log(err)
            res.status(401).json({error:"Login expired kindly login again first"})
            return
        }
        next();
    })

}


module.exports=router;