import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { AuthService } from './services/auth.service';
import { GlobalLoader } from './components/global-loader/global-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Vehicle-Request-Allocation-FrontEnd');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialize auth data from localStorage on app startup
    this.authService.initializeAuth();
  }
}
