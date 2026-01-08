import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ForgetPasswordService } from '../../services/forget-password.service';

@Component({
  selector: 'app-forget-password',
  imports: [RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css'
})
export class ForgetPassword {
  isLoading = signal(false);
  emailSent = signal(false);
  showOTPInput = signal(false);
  showPasswordInput = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  private systemGenratedOTP: string = "";
  
  
  setSystemGenratedOTP(otp:any) {
      this.systemGenratedOTP = otp;
  }

  getSystemGenratedOTP() {
    return this.systemGenratedOTP;
  }
  resetEmailDetails = {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: ""
  }
  constructor(
    private router: Router,
    private messageBox: MatSnackBar,
    private forgetPasswordService: ForgetPasswordService
  ) {}

  onSubmit() {
    this.sendOTP();
    return false;
  }

  sendOTP() {
    console.log('Sending OTP to:', this.resetEmailDetails.email);

    // Validate email
    if (!this.resetEmailDetails.email) {
      this.messageBox.open("Please enter your email address", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.resetEmailDetails.email)) {
      this.messageBox.open("Please enter a valid email address", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Show loading state
    this.isLoading.set(true);

    // Call forget password service to send OTP
    this.forgetPasswordService.sendResetEmail(this.resetEmailDetails.email).subscribe(
      (response: any) => {
        console.log("OTP sent successfully!");
        console.log("Response:", response);
        
        this.isLoading.set(false);
        this.showOTPInput.set(true);
        this.setSystemGenratedOTP(response.otpValue);
        this.messageBox.open(response.message, "OK", {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', 'success-snackbar']
        });
      },
      (error: any) => {
        console.error('Send OTP error:', error);
        this.isLoading.set(false);
        
        this.messageBox.open(error.error?.message || "Failed to send OTP. Please try again.", "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
      }
    );
  }


  verifyOTP() {
    console.log('Verifying OTP:', this.resetEmailDetails.otp);

    // Validate OTP
    if (!this.resetEmailDetails.otp) {
      this.messageBox.open("Please enter the OTP", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.resetEmailDetails.otp.length < 4) {
      this.messageBox.open("Please enter a valid OTP", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.resetEmailDetails.otp !== this.getSystemGenratedOTP()) {
      console.log(this.systemGenratedOTP);
      this.messageBox.open("Please enter a correct OTP", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Show loading state
    this.isLoading.set(true);

    // For now, just show success message (you can add actual OTP verification service call later)
    setTimeout(() => {
      this.isLoading.set(false);
      this.showPasswordInput.set(true);
      
      this.messageBox.open("OTP verified successfully! Please enter your new password.", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar', 'success-snackbar']
      });
    }, 2000);
  }

  resetPassword() {
    console.log('Resetting password');

    // Validate new password
    if (!this.resetEmailDetails.newPassword) {
      this.messageBox.open("Please enter a new password", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.resetEmailDetails.newPassword.length < 6) {
      this.messageBox.open("Password must be at least 6 characters long", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.resetEmailDetails.newPassword !== this.resetEmailDetails.confirmPassword) {
      this.messageBox.open("Passwords do not match", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Show loading state
    this.isLoading.set(true);
    this.forgetPasswordService.sendUpdatedPassword(this.resetEmailDetails.email,this.resetEmailDetails.newPassword).subscribe(
      (response:any)=>{
       
          this.isLoading.set(false);
          this.emailSent.set(true);
          
          this.messageBox.open(response.message, "OK", {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar', 'success-snackbar']
          });
    
          // Redirect to login after successful password reset
        
            this.router.navigate(['/login']);
        
       
      },(error:any)=>{
        this.isLoading.set(false);
        this.messageBox.open(error.error?.message || "Failed to reset password. Please try again.", "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
      }
    );
    // For now, just show success message (you can add actual password reset service call later)
    
  }

  resendOTP() {
    this.showOTPInput.set(false);
    this.showPasswordInput.set(false);
    this.resetEmailDetails.otp = "";
    this.resetEmailDetails.newPassword = "";
    this.resetEmailDetails.confirmPassword = "";
    this.sendOTP();
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

}