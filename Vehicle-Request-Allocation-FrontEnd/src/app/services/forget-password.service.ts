import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgetPasswordService {
  private baseUrl: string = environment.baseUrl;
  constructor(private http:HttpClient){}

  sendResetEmail(email:string){
    return this.http.post(this.baseUrl+'/send-otp',{email});
  }

  sendUpdatedPassword(email:string,newPassword:string){
    return this.http.patch(this.baseUrl+'/update-password',{email,newPassword});
  }

 
  

}
