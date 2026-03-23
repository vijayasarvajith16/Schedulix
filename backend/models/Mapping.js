const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
}, { timestamps: true });

// Compound unique index: one faculty-subject-batch combination
mappingSchema.index({ facultyId: 1, subjectId: 1, batchId: 1 }, { unique: true });

module.exports = mongoose.model('Mapping', mappingSchema);
