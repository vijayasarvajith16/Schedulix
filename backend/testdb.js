const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');

mongoose.connect('mongodb://127.0.0.1:27017/timetable_db').then(async () => {
    const subjects = await Subject.find();
    console.log('--- SUBJECTS ---');
    subjects.forEach(s => console.log(`${s.subjectName} | Cat: ${s.category} | TH: ${s.theoryHours} | LH: ${s.labHours} | HW: ${s.hoursPerWeek}`));

    const slots = await Timetable.find().populate('subjectId');
    console.log('\--- TIMETABLE SLOTS ---');
    const types = {};
    const catCounts = {};
    slots.forEach(s => {
        types[s.type] = (types[s.type] || 0) + 1;
        const cat = s.subjectId?.category || 'Unknown';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    console.log('Slot Types:', types);
    console.log('Subject Categories linked to Slots:', catCounts);
    console.log('Total slots:', slots.length);

    process.exit();
});
