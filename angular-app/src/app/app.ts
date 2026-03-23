import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);
  reactAppUrl = environment.reactAppUrl;

  get isRegisterPage(): boolean {
    return this.router.url === '/register';
  }

  getUserName() {
    const user = this.authService.getUserData() || {};
    const storedUserStr = localStorage.getItem('user');
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    return storedUser?.name || 'Faculty';
  }

  getUserInitial() {
    return this.getUserName()?.charAt(0)?.toUpperCase() || 'F';
  }

  getUserRole() {
    return this.authService.getUserData()?.role || 'faculty';
  }

  logout() {
    this.authService.logout();
  }
}
