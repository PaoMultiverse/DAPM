const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',  
        required: true
      },
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Room',
        required:true
    },
    tenantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    landlordId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending','accepted','rejected'],
        default:'pending'
    },
    message:{String},
    rejectReason:String
},{
    timestamps:true
}); 

module.exports = mongoose.model('RentalRequest',rentalRequestSchema);