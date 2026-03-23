import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableService } from '../../services/timetable.service';
import { AuthService } from '../../services/auth.service';
import { TimetableSlot } from '../../models/timetable.model';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Component({
    selector: 'app-faculty-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './faculty-dashboard.component.html',
    styleUrls: ['./faculty-dashboard.component.css']
})
export class FacultyDashboardComponent implements OnInit, OnDestroy {
    timetable: TimetableSlot[] = [];
    facultyDoc: any = null;
    loading: boolean = true;
    error: string | null = null;

    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

    private sub: Subscription | null = null;
    private facultySub: Subscription | null = null;

    constructor(
        private timetableService: TimetableService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authService.syncTokenFromUrl();
        this.loadTimetable();
    }

    loadTimetable(): void {
        const userData = this.authService.getUserDataFromToken() || this.authService.getUserData();

        if (!userData) {
            this.loading = false;
            this.error = "Could not identify the logged-in faculty. Please login again.";
            return;
        }

        this.loading = true;
        this.error = null;

        this.facultySub = this.timetableService.getAllFaculty()
            .pipe(timeout(10000))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        const allFaculty = res.data;

                        // Match logic similar to MyTimetable.jsx
                        const matched = allFaculty.find(f =>
                            (userData.email && f.email?.toLowerCase() === userData.email?.toLowerCase()) ||
                            (userData.name && f.name?.toLowerCase().trim() === userData.name?.toLowerCase().trim())
                        ) || allFaculty[0]; // fallback

                        if (!matched) {
                            this.error = "No faculty profile linked to your account.";
                            this.loading = false;
                            return;
                        }

                        this.facultyDoc = matched;
                        this.fetchTimetable(matched._id);
                    } else {
                        this.error = "Failed to load faculty profiles.";
                        this.loading = false;
                    }
                },
                error: (err) => {
                    this.error = "Error loading faculty data. Please refresh.";
                    this.loading = false;
                }
            });
    }

    fetchTimetable(id: string): void {
        this.sub = this.timetableService.getTimetableByFacultyId(id)
            .pipe(timeout(10000))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.timetable = response.data;
                    }
                    this.loading = false;
                },
                error: (err) => {
                    if (err?.name === 'TimeoutError') {
                        this.error = "Request timed out. Please check your connection.";
                    } else {
                        this.error = "Failed to fetch timetable data.";
                    }
                    this.loading = false;
                }
            });
    }

    getSlot(day: string, period: number): TimetableSlot | undefined {
        return this.timetable.find(t => t.day === day && t.period === period);
    }

    getBatches(): string[] {
        const batchNames = this.timetable
            .map(t => t.batchId?.name)
            .filter((name, idx, self) => name && self.indexOf(name) === idx);
        return batchNames;
    }

    getBatchClassCount(batchName: string): number {
        return this.timetable.filter(t => t.batchId?.name === batchName).length;
    }

    logout(): void {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.facultySub?.unsubscribe();
    }
}

