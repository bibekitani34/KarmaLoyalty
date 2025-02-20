const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

//Journal Schema
let journalSchema = mongoose.Schema({
    Author: {
        type: String,
        required: true
    },
    Title:{
        type: String,
        required: true
    },
    JournalBody:{
        type: String,
        required:true
    },
    Image:{
        filename: String,
        contentType: String,
        image: Buffer
    },
    createdDate:{
        type: Date,
        required:true,
        default:Date.now
    }
});

let Journal = module.exports = mongoose.model('Journal', journalSchema, 'journals');
