import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Loginservice {

  private baseURL: string = environment.baseUrl;
  
  constructor(private http: HttpClient) { }


  getUserLogin(loginDetails: any) {
    return this.http.post(this.baseURL+'/userLogin',loginDetails);
  }




}
