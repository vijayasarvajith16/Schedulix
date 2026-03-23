import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService } from '../../services/timetable.service';
import { AuthService } from '../../services/auth.service';
import { TimetableSlot } from '../../models/timetable.model';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
    batches: any[] = [];
    selectedBatch: string = '';
    timetable: TimetableSlot[] = [];

    loadingParams: boolean = true;
    loadingGrid: boolean = false;
    error: string | null = null;

    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

    // Vibrant colors exactly matching the React app logic
    COLORS = ['#667eea', '#f5576c', '#43e97b', '#f093fb', '#4facfe', '#ffecd2', '#a18cd1', '#fbc2eb', '#84fab0', '#8fd3f4'];
    subjectColors: { [key: string]: string } = {};

    private batchSub: Subscription | null = null;
    private ttSub: Subscription | null = null;

    constructor(
        private timetableService: TimetableService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Process single-sign-on token sync via URL if available
        this.authService.syncTokenFromUrl();
        this.loadBatches();
    }

    loadBatches(): void {
        this.loadingParams = true;
        this.error = null;

        this.batchSub = this.timetableService.getBatches()
            .pipe(timeout(10000))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.batches = res.data;
                    } else {
                        this.error = "Failed to load batches.";
                    }
                    this.loadingParams = false;
                },
                error: (err) => {
                    this.error = "Error loading batches data. Please refresh.";
                    this.loadingParams = false;
                }
            });
    }

    onBatchSelect(): void {
        if (!this.selectedBatch) {
            this.timetable = [];
            this.subjectColors = {};
            return;
        }

        this.loadingGrid = true;
        this.error = null;

        this.ttSub = this.timetableService.getTimetableByBatchId(this.selectedBatch)
            .pipe(timeout(10000))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.timetable = res.data;
                        this.assignColors(this.timetable);
                    }
                    this.loadingGrid = false;
                },
                error: (err) => {
                    this.error = "Error loading timetable for this batch.";
                    this.loadingGrid = false;
                }
            });
    }

    assignColors(data: TimetableSlot[]): void {
        const colorMap: { [key: string]: string } = {};
        let ci = 0;
        data.forEach(slot => {
            const key = slot.subjectId?._id;
            if (key && !colorMap[key]) {
                colorMap[key] = this.COLORS[ci++ % this.COLORS.length];
            }
        });
        this.subjectColors = colorMap;
    }

    getSlot(day: string, period: number): TimetableSlot | undefined {
        return this.timetable.find(t => t.day === day && t.period === period);
    }

    getColor(slot: TimetableSlot | undefined): string {
        if (!slot || !slot.subjectId) return 'inherit';
        return this.subjectColors[slot.subjectId._id] || this.COLORS[0];
    }

    get subjectKeys() {
        return Object.keys(this.subjectColors);
    }

    getSubjectName(id: string): string {
        const slot = this.timetable.find(t => t.subjectId?._id === id);
        return slot ? slot.subjectId.subjectName : '';
    }

    logout(): void {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.batchSub?.unsubscribe();
        this.ttSub?.unsubscribe();
    }
}
