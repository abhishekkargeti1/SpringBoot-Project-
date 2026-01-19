import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Loginservice } from '../../services/loginservice';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-driver-login',
  standalone: true,
  imports: [RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './driver-login.html',
  styleUrl: './driver-login.css'
})
export class DriverLogin implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  showPassword = signal(false);

  // Custom CAPTCHA properties
  captchaNum1: number = 0;
  captchaNum2: number = 0;
  captchaOperation: string = '+';
  captchaAnswer: number = 0;
  userCaptchaInput: string = '';
  captchaQuestion: string = '';

  constructor(
    private router: Router, 
    private messageBox: MatSnackBar,
    private loginService: Loginservice,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.generateCaptcha();
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  generateCaptcha(): void {
    // Generate random numbers between 1 and 10
    this.captchaNum1 = Math.floor(Math.random() * 10) + 1;
    this.captchaNum2 = Math.floor(Math.random() * 10) + 1;
    
    // Randomly choose operation
    const operations = ['+', '-', '*'];
    this.captchaOperation = operations[Math.floor(Math.random() * operations.length)];
    
    // Calculate answer
    switch(this.captchaOperation) {
      case '+':
        this.captchaAnswer = this.captchaNum1 + this.captchaNum2;
        break;
      case '-':
        // Ensure positive result
        if (this.captchaNum1 < this.captchaNum2) {
          [this.captchaNum1, this.captchaNum2] = [this.captchaNum2, this.captchaNum1];
        }
        this.captchaAnswer = this.captchaNum1 - this.captchaNum2;
        break;
      case '*':
        this.captchaAnswer = this.captchaNum1 * this.captchaNum2;
        break;
    }
    
    this.captchaQuestion = `${this.captchaNum1} ${this.captchaOperation} ${this.captchaNum2} = ?`;
    this.userCaptchaInput = '';
  }

  refreshCaptcha(): void {
    this.generateCaptcha();
  }

  verifyCaptcha(): boolean {
    return parseInt(this.userCaptchaInput) === this.captchaAnswer;
  }

  onSubmit(): void {
    // Validate form fields
    if (!this.email || !this.password) {
      this.messageBox.open("Please fill in all fields", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Validate CAPTCHA
    if (!this.userCaptchaInput) {
      this.messageBox.open("Please solve the CAPTCHA", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (!this.verifyCaptcha()) {
      this.messageBox.open("Incorrect CAPTCHA answer. Please try again.", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      this.refreshCaptcha();
      return;
    }

    this.isLoading = true;
    
    const loginDetails = {
      userName: this.email,
      password: this.password
    };

    // Call driver login API
    this.loginService.getDriverLogin(loginDetails).subscribe(
      (response: any) => {
        console.log("Driver Login API Response:", response);
        this.isLoading = false;
        
        // Extract data from response - API structure: { "Driver Details": {...}, "Car Details": {...}, "token": "..." }
        // OR: { "Driver Details": {..., "Car Details": {...}}, "token": "..." }
        const token = response.token || response.jwt_token || null;
        
        // First try to get Driver Details from root
        let driverDetailsRaw = response['Driver Details'] || response['driver Details'] || response.driverDetails;
        
        // Extract Car Details - check root level first, then nested in Driver Details
        let carDetails = response['Car Details'] || response['car Details'] || response.carDetails || null;
        
        // If Car Details is nested inside Driver Details, extract it
        if (!carDetails && driverDetailsRaw) {
          carDetails = driverDetailsRaw['Car Details'] || driverDetailsRaw['car Details'] || driverDetailsRaw.carDetails || null;
        }
        
        // If we found carDetails nested, remove it from driverDetails to keep data clean
        if (driverDetailsRaw && carDetails) {
          driverDetailsRaw = { ...driverDetailsRaw };
          if (driverDetailsRaw['Car Details']) delete driverDetailsRaw['Car Details'];
          if (driverDetailsRaw['car Details']) delete driverDetailsRaw['car Details'];
          if (driverDetailsRaw.carDetails) delete driverDetailsRaw.carDetails;
        }
        
        const driverDetails = driverDetailsRaw;
        
        // Validate that we have the required data
        if (!driverDetails) {
          console.error('Driver details not found in response:', response);
          console.log('Response keys:', Object.keys(response || {}));
          this.messageBox.open("Invalid response format. Driver details not found.", "OK", {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar']
          });
          this.refreshCaptcha();
          return;
        }
        
        if (!token) {
          console.error('Token not found in response:', response);
          this.messageBox.open("Authentication token not received. Please try again.", "OK", {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar']
          });
          this.refreshCaptcha();
          return;
        }
        
        // Log extracted data for debugging
        console.log('Extracted driver data:', {
          hasDriverDetails: !!driverDetails,
          hasCarDetails: !!carDetails,
          carDetails: carDetails,
          driverDetailsKeys: driverDetails ? Object.keys(driverDetails) : [],
          carDetailsKeys: carDetails ? Object.keys(carDetails) : []
        });
        
        // Store driver authentication data
        this.authService.setDriverAuthData(token, driverDetails, carDetails || undefined);
        
        // Verify storage
        const storedCarDetails = this.authService.getCarDetails();
        console.log('Stored car details in auth service:', storedCarDetails);
        
        // Success message
        this.messageBox.open("Login Successful! Redirecting to driver dashboard...", "OK", {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', 'success-snackbar']
        });

        // Redirect to driver dashboard after successful login
        setTimeout(() => {
          this.router.navigate(['/driver-dashboard']);
        }, 1000);
      },
      (error: any) => {
        console.error('Driver login error:', error);
        this.isLoading = false;
        
        // Handle error response
        const errorMessage = error.error?.message || error.message || "Login failed. Please check your credentials and try again.";
        this.messageBox.open(errorMessage, "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
        
        // Refresh CAPTCHA on error
        this.refreshCaptcha();
      }
    );
  }
}
