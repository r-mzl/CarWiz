const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    condition: { type: String, enum: ['Like-New', 'Used', 'Worn', 'Salvage', 'Partout'], required: [true, 'Condition is required'] },
    year: { type: Number, required: [true, 'Year is required'] },
    make: { type: String, required: [true, 'Make is required'] },
    modelX: { type: String, required: [true, 'Model is required'] },
    price: { type: Number, required: [true, 'Price is required'] },
    details: { type: String, required: [true, 'Details are required'] },
    image: { type: String }, 
    active: { type: Boolean, default: true } 
}, { timestamps: true }); 

const offerSchema = new Schema({
    amount: { type: Number, required: [true, 'Minimum offer $0.01 required'], min: [0.01, 'Offer must be atleast $0.01']},
    status: { type: String, enum: ['pending', 'rejected', 'accepted'],
    default: 'pending'
    }
});

module.exports = mongoose.model('Item', itemSchema);
module.exports = mongoose.model('Offer', offerSchema);
