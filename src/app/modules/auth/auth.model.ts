import { model, Schema } from "mongoose";
import { IAuthUser, Role } from "./auth.interface";

const AuthSchema=new Schema<IAuthUser>({
    name:{type:String,required:true},
    email:{type:String,required:true, unique:true} ,
    password:{type:String, require:true},
    role:{type:String,enum:Object.values(Role),default:Role.USER},
    isApproved:{type:Boolean,default:false}
}) 


export const AuthModel = model<IAuthUser>("User", AuthSchema)