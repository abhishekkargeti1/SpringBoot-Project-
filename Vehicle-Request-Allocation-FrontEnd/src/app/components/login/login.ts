import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Loginservice } from '../../services/loginservice';
import { AuthService, UserDetails } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
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

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  loginDetails = {
    userName: "",
    password: ""
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
  
  onSubmit() {
    // console.log('Form submitted!');
    // console.log('Username:', this.loginDetails.userName);
    // console.log('Password:', this.loginDetails.password);
    // console.log('CAPTCHA Input:', this.userCaptchaInput);
    // console.log('CAPTCHA Answer:', this.captchaAnswer);
    
    // Validate form fields
    if (!this.loginDetails.userName || !this.loginDetails.password) {
      this.messageBox.open("Please fill in all fields", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return false;
    }

    // Validate CAPTCHA
    if (!this.userCaptchaInput) {
      this.messageBox.open("Please solve the CAPTCHA", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return false;
    }
     

    if (!this.verifyCaptcha()) {
      //console.log('CAPTCHA verification failed');
      this.messageBox.open("Incorrect CAPTCHA answer. Please try again.", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      this.refreshCaptcha();
      return false;
    }


    // Call login service
    this.loginService.getUserLogin(this.loginDetails).subscribe(
      (response: any) => {
        console.log("Login Form Submitted Successfully!");
        
        // Store token and user details globally
        if (response.token && response.userDetails) {
          //alert("Response:"+ JSON.stringify(response) );
          this.authService.setAuthData(response.token, response.userDetails);
          
          this.messageBox.open("Login Successful! Redirecting...", "OK", {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar', 'success-snackbar']
          });

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        } else {
          this.messageBox.open("Invalid response format", "OK", {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar']
          });
        }
      },
      (error: any) => {
       // console.error('Login error:', error);
        this.messageBox.open(error.error?.message || "Login failed. Please try again.", "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
      }
    );


 
    
    return false; 
  }
}
