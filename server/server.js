import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './route/userRoute.js';
import sellerRouter from './route/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './route/productRouter.js';
import cartRouter from './route/cartRoute.js';
import addressRouter from './route/addressRouter.js';
import orderRouter from './route/orderRouter.js';


const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

//allowed multiple origins
const allowedOrigins = ['http://localhost:5173']

//Middlewares config
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins , credentials : true}));

app.get('/' , (req,res)=> res.send("API is working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product' , productRouter )
app.use('/api/cart' , cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)


app.listen(port , ()=>{
    console.log(`server is running on http://localhost:${port}`)
})