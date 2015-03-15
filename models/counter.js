var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CounterSchema = new Schema({
    _id: { type: String, required: true, index: { unique: true } },
    seq: { type: Number, required: true }
});

module.exports = mongoose.model('Counter', CounterSchema);