import connectDB from "./db/db.js";
import dotenv from "dotenv";
import {app} from "./app.js";

dotenv.config({
    path : "./env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch(err => {
    console.error("Error Connecting to MongoDB:", err);
    process.exit(1);
})
// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DATABASE_NAME}`);
//         app.on("error",(err)=>{
//             console.error("Error in app:", err);
//             throw err;
//         });

//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     }catch(err){
//         console.error("Error connecting to MongoDB:", err);
//     }
// })()