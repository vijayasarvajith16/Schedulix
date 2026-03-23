const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    period: { type: Number, required: true, min: 1, max: 8 },
    type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
}, { timestamps: true });

// Prevent double booking: same batch, same day, same period
timetableSchema.index({ batchId: 1, day: 1, period: 1 }, { unique: true });
// Prevent faculty conflict: same faculty, same day, same period
timetableSchema.index({ facultyId: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
