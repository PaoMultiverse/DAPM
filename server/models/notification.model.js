 const mongoose = require("mongoose");
 const noficationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    content:String,
    type:{
        type:String,
        enum:["BILL","SYSTEM","UPDATE"],
        default:"SYSTEM",
    },
    billId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Bill",
    },
    isRead:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
 });

 module.exports = mongoose.model("Notification",noficationSchema);