const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all subjects with optional query filters  - find(), sort(), countDocuments()
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { semester, department, sort: sortParam } = req.query;
        let query = {};
        if (semester) query.semester = parseInt(semester);
        if (department) query.department = department;

        const total = await Subject.countDocuments(query);
        const subjects = await Subject.find(query).sort({ [sortParam || 'subjectName']: 1 });

        res.status(200).json({ success: true, count: total, data: subjects });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/subjects/:id
// @desc    Get single subject - findOne() via findById, req.params
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404);
            throw new Error(`Subject not found with id ${req.params.id}`);
        }
        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/subjects
// @desc    Create subject  - insertOne()
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, message: 'Subject added successfully', data: subject });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject - updateOne() with $set and $inc
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { incrementHours, ...updateData } = req.body;
        let updateOp = { $set: updateData };
        // Demonstrate $inc operator: increment hoursPerWeek if flag provided
        if (incrementHours) {
            updateOp.$inc = { hoursPerWeek: parseInt(incrementHours) };
        }
        const result = await Subject.updateOne({ _id: req.params.id }, updateOp);
        if (result.matchedCount === 0) {
            res.status(404);
            throw new Error(`Subject not found with id ${req.params.id}`);
        }
        const updated = await Subject.findById(req.params.id);
        res.status(200).json({ success: true, message: 'Subject updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject - deleteOne()
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const result = await Subject.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error(`Subject not found with id ${req.params.id}`);
        }
        res.status(200).json({ success: true, message: 'Subject deleted successfully', data: {} });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
