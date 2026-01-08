import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Signupservice {

  private baseUrl: string = environment.baseUrl;

  constructor(private http:HttpClient){}
  
  signup(userDetails:any){
    return this.http.post(this.baseUrl+'/signup',userDetails);
  }
  
}
