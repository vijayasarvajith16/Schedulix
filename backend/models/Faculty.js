const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
