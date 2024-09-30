const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');

//Article Schema
let userSchema = mongoose.Schema({
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
    DOB: {
        type: Date,
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
    PhoneNumber:{
        type: Number,
        required:false,
        default: 0
    },
    kPoints:{
        type: Number,
        required:false,
        default: 0
    },
    LoginType:{
        type: String,
        required:true,
        default: "Member"
    },
    Nationality:{
        type: String,
        required:true
    },
    Gender:{
        type: String,
        required:true
    },
    Password:{
        type: String,
        require:true
    },
    Address:{
        type: String,
        required:true
    },
    createdDate:{
        type: Date,
        required:true,
        default:Date.now
    }
});

let Article = module.exports = mongoose.model('User', userSchema, 'users');
