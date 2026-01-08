import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private isLoading = signal<boolean>(false);
  private loadingCount = 0;

  // Get the loading state signal
  getLoadingState() {
    return this.isLoading.asReadonly();
  }

  // Show loader
  show() {
    this.loadingCount++;
    this.isLoading.set(true);
  }

  // Hide loader
  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.isLoading.set(false);
    }
  }

  // Force hide loader (reset counter)
  forceHide() {
    this.loadingCount = 0;
    this.isLoading.set(false);
  }
}







