import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Dashboardservice {
  
  private baseUrl: string = environment.baseUrl;
  constructor(private http:HttpClient,private authService:AuthService){}

    sendUpdatedPassword(email: string, newPassword: string) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    const body = { email, newPassword };
    return this.http.patch(`${this.baseUrl}/update-password`, body, { headers });
  }

  getVehicleDetails() {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/getVehicalTypeDetails`, { headers });
  }

  getCarDetailsByType(vehicleTypeId: number) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/getVehicalDetails/${vehicleTypeId}`, { headers });
  }

  calculateAmount(vehicleTypeId: number, distance: number, isRoundTrip: boolean = false) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/calculateAmount/${vehicleTypeId}/${distance}/${isRoundTrip}`, { headers });
  }

  createOrder(amount: string) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    const body = { amount };
    return this.http.post(`${this.baseUrl}/create_order`, body, { headers });
  }

  getDriver(vehicleTypeId: number) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/getDriver/${vehicleTypeId}`, { headers });
  }

  getDiscount(couponCode: string, amount: string) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/getDicount/${couponCode}/${amount}`, { headers });
  }

  saveBookingDetails(bookingData: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    from: string;
    to: string;
    customerId: string;
    vehicleTypeId: number;
    selectedCarId: number;
    driverId: number | null;
    distance?: number | string | null;
    timeDuration?: string | null;
    amountToPaid?: number | string | null;
    paymentType?: string | null;
    status?: string | null;
  }) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    console.log('Sending booking data to API:', JSON.stringify(bookingData, null, 2));
    return this.http.post(`${this.baseUrl}/bookingDetails`, bookingData, { headers });
  }

  getBookingDetailsByUserId(userId: number | string) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/bookingDetails/${userId}`, { headers });
  }

  getBookingHistory(userId: number | string) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` };
    return this.http.get(`${this.baseUrl}/bookingHistory/${userId}`, { headers });
  }
  
}
