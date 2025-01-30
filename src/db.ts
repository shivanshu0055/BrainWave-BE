import mongoose, { Model, Types } from "mongoose";
import { Schema } from "mongoose";

const userSchema=new Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

const memorySchema=new Schema({
    type:{type:String,enum:['Youtube','Twitter','Notion','Website','Note'],required:true},
    title:{type:String,default:"N/A"},
    description:{type:String,default:"N/A"},
    creationTime:{type:String,required:true},
    creationDate:{type:String,required:true},
    embeddings:{type:[Number],required:true},
    creatorId:{type:Types.ObjectId,required:true},
    link:{type:String,default:"N/A"},
    logoUrl:{type:String,default:"N/A"},
    bookmark:{type:Boolean,default:false}
})

export const userModel=mongoose.model('users',userSchema)
export const memoryModel=mongoose.model('memories',memorySchema)



