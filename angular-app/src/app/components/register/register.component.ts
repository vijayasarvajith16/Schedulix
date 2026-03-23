import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    form = {
        name: '',
        email: '',
        password: '',
        role: 'admin'
    };

    error = '';
    success = '';
    loading = false;

    // Relative path — Angular dev proxy forwards /api/* → http://localhost:5000/api
    private apiBase = '/api';

    constructor(private http: HttpClient) { }

    handleSubmit(event: Event) {
        event.preventDefault();
        this.error = '';
        this.success = '';
        this.loading = true;

        this.http.post(`${this.apiBase}/auth/register`, this.form).subscribe({
            next: () => {
                this.loading = false;
                this.success = 'Account created! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = 'http://localhost:3000/login';
                }, 2000);
            },
            error: (err) => {
                this.loading = false;
                console.error('Register error:', err);
                const msg = err?.error?.message
                    || err?.message
                    || `Registration failed (status: ${err?.status ?? 'network error'})`;
                this.error = msg;
            }
        });
    }

    goToLogin() {
        window.location.href = 'http://localhost:3000/login';
    }
}
