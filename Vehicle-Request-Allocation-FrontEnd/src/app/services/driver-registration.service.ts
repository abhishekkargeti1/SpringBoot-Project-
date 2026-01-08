import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverRegistrationService {
  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  registerDriver(formData: FormData) {
    // Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
    const headers = new HttpHeaders();
    return this.http.post(`${this.baseUrl}/driverRegistration`, formData, { headers });
  }
}

