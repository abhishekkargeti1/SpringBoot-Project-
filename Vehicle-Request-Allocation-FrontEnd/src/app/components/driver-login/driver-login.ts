import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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

  constructor(private router: Router, private messageBox: MatSnackBar) {}

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
    console.log('Driver Login Attempt:', this.email, this.password, this.rememberMe);
    
    // TODO: Implement driver login API call
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // TODO: Navigate to driver dashboard after successful login
      // this.router.navigate(['/driver-dashboard']);
      this.messageBox.open('Driver login functionality will be implemented with backend API', 'Close', { 
        duration: 3000, 
        panelClass: ['custom-snackbar'] 
      });
    }, 1000);
  }
}
