export interface Subject {
    _id: string;
    subjectName: string;
    subjectCode: string;
}

export interface Batch {
    _id: string;
    name: string;
}

export interface TimetableSlot {
    _id: string;
    day: string;
    period: number;
    subjectId: Subject;
    batchId: Batch;
    roomId?: any;
    facultyId?: any;
    type?: string;
}
