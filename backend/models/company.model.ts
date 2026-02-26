import mongoose from "mongoose";
const companySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    discription:{
        type:String,
    },
    location:{
        type:String,
    },
    website:{
        type:String,
    },
    logo:{
        type:String,    
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    }
},{timestamps:true})

export default mongoose.model('Company',companySchema)