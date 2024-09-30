const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');

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
    CheckIn: {
        type: Date,
        required: true
    },
    CheckOut: {
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
    }
});

let Article = module.exports = mongoose.model('Article', articleSchema, 'articles');
