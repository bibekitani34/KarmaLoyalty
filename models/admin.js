const { ObjectId } = require('mongodb');
let mongoose = require('mongoose');
const { Schema } = mongoose;


const AdminSchema = new Schema({

    EmailAddress: {
      type: String,
      required: true
    },
    Password: {
      type: String,
      required: true
    },
    FirstName: {
        type: String,
        required: true
      },
      LastName: {
        type: String,
        required: true
      }
  });
  
let Admins = module.exports = mongoose.model('Admins', AdminSchema, 'Admins');
