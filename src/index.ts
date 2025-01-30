import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import express from 'express';
import mongoose from 'mongoose';
import { userRouter } from './Routes/user';
import cors from 'cors'

const app = express();
app.use(express.json())
app.use(cors())
app.use('/api/v1',userRouter)

async function main(){
    await mongoose.connect(process.env.MONGO_URL as string)
    app.listen(process.env.PORT,()=>{
        console.log("Server running on port 3000");
    })
}

main()
