const mongoose=require("mongoose");

const mongoDB=async()=>{
    try {
        const con=mongoose.connect("mongodb://127.0.0.1:27017/icrop");
        console.log("mongodb successfully connected");
    } catch (error) {
        console.log("db error",error);
    }
}
module.exports={mongoDB};
