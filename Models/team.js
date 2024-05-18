const mongoose = require('mongoose');
const teamSchema =new mongoose.Schema({
    groupId:{
        type: Number,
        required:true,
        unique:true
    },
    tasks:[
        {
            taskname:{
                type:String
            },
            taskstatus:{
                type:Boolean,
                default:false
            }
        }
    ]
},{timestamps:true})

const Team = mongoose.model('company',teamSchema);
module.exports = Team;