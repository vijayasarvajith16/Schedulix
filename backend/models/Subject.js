const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, unique: true, trim: true },
    hoursPerWeek: { type: Number, required: true, min: 1, max: 8 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    department: { type: String, default: 'General' },
    category: { type: String, enum: ['LIT', 'Theory (T)', 'Lab (L)'], default: 'Theory (T)', required: true },
    theoryHours: { type: Number, default: 0 },
    labHours: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
