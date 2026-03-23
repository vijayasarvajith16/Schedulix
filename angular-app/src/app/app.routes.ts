import { Routes } from '@angular/router';
import { FacultyDashboardComponent } from './components/faculty-dashboard/faculty-dashboard.component';
import { BatchViewComponent } from './components/batch-view/batch-view.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'register', component: RegisterComponent },  // Public – no auth guard
    { path: 'faculty-dashboard', component: FacultyDashboardComponent, canActivate: [authGuard] },
    { path: 'batch-view', component: BatchViewComponent, canActivate: [authGuard] },
    // If no route matches...
    { path: '**', redirectTo: '' }
];
