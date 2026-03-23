const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    year: { type: Number, required: true, min: 1, max: 4 },
    section: { type: String, required: true, enum: ['N', 'P', 'Q'] },
    name: { type: String, required: true, unique: true }, 
    semester: { type: Number, required: true },           
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
