import { NextFunction, Request, Response } from "express";
import { userRouter } from "../Routes/user";
import jwt, { JwtPayload } from 'jsonwebtoken'

interface extendedRequest extends Request{
    objectId?:string
}

export function userMiddleware(req:extendedRequest,res:Response,next:NextFunction){
    const jwtToken=req.headers.authorization
    if(jwtToken){
    try{
    const isValid=jwt.verify(jwtToken,process.env.JWT_SECRET as string) as JwtPayload
    console.log(isValid);
    
    if(isValid){
        req.objectId=isValid.objectId
        next()
    }
    }
    catch(error){
        res.json({
            "Message":"JWT Token not verified"
        })
    }
    }
}