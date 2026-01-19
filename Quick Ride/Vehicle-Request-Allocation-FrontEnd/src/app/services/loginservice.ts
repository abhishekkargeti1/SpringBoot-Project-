import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

export interface DriverLoginResponse {
  'Driver Details'?: DriverDetails;
  'Car Details'?: CarDetails;
  token: string;
  [key: string]: any; // Allow additional properties
}

export interface LoginRequest {
  userName: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Loginservice {

  private baseURL: string = environment.baseUrl;
  
  constructor(private http: HttpClient) { }

  getUserLogin(loginDetails: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/userLogin`, loginDetails);
  }

  getDriverLogin(loginDetails: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/driverLogin`, loginDetails);
  }
}
