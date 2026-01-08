import { Injectable, signal } from '@angular/core';

export interface UserDetails {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role?: string;
  contactNumber: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Global token signal
  private token = signal<string | null>(null);
  // Global user details signal
  private userDetails = signal<UserDetails | null>(null);
  // Login status signal
  private isLoggedIn = signal<boolean>(false);

  // Getter methods
  getToken() {
    return this.token();
  }

  getUserDetails() {
    return this.userDetails();
  }

  getLoginStatus() {
    return this.isLoggedIn();
  }

  // Set authentication data
  setAuthData(token: string, userDetails: UserDetails) {
    this.token.set(token);
    this.userDetails.set(userDetails);
    this.isLoggedIn.set(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_details', JSON.stringify(userDetails));
  }

  // Clear authentication data (logout)
  clearAuthData() {
    this.token.set(null);
    this.userDetails.set(null);
    this.isLoggedIn.set(false);
    
    // Clear from localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_details');
  }

  // Initialize auth data from localStorage (for app startup)
  initializeAuth() {
    const token = localStorage.getItem('jwt_token');
    const userDetailsStr = localStorage.getItem('user_details');
    
    if (token && userDetailsStr) {
      try {
        const userDetails = JSON.parse(userDetailsStr);
        this.token.set(token);
        this.userDetails.set(userDetails);
        this.isLoggedIn.set(true);
      } catch (error) {
        console.error('Error parsing user details from localStorage:', error);
        this.clearAuthData();
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isLoggedIn() && !!this.token();
  }
}
