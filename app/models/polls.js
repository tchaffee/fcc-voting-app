'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    answers: [{ term: String, votes: Number }],
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    voters_ip: [String]
});

module.exports = mongoose.model('Poll', Poll);
