import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-global-loader',
  imports: [],
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.css'
})
export class GlobalLoader {
  constructor(public loaderService: LoaderService) {}
}







