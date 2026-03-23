const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/auth');


router.get('/', protect, async (req, res, next) => {
    try {
        const { year } = req.query;
        let query = {};
        if (year) query.year = parseInt(year);

        const total = await Batch.countDocuments(query);
        const batches = await Batch.find(query).sort({ year: 1, section: 1 });

        res.status(200).json({ success: true, count: total, data: batches });
    } catch (error) {
        next(error);
    }
});


router.get('/:id', protect, async (req, res, next) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) {
            res.status(404);
            throw new Error(`Batch not found`);
        }
        res.status(200).json({ success: true, data: batch });
    } catch (error) {
        next(error);
    }
});

router.post('/seed', protect, authorize('admin'), async (req, res, next) => {
    try {
        
        await Batch.deleteMany({});

        const batchData = [];
        const years = [1, 2, 3, 4];
        const sections = ['N', 'P', 'Q'];
        for (const year of years) {
            for (const section of sections) {
                batchData.push({
                    year,
                    section,
                    name: `${year}${section}`,
                    semester: year * 2 - 1,  
                });
            }
        }

        const batches = await Batch.insertMany(batchData);
        res.status(201).json({
            success: true,
            message: `${batches.length} batches seeded successfully`,
            data: batches,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
