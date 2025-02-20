const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');

//Article Schema
let propertySchema = mongoose.Schema({
    HotelName: {
        type: String,
        required: true
    },
    Ratings: {
        type: Number,
        required: true,
        default: 10.0
    },
    EmailAddress:{
        type: String,
        required: true
    },
    propertyImage:{
        type: Image,
        required:false
    },
    PhoneNumber:{
        type: Number,
        required:false,
        default: 0
    },
    description:{
        type: String,
        required:true
    },
    hotelId:{
        type: Number,
        required:true,
        default: 0
    },
    Nationality:{
        type: String,
        required:true
    },
    Manager:{
        type: String,
        required:true
    },
    Address:{
        type: String,
        required:true
    },
    createdDate:{
        type: Date,
        required:true,
        default:Date.now
    },
    amenities:{
        type: Array,
        required:true,
        default:["Parking", "Air Conditioning","Pet Friendly", "Free Wifi", "Bathtub", "Kitchen", "Room Service", "Fitness Center", "Non-smoking rooms"]
    }

});

let Property = module.exports = mongoose.model('Property', propertySchema, 'properties');
