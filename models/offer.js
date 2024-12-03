const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    amount: { type: Number, required: [true, 'Minimum offer $0.01 required'], min: [0.01, 'Offer must be atleast $0.01']},
    status: { type: String, enum: ['pending', 'rejected', 'accepted'],
    default: 'pending'
    }
});

module.exports = mongoose.model('Offer', offerSchema);