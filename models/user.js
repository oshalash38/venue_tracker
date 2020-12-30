const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    followings: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    at: [{ type: mongoose.Types.ObjectId, ref: 'Venue' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);