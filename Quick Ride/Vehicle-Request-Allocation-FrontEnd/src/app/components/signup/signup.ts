import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Signupservice } from '../../services/signupservice';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(private messageBox:MatSnackBar,private signService:Signupservice){}

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
  userDetails = {
    'firstName': "",
    'middleName': "",
    'lastName': "",
    'email': "",
    'password': "",
    'confirmPassword': "",
    'contactNumber': ""
  }
  
  termsAccepted = false;

  onSubmit() {
    if (this.userDetails.firstName == ""  || this.userDetails.lastName == "" || this.userDetails.email == "" || this.userDetails.password == "" || this.userDetails.confirmPassword == "") {
      this.messageBox.open("Please fill all the fields", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }else if(this.userDetails.password !== this.userDetails.confirmPassword){
      this.messageBox.open("Password and confirm password do not match", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }else if(!this.termsAccepted){
      this.messageBox.open("Please accept the Terms of Service and Privacy Policy", "OK", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar']
      });
      return;
    }
    console.log("Form Submitted Successfully!");
    
    
    this.signService.signup(this.userDetails).subscribe(
      (response:any)=>{
        this.messageBox.open(response.message, "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', 'success-snackbar']
        });
      },(error:any)=>{
        this.messageBox.open(error.error.message, "OK", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
      }
  )
  }

}
