import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimetableSlot } from '../models/timetable.model';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class TimetableService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }

    /** Fetch all faculty documents (same as React's getFaculty()) */
    getAllFaculty(): Observable<{ success: boolean; count: number; data: any[] }> {
        return this.http.get<{ success: boolean; count: number; data: any[] }>(
            `${this.apiUrl}/faculty`, { headers: this.getHeaders() }
        );
    }

    /** Fetch timetable entries for a specific Faculty document _id */
    getTimetableByFacultyId(facultyId: string): Observable<{ success: boolean; data: TimetableSlot[] }> {
        return this.http.get<{ success: boolean; data: TimetableSlot[] }>(
            `${this.apiUrl}/timetable?facultyId=${facultyId}`, { headers: this.getHeaders() }
        );
    }

    /** Fetch all batches */
    getBatches(): Observable<{ success: boolean; count: number; data: any[] }> {
        return this.http.get<{ success: boolean; count: number; data: any[] }>(
            `${this.apiUrl}/batches`, { headers: this.getHeaders() }
        );
    }

    /** Fetch timetable entries for a specific Batch document _id */
    getTimetableByBatchId(batchId: string): Observable<{ success: boolean; data: TimetableSlot[] }> {
        return this.http.get<{ success: boolean; data: TimetableSlot[] }>(
            `${this.apiUrl}/timetable?batchId=${batchId}`, { headers: this.getHeaders() }
        );
    }
}

