const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');
const { Schema } = mongoose;


const BookingSchema = new Schema({
    // bookingId: {
    //   type: Schema.Types.ObjectId, // Reference to unique booking ID
    //   required: true
    // },
    CheckIn: {
      type: Date,
      required: true
    },
    CheckOut: {
      type: Date,
      required: true
    },
    Cost: {
      type: Number,
      required: true,
      default: 0
    },
    PhoneNumber:{
      type:Number,
      required:true,
      default: 0
    },
    NOG: {
      type: Number,
      required: true,
      default: 0
    },
    RoomType: {
      type: String,
      required: false
    }

  });
  

//Article Schema
let articleSchema = mongoose.Schema({
    // _id:{
    //     type: ObjectId,
    //     required:true
    // },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    EmailAddress:{
        type: String,
        required: true
    },
    isMember:{
        type: String,
        required:false,
        default: "Yes"
    },
    kPoints:{
        type: Number,
        required:false,
        default: 0
    },
    Cost:{
        type: Number,
        required:true,
        default: 0
    },
    LoginType:{
        type: String,
        required:true,
        default: "Guest"
    },
    optIn:{
      type: String,
      required:true,
      default: "No"
  },
    bookings: [BookingSchema],
}, { timestamps: true }); 

let Article = module.exports = mongoose.model('Article', articleSchema, 'articles');
