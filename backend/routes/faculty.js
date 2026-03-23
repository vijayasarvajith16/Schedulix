const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/auth');


router.get('/', protect, async (req, res, next) => {
    try {
        const { search, department, limit: limitParam, sort: sortParam } = req.query;

        let query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (department) query.department = department;

        const limitVal = parseInt(limitParam) || 100;
        const sortField = sortParam || 'name';

        
        const total = await Faculty.countDocuments(query);
        const faculties = await Faculty.find(query)
            .sort({ [sortField]: 1 })
            .limit(limitVal);

        res.status(200).json({ success: true, count: total, data: faculties });
    } catch (error) {
        next(error);
    }
});


router.get('/me', protect, async (req, res, next) => {
    try {
       
        let faculty = await Faculty.findOne({ userId: req.user._id });
      
        if (!faculty) {
            faculty = await Faculty.findOne({ email: req.user.email });
            
            if (faculty) {
                await Faculty.updateOne({ _id: faculty._id }, { userId: req.user._id });
            }
        }
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'No faculty profile found for this user. Ask admin to link your account.' });
        }
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});


router.get('/:id', protect, async (req, res, next) => {
    try {
       
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) {
            res.status(404);
            throw new Error(`Faculty not found with id ${req.params.id}`);
        }
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});


router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const faculty = await Faculty.create(req.body);
        res.status(201).json({ success: true, message: 'Faculty added successfully', data: faculty });
    } catch (error) {
        next(error);
    }
});


router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
       
        const result = await Faculty.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            res.status(404);
            throw new Error(`Faculty not found with id ${req.params.id}`);
        }
        const updated = await Faculty.findById(req.params.id);
        res.status(200).json({ success: true, message: 'Faculty updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
});


router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        // deleteOne()
        const result = await Faculty.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error(`Faculty not found with id ${req.params.id}`);
        }
        res.status(200).json({ success: true, message: 'Faculty deleted successfully', data: {} });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
