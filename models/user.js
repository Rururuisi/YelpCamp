const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);