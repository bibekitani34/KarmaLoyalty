const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');

//Article Schema
let subscribeSchema = mongoose.Schema({

    EmailAddress:{
        type: String,
        required: true
    }
});

let SubscribedUsers = module.exports = mongoose.model('Subscribed', subscribeSchema, 'subscribers');
