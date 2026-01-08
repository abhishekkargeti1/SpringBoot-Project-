import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DriverRegistrationService } from '../../services/driver-registration.service';

@Component({
  selector: 'app-driver-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './driver-signup.html',
  styleUrl: './driver-signup.css'
})
export class DriverSignup implements OnInit {
  // Personal Information
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  email: string = '';
  contactNumber: string = '';

  // Documents
  aadhaarCardNumber: string = '';
  aadhaarCardFile: File | null = null;
  policeVerificationExpiry: string = '';
  policeVerificationFile: File | null = null;

  // Car Details
  carRegistrationNumber: string = '';
  carOwnerName: string = '';
  yearOfExpire: string = '';
  registrationCardFile: File | null = null;

  // Vehicle Type
  vehicalType: string = '';
  vehicleTypes: any[] = [];
  isLoadingVehicleTypes: boolean = false;

  // Car Selection
  selectedCar: string = '';
  cars: any[] = [];
  isLoadingCars: boolean = false;

  // Form State
  agreeToTerms: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private driverRegistrationService: DriverRegistrationService
  ) {}

  ngOnInit(): void {
    this.loadVehicleTypes();
  }

  loadVehicleTypes(): void {
    this.isLoadingVehicleTypes = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(`${environment.baseUrl}/getVehicalTypeDetails`, { headers }).subscribe({
      next: (response: any) => {
        if (response.details && Array.isArray(response.details)) {
          this.vehicleTypes = response.details;
        } else if (Array.isArray(response)) {
          this.vehicleTypes = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.vehicleTypes = response.data;
        } else {
          this.vehicleTypes = [];
        }
        this.isLoadingVehicleTypes = false;
      },
      error: (error) => {
        console.error('Error loading vehicle types:', error);
        this.vehicleTypes = [];
        this.isLoadingVehicleTypes = false;
      }
    });
  }

  onVehicleTypeChange(): void {
    // Reset car selection when vehicle type changes
    this.selectedCar = '';
    this.cars = [];
    
    // Load cars if a vehicle type is selected
    if (this.vehicalType && this.vehicalType !== '' && this.vehicalType !== '0') {
      this.loadCarsByType();
    }
  }

  loadCarsByType(): void {
    const vehicleTypeId = parseInt(this.vehicalType, 10);
    if (isNaN(vehicleTypeId) || vehicleTypeId <= 0) {
      this.cars = [];
      return;
    }

    this.isLoadingCars = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(`${environment.baseUrl}/getVehicalDetails/${vehicleTypeId}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('Car details received:', response);
        // Handle different response formats
        if (response.details && Array.isArray(response.details)) {
          this.cars = response.details;
        } else if (Array.isArray(response)) {
          this.cars = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.cars = response.data;
        } else {
          this.cars = [];
        }
        this.isLoadingCars = false;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.cars = [];
        this.isLoadingCars = false;
      }
    });
  }

  onAadhaarCardChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.aadhaarCardFile = file;
    }
  }

  onPoliceVerificationChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.policeVerificationFile = file;
    }
  }

  onRegistrationCardChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.registrationCardFile = file;
    }
  }

  onSubmit(): void {
    // Validate required fields
    if (!this.firstName || !this.lastName || !this.email || !this.contactNumber || 
        !this.aadhaarCardNumber || !this.policeVerificationExpiry ||
        !this.carRegistrationNumber || !this.carOwnerName || !this.yearOfExpire || 
        !this.vehicalType || this.vehicalType === '' || this.vehicalType === '0') {
      alert('Please fill in all required fields including vehicle type');
      return;
    }

    // Validate car selection if cars are available
    if (this.cars.length > 0 && (!this.selectedCar || this.selectedCar === '' || this.selectedCar === '0')) {
      alert('Please select a car');
      return;
    }

    // Validate files
    if (!this.aadhaarCardFile || !this.policeVerificationFile || !this.registrationCardFile) {
      alert('Please upload all required documents');
      return;
    }

    if (!this.agreeToTerms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    this.isLoading = true;

    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Personal Information
    formData.append('firstName', this.firstName);
    if (this.middleName) {
      formData.append('middleName', this.middleName);
    }
    formData.append('lastName', this.lastName);
    formData.append('contactNumber', this.contactNumber);
    formData.append('email', this.email);

    // Documents
    formData.append('aadhaarCardNumber', this.aadhaarCardNumber);
    formData.append('aadhaarCard', this.aadhaarCardFile!);
    formData.append('policeVerificationExpiry', this.policeVerificationExpiry);
    formData.append('policeVerificationCertificate', this.policeVerificationFile!);

    // Car Details
    formData.append('carDetails.carRegistrationNumber', this.carRegistrationNumber);
    formData.append('carDetails.ownerName', this.carOwnerName);
    formData.append('carDetails.yearOfExpire', this.yearOfExpire);
    formData.append('carDetails.registrationCard', this.registrationCardFile!);

    // Vehicle Type - Backend expects car_details field which references vehical_details.id
    // The car_details field in driver_details table is a foreign key to vehical_details.id
    // Convert to number to ensure it's sent as integer, not string
    const vehicleTypeId = parseInt(this.vehicalType, 10);
    if (isNaN(vehicleTypeId) || vehicleTypeId <= 0) {
      alert('Please select a valid vehicle type');
      this.isLoading = false;
      return;
    }
    
    console.log('Selected vehicle type ID:', vehicleTypeId);
    console.log('Available vehicle types:', this.vehicleTypes);
    
    // Send as car_details (the foreign key field name that backend expects)
    formData.append('car_details', vehicleTypeId.toString());
    // Also send vehicalType for backward compatibility if backend needs it
    formData.append('vehicalType', vehicleTypeId.toString());
    
    // Log all form data for debugging
    console.log('FormData being sent:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Call service to register driver
    this.driverRegistrationService.registerDriver(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Driver registration successful:', response);
        alert('Registration successful! Please login to continue.');
        this.router.navigate(['/driver-login']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Driver registration error:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Registration failed. Please try again.';
        alert(errorMessage);
      }
    });
  }
}
