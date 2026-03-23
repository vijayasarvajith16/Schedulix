const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Timetable = require('../models/Timetable');
const Mapping = require('../models/Mapping');
const { protect, authorize } = require('../middleware/auth');
const { generateTimetable } = require('../utils/scheduler');

// @route   GET /api/timetable
// @desc    Get timetable with query filters (batchId, facultyId)
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { batchId, facultyId, day } = req.query;
        let query = {};
        if (batchId) query.batchId = batchId;
        if (facultyId) query.facultyId = facultyId;
        if (day) query.day = day;

        // find() with populate, sort()
        const timetable = await Timetable.find(query)
            .populate('batchId', 'name year section')
            .populate('facultyId', 'name department')
            .populate('subjectId', 'subjectName subjectCode hoursPerWeek')
            .sort({ day: 1, period: 1 });

        res.status(200).json({ success: true, count: timetable.length, data: timetable });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/timetable/generate
// @desc    Generate timetable from all mappings - insertMany(), deleteMany()
// @access  Private/Admin
router.post('/generate', protect, authorize('admin'), async (req, res, next) => {
    try {
        // Fetch all mappings with populated sub-docs
        const mappings = await Mapping.find({})
            .populate('facultyId', 'name')
            .populate('subjectId', 'subjectName hoursPerWeek category theoryHours labHours')
            .populate('batchId', 'name year section');

        if (mappings.length === 0) {
            res.status(400);
            throw new Error('No mappings found. Please assign faculty to subjects/batches first.');
        }

        // Run scheduling algorithm
        const entries = generateTimetable(mappings);

        if (entries.length === 0) {
            res.status(500);
            throw new Error('Timetable generation failed. All slots exhausted due to conflicts.');
        }

        // Clear previous timetable - deleteMany()
        await Timetable.deleteMany({});

        // Save new timetable - insertMany()
        const saved = await Timetable.insertMany(entries, { ordered: false });

        res.status(201).json({
            success: true,
            message: `Timetable generated successfully with ${saved.length} slots`,
            data: { slotsGenerated: saved.length },
        });
    } catch (error) {
        // InsertMany may produce partial success (duplicate key), still return info
        if (error.writeErrors) {
            const inserted = error.insertedDocs ? error.insertedDocs.length : 0;
            return res.status(207).json({
                success: true,
                message: `Timetable partially generated. ${inserted} slots saved; some conflicts skipped.`,
                data: { slotsGenerated: inserted, conflicts: error.writeErrors.length },
            });
        }
        next(error);
    }
});

// @route   GET /api/timetable/export/:batchId
// @desc    Export timetable as CSV file  - res.download()
// @access  Private
router.get('/export/:batchId', protect, async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const timetable = await Timetable.find({ batchId })
            .populate('batchId', 'name')
            .populate('facultyId', 'name')
            .populate('subjectId', 'subjectName')
            .sort({ day: 1, period: 1 });

        if (timetable.length === 0) {
            res.status(404);
            throw new Error('No timetable found for this batch');
        }

        // Build CSV content
        const csvLines = ['Day,Period,Subject,Type,Faculty'];
        for (const slot of timetable) {
            csvLines.push(
                `${slot.day},${slot.period},${slot.subjectId.subjectName},${slot.type || 'Theory'},${slot.facultyId.name}`
            );
        }
        const csvContent = csvLines.join('\n');
        const batchName = timetable[0].batchId.name;
        const tmpPath = path.join(__dirname, '..', 'tmp', `timetable_${batchName}.csv`);

        // Ensure tmp dir exists
        const tmpDir = path.join(__dirname, '..', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        // Write CSV to file
        fs.writeFileSync(tmpPath, csvContent, 'utf8');

        // res.download() - File Download
        res.download(tmpPath, `timetable_${batchName}.csv`, (err) => {
            if (err) {
                console.error('Download error:', err.message);
            }
            // Clean up tmp file
            fs.unlink(tmpPath, () => { });
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/timetable/stream/:batchId
// @desc    Stream timetable CSV  - File Streaming via res.pipe()
// @access  Private
router.get('/stream/:batchId', protect, async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const timetable = await Timetable.find({ batchId })
            .populate('batchId', 'name')
            .populate('facultyId', 'name')
            .populate('subjectId', 'subjectName')
            .sort({ day: 1, period: 1 });

        if (timetable.length === 0) {
            res.status(404);
            throw new Error('No timetable found for this batch');
        }

        // Build CSV content
        const csvLines = ['Day,Period,Subject,Type,Faculty'];
        for (const slot of timetable) {
            csvLines.push(
                `${slot.day},${slot.period},${slot.subjectId.subjectName},${slot.type || 'Theory'},${slot.facultyId.name}`
            );
        }

        // Stream the response
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="timetable_${batchId}.csv"`);

        const { Readable } = require('stream');
        const readable = Readable.from(csvLines.join('\n'));
        readable.pipe(res);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/timetable/stats
// @desc    Get timetable statistics - countDocuments(), sort()
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
    try {
        const totalSlots = await Timetable.countDocuments();
        const batchCount = await Timetable.distinct('batchId').then(ids => ids.length);
        const facultyCount = await Timetable.distinct('facultyId').then(ids => ids.length);

        res.status(200).json({
            success: true,
            data: { totalSlots, batchCount, facultyCount },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
