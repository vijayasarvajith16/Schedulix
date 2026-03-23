const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Generates conflict-free timetable entries from mappings.
 * @param {Array} mappings - Populated mapping docs (facultyId, subjectId, batchId)
 * @returns {Array} Array of timetable slot objects
 */
const generateTimetable = (mappings) => {

    const facultySlots = {};
    const batchSlots = {};
    const timetableEntries = [];

  
    const assignments = [];
    for (const mapping of mappings) {
        const subject = mapping.subjectId;
        const category = subject.category || 'Theory (T)';
        const facultyId = mapping.facultyId._id.toString();
        const subjectId = subject._id.toString();
        const batchId = mapping.batchId._id.toString();

        if (category === 'Theory (T)') {
            assignments.push({
                type: 'theory',
                facultyId, subjectId, batchId,
                hours: subject.hoursPerWeek || 3,
            });
        } else if (category === 'Lab (L)') {
            let remainingLab = subject.labHours > 0 ? subject.labHours : subject.hoursPerWeek || 3;
    
            while (remainingLab > 0) {
                let chunk = remainingLab > 4 ? 2 : remainingLab;
                assignments.push({
                    type: 'lab',
                    facultyId, subjectId, batchId,
                    hours: chunk,
                });
                remainingLab -= chunk;
            }
        } else if (category === 'LIT') {
            if (subject.theoryHours > 0) {
                assignments.push({
                    type: 'theory',
                    facultyId, subjectId, batchId,
                    hours: subject.theoryHours,
                });
            }
            if (subject.labHours > 0) {
                let remainingLab = subject.labHours;
                while (remainingLab > 0) {
                    let chunk = remainingLab > 4 ? 2 : remainingLab;
                    assignments.push({
                        type: 'lab',
                        facultyId, subjectId, batchId,
                        hours: chunk,
                    });
                    remainingLab -= chunk;
                }
            }
        }
    }


    const labsFirst = assignments.filter(a => a.type === 'lab');
    const theorySecond = assignments.filter(a => a.type === 'theory');
    shuffleArray(labsFirst);
    shuffleArray(theorySecond);
    const sortedAssignments = [...labsFirst, ...theorySecond];


    const allSlots = [];
    for (const day of DAYS) {
        for (const period of PERIODS) {
            allSlots.push({ day, period });
        }
    }

    for (const assignment of sortedAssignments) {
        const { type, facultyId, subjectId, batchId, hours } = assignment;

    
        if (!facultySlots[facultyId]) facultySlots[facultyId] = {};
        if (!batchSlots[batchId]) batchSlots[batchId] = {};

        if (type === 'theory') {
            let slotsAssigned = 0;
            const shuffledSlots = [...allSlots];
            shuffleArray(shuffledSlots);

            for (const { day, period } of shuffledSlots) {
                if (slotsAssigned >= hours) break;

                const facultyBusy = facultySlots[facultyId][day] && facultySlots[facultyId][day][period];
                const batchBusy = batchSlots[batchId][day] && batchSlots[batchId][day][period];

                if (!facultyBusy && !batchBusy) {
                    if (!facultySlots[facultyId][day]) facultySlots[facultyId][day] = {};
                    if (!batchSlots[batchId][day]) batchSlots[batchId][day] = {};

                    facultySlots[facultyId][day][period] = true;
                    batchSlots[batchId][day][period] = true;

                    timetableEntries.push({ batchId, facultyId, subjectId, day, period, type: 'Theory' });
                    slotsAssigned++;
                }
            }

            if (slotsAssigned < hours) {
                console.warn(
                    `⚠️  Theory: Could only assign ${slotsAssigned}/${hours} slots for ` +
                    `batch ${batchId} / faculty ${facultyId} / subject ${subjectId}`
                );
            }
        } else if (type === 'lab') {
           
            const sessions = [[1, 2], [3, 4], [5, 6, 7, 8]];
            let scheduled = false;

            const shuffledDays = [...DAYS];
            shuffleArray(shuffledDays);

            for (const day of shuffledDays) {
                if (scheduled) break;

                const shuffledSessions = [...sessions];
                shuffleArray(shuffledSessions);

                for (const session of shuffledSessions) {
                    if (scheduled) break;

                    if (session.length < hours) continue;

                    // Sliding window within the session
                    for (let i = 0; i <= session.length - hours; i++) {
                        const block = session.slice(i, i + hours);

                        let isFree = true;
                        for (const p of block) {
                            const fBusy = facultySlots[facultyId][day] && facultySlots[facultyId][day][p];
                            const bBusy = batchSlots[batchId][day] && batchSlots[batchId][day][p];
                            if (fBusy || bBusy) {
                                isFree = false;
                                break;
                            }
                        }

                        if (isFree) {
                            if (!facultySlots[facultyId][day]) facultySlots[facultyId][day] = {};
                            if (!batchSlots[batchId][day]) batchSlots[batchId][day] = {};

                            for (const p of block) {
                                facultySlots[facultyId][day][p] = true;
                                batchSlots[batchId][day][p] = true;

                                timetableEntries.push({
                                    batchId,
                                    facultyId,
                                    subjectId,
                                    day,
                                    period: p,
                                    type: 'Lab'
                                });
                                facultySlots[facultyId][day][p] = true;
                                batchSlots[batchId][day][p] = true;
                            }
                            scheduled = true;
                            break; // break inner loop, found a valid start index
                        }
                    }
                }
            }

            if (!scheduled) {
                console.warn(
                    ` Lab: Could not find contiguous ${hours}-slot block within valid sessions for ` +
                    `batch ${batchId} / faculty ${facultyId} / subject ${subjectId}`
                );
            }
        }
    }

    return timetableEntries;
};


const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
};

module.exports = { generateTimetable };
