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

export interface DriverDetails {
  driverId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  contactNumber: string;
  email: string;
  aadhaarCardNumber: string;
  policeVerificationExpiry: string;
  policeVerificationFileName: string;
  aadhaarCardFileName: string;
  driverRating: string;
  driverDutyStatus: string;
  vehicleTypeName: string;
}

export interface CarDetails {
  id: number;
  driverId: number;
  carRegistrationNumber: string;
  yearOfExpire: string;
  registrationCardFileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Global token signal
  private token = signal<string | null>(null);
  // Global user details signal
  private userDetails = signal<UserDetails | null>(null);
  // Global driver details signal
  private driverDetails = signal<DriverDetails | null>(null);
  // Global car details signal
  private carDetails = signal<CarDetails | null>(null);
  // Login status signal
  private isLoggedIn = signal<boolean>(false);
  // Driver login status signal
  private isDriverLoggedIn = signal<boolean>(false);

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

  getDriverDetails() {
    return this.driverDetails();
  }

  getCarDetails() {
    return this.carDetails();
  }

  getDriverLoginStatus() {
    return this.isDriverLoggedIn();
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

  // Set driver authentication data
  setDriverAuthData(token: string, driverDetails: DriverDetails, carDetails?: CarDetails) {
    this.token.set(token);
    this.driverDetails.set(driverDetails);
    if (carDetails) {
      this.carDetails.set(carDetails);
    }
    this.isDriverLoggedIn.set(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('driver_jwt_token', token);
    localStorage.setItem('driver_details', JSON.stringify(driverDetails));
    if (carDetails) {
      localStorage.setItem('car_details', JSON.stringify(carDetails));
    }
  }

  // Clear authentication data (logout)
  clearAuthData() {
    this.token.set(null);
    this.userDetails.set(null);
    this.driverDetails.set(null);
    this.carDetails.set(null);
    this.isLoggedIn.set(false);
    this.isDriverLoggedIn.set(false);
    
    // Clear from localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_details');
    localStorage.removeItem('driver_jwt_token');
    localStorage.removeItem('driver_details');
    localStorage.removeItem('car_details');
  }

  // Initialize auth data from localStorage (for app startup)
  initializeAuth() {
    const token = localStorage.getItem('jwt_token');
    const userDetailsStr = localStorage.getItem('user_details');
    const driverToken = localStorage.getItem('driver_jwt_token');
    const driverDetailsStr = localStorage.getItem('driver_details');
    const carDetailsStr = localStorage.getItem('car_details');
    
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
    
    if (driverToken && driverDetailsStr) {
      try {
        const driverDetails = JSON.parse(driverDetailsStr);
        const carDetails = carDetailsStr ? JSON.parse(carDetailsStr) : null;
        this.token.set(driverToken);
        this.driverDetails.set(driverDetails);
        if (carDetails) {
          this.carDetails.set(carDetails);
        }
        this.isDriverLoggedIn.set(true);
      } catch (error) {
        console.error('Error parsing driver details from localStorage:', error);
        this.clearAuthData();
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isLoggedIn() && !!this.token();
  }

  // Check if driver is authenticated
  isDriverAuthenticated(): boolean {
    return this.isDriverLoggedIn() && !!this.token();
  }
}
