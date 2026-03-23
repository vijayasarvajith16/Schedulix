const express = require('express');
const router = express.Router();
const Mapping = require('../models/Mapping');
const { protect, authorize } = require('../middleware/auth');


router.get('/', protect, async (req, res, next) => {
    try {
        const { batchId, facultyId, subjectId } = req.query;
        let query = {};
        if (batchId) query.batchId = batchId;
        if (facultyId) query.facultyId = facultyId;
        if (subjectId) query.subjectId = subjectId;

        // find() with populate to resolve references
        const mappings = await Mapping.find(query)
            .populate('facultyId', 'name department email')
            .populate('subjectId', 'subjectName subjectCode hoursPerWeek')
            .populate('batchId', 'name year section')
            .sort({ createdAt: -1 });

        const total = await Mapping.countDocuments(query);
        res.status(200).json({ success: true, count: total, data: mappings });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/mappings
// @desc    Create a mapping (Faculty → Subject → Batch)  - insertOne()
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { facultyId, subjectId, batchId } = req.body;
        if (!facultyId || !subjectId || !batchId) {
            res.status(400);
            throw new Error('facultyId, subjectId, and batchId are all required');
        }
        const mapping = await Mapping.create({ facultyId, subjectId, batchId });
        const populated = await mapping.populate([
            { path: 'facultyId', select: 'name department' },
            { path: 'subjectId', select: 'subjectName hoursPerWeek' },
            { path: 'batchId', select: 'name year section' },
        ]);
        res.status(201).json({ success: true, message: 'Mapping created successfully', data: populated });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/mappings/:id
// @desc    Delete a mapping - deleteOne()
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const result = await Mapping.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error(`Mapping not found with id ${req.params.id}`);
        }
        res.status(200).json({ success: true, message: 'Mapping deleted successfully', data: {} });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/mappings
// @desc    Delete all mappings for a batch - deleteMany() via req.query
// @access  Private/Admin
router.delete('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { batchId } = req.query;
        let query = batchId ? { batchId } : {};
        const result = await Mapping.deleteMany(query);
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} mappings deleted`,
            data: {},
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
