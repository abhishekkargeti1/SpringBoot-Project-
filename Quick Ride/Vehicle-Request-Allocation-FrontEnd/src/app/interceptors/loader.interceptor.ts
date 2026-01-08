import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loaderService = inject(LoaderService);

  // Exclude Razorpay order creation API from loader to prevent interference with Razorpay modal
  const url = req.url.toLowerCase();
  const isRazorpayOrderApi = url.includes('createorder') || url.includes('create_order');
  
  // Also exclude Razorpay checkout script loading
  const isRazorpayCheckout = url.includes('razorpay.com');

  if (isRazorpayOrderApi || isRazorpayCheckout) {
    // Don't show loader for Razorpay APIs
    return next(req);
  }

  // Show loader when request starts
  loaderService.show();

  // Hide loader when request completes (success or error)
  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};

