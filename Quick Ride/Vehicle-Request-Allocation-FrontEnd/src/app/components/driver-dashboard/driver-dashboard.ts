import { Component, OnInit, AfterViewInit, OnDestroy, signal, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, DriverDetails, CarDetails } from '../../services/auth.service';
import { Dashboardservice } from '../../services/dashboardservice';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Chart, registerables, TooltipItem } from 'chart.js';
Chart.register(...registerables);

// Define types locally to avoid import issues
interface IFrame {
  command: string;
  headers: { [key: string]: string };
  body: string;
}

interface IMessage {
  command: string;
  headers: { [key: string]: string };
  body: string;
  ack: () => void;
  nack: () => void;
}

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './driver-dashboard.html',
  styleUrl: './driver-dashboard.css'
})
export class DriverDashboard implements OnInit, AfterViewInit, OnDestroy {
  driverDetails: DriverDetails | null = null;
  carDetails: CarDetails | null = null;
  bookingHistory: any[] = [];
  isLoadingHistory = signal(false);
  pieChart: Chart | null = null;
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  // WebSocket client
  private stompClient: any = null;
  
  // Booking statistics for pie chart
  bookingStats = {
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    inProgress: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: Dashboardservice,
    private messageBox: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if driver is authenticated
    if (!this.authService.isDriverAuthenticated()) {
      this.router.navigate(['/driver-login']);
      return;
    }

    // Get driver details
    this.driverDetails = this.authService.getDriverDetails();
    this.carDetails = this.authService.getCarDetails();
    
    // Debug: Check if car details are available
    console.log('Driver Dashboard - Driver Details:', this.driverDetails);
    console.log('Driver Dashboard - Car Details (from service):', this.carDetails);
    
    // If car details not found, try to get from localStorage directly
    if (!this.carDetails) {
      try {
        const carDetailsStr = localStorage.getItem('car_details');
        if (carDetailsStr) {
          const carDetailsFromStorage = JSON.parse(carDetailsStr);
          console.log('Found car details in localStorage:', carDetailsFromStorage);
          if (carDetailsFromStorage && (carDetailsFromStorage.carRegistrationNumber || carDetailsFromStorage.id)) {
            this.carDetails = carDetailsFromStorage;
            // Update the auth service with the car details
            this.authService.setDriverAuthData(
              this.authService.getToken() || '',
              this.driverDetails!,
              carDetailsFromStorage
            );
          }
        }
      } catch (error) {
        console.error('Error parsing car details from localStorage:', error);
      }
    }
    
    // If car details might be nested in driver details, try to extract them
    if (!this.carDetails && this.driverDetails) {
      const nestedCarDetails = (this.driverDetails as any)['Car Details'] || 
                               (this.driverDetails as any)['car Details'] ||
                               (this.driverDetails as any).carDetails;
      if (nestedCarDetails && (nestedCarDetails.carRegistrationNumber || nestedCarDetails.id)) {
        console.log('Found nested car details:', nestedCarDetails);
        this.carDetails = nestedCarDetails;
        // Store the extracted car details
        this.authService.setDriverAuthData(
          this.authService.getToken() || '',
          this.driverDetails,
          nestedCarDetails
        );
      }
    }
    
    console.log('Final Car Details:', this.carDetails);

    // Load booking history
    if (this.driverDetails?.driverId) {
      this.loadBookingHistory();
    }
    
    // Initialize WebSocket connection (non-blocking)
    this.initializeWebSocket().catch(error => {
      console.warn('WebSocket initialization failed, continuing without WebSocket:', error);
    });
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after booking history is loaded
    // Wait a bit for DOM to be ready, then try to create chart if data exists
    setTimeout(() => {
      if (this.bookingStats.total > 0) {
        this.createPieChart();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    
    // Disconnect WebSocket
    this.disconnectWebSocket();
  }

  loadBookingHistory(): void {
    const driverId = this.driverDetails?.driverId;
    if (!driverId) {
      console.warn('Driver ID not available, cannot load booking history');
      return;
    }

    this.isLoadingHistory.set(true);
    
    // Try driver-specific endpoint first, fallback to regular endpoint
    this.dashboardService.getDriverBookingHistory(driverId).subscribe({
      next: (response: any) => {
        console.log('Driver booking history API response:', response);
        this.isLoadingHistory.set(false);
        
        // Handle different response structures
        let history: any[] = [];
        if (response?.['Booking Details ']) {
          history = Array.isArray(response['Booking Details ']) ? response['Booking Details '] : [];
        } else if (response?.['Booking Details']) {
          history = Array.isArray(response['Booking Details']) ? response['Booking Details'] : [];
        } else if (response?.bookingDetails) {
          history = Array.isArray(response.bookingDetails) ? response.bookingDetails : [];
        } else if (response?.data) {
          history = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          history = response;
        } else if (response && typeof response === 'object') {
          history = [response];
        }
        
        this.bookingHistory = history;
        this.calculateBookingStats();
        this.cdr.detectChanges();
        
        // Create chart after view updates
        setTimeout(() => {
          this.createPieChart();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading driver booking history:', error);
        this.isLoadingHistory.set(false);
        
        // Fallback: try regular booking history endpoint
        this.dashboardService.getBookingHistory(driverId).subscribe({
          next: (response: any) => {
            let history: any[] = [];
            if (response?.['Booking Details ']) {
              history = Array.isArray(response['Booking Details ']) ? response['Booking Details '] : [];
            } else if (response?.['Booking Details']) {
              history = Array.isArray(response['Booking Details']) ? response['Booking Details'] : [];
            } else if (Array.isArray(response)) {
              history = response;
            }
            this.bookingHistory = history;
            this.calculateBookingStats();
            this.cdr.detectChanges();
            setTimeout(() => {
              this.createPieChart();
            }, 200);
          },
          error: (err) => {
            console.error('Error loading booking history:', err);
            this.messageBox.open('Failed to load booking history', 'OK', {
              duration: 3000,
              panelClass: ['custom-snackbar']
            });
          }
        });
      }
    });
  }

  calculateBookingStats(): void {
    // Total duties = total number of bookings/duties
    const totalDuties = this.bookingHistory.length;
    
    this.bookingStats = {
      total: totalDuties,
      completed: 0,
      pending: 0,
      cancelled: 0,
      inProgress: 0
    };

    this.bookingHistory.forEach(booking => {
      const status = (booking.status || booking.bookingStatus || booking.dutyStatus || '').toLowerCase().trim();
      
      if (status.includes('completed') || status.includes('complete') || status === 'completed') {
        this.bookingStats.completed++;
      } else if (status.includes('pending') || status.includes('waiting') || status === 'pending') {
        this.bookingStats.pending++;
      } else if (status.includes('cancelled') || status.includes('cancel') || status === 'cancelled') {
        this.bookingStats.cancelled++;
      } else if (status.includes('progress') || status.includes('ongoing') || status.includes('active') || status.includes('in progress')) {
        this.bookingStats.inProgress++;
      } else {
        // Default to pending if status is unclear
        this.bookingStats.pending++;
      }
    });

    console.log('Booking Statistics Calculated:', this.bookingStats);
    console.log('Total Duties:', totalDuties);
  }

  createPieChart(): void {
    try {
      // Destroy existing chart if any
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }

      // Try to get canvas element using ViewChild first, then fallback to getElementById
      let ctx: HTMLCanvasElement | null = null;
      
      if (this.chartCanvas?.nativeElement) {
        ctx = this.chartCanvas.nativeElement;
      } else {
        ctx = document.getElementById('bookingPieChart') as HTMLCanvasElement;
      }

      if (!ctx) {
        console.warn('Canvas element not found, retrying...');
        setTimeout(() => this.createPieChart(), 200);
        return;
      }

      // Calculate total duties (total bookings)
      const totalDuties = this.bookingStats.total;

      // If no duties, don't create chart (overlay will show)
      if (totalDuties === 0) {
        console.log('No duties found, chart will not be created');
        return;
      }

      // Prepare data for pie chart - showing duty distribution
      const data = [
        this.bookingStats.completed,
        this.bookingStats.pending,
        this.bookingStats.inProgress,
        this.bookingStats.cancelled
      ];

      const labels = [
        'Completed Duties',
        'Pending Duties',
        'In Progress Duties',
        'Cancelled Duties'
      ];

      // Filter out zero values for cleaner chart visualization
      const filteredData: number[] = [];
      const filteredLabels: string[] = [];
      const filteredColors: string[] = [];
      const filteredBorderColors: string[] = [];

      const colors = [
        { bg: 'rgba(16, 185, 129, 0.9)', border: 'rgba(16, 185, 129, 1)' },  // Green for completed (#10b981)
        { bg: 'rgba(245, 158, 11, 0.9)', border: 'rgba(245, 158, 11, 1)' }, // Amber for pending (#f59e0b)
        { bg: 'rgba(14, 165, 233, 0.9)', border: 'rgba(14, 165, 233, 1)' }, // Sky blue for in progress (#0ea5e9)
        { bg: 'rgba(239, 68, 68, 0.9)', border: 'rgba(239, 68, 68, 1)' }   // Red for cancelled (#ef4444)
      ];

      data.forEach((value, index) => {
        if (value > 0) {
          filteredData.push(value);
          filteredLabels.push(labels[index]);
          filteredColors.push(colors[index].bg);
          filteredBorderColors.push(colors[index].border);
        }
      });

      // Only create chart if we have data to show
      if (filteredData.length === 0) {
        console.log('No data to display in chart');
        return;
      }

      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: filteredLabels,
          datasets: [{
            label: 'Total Duties: ' + totalDuties,
            data: filteredData,
            backgroundColor: filteredColors,
            borderColor: filteredBorderColors,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Total Duties: ' + totalDuties,
              font: {
                size: 16,
                weight: 700
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 13,
                  weight: 600
                },
                usePointStyle: true,
                pointStyle: 'circle',
                generateLabels: (chart) => {
                  const data = chart.data;
                  if (data.labels && data.datasets) {
                    const dataset = data.datasets[0];
                    const bgColors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : [];
                    const borderColors = Array.isArray(dataset.borderColor) ? dataset.borderColor : [];
                    
                    return data.labels.map((label, i) => {
                      const value = dataset.data[i] as number;
                      const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                      return {
                        text: `${label}: ${value} (${percentage}%)`,
                        fillStyle: (bgColors[i] || '#667eea') as string,
                        strokeStyle: (borderColors[i] || '#667eea') as string,
                        lineWidth: 2,
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              callbacks: {
                title: () => {
                  return `Total Duties: ${totalDuties}`;
                },
                label: (context: TooltipItem<'pie'>): string => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${label}: ${value} duties (${percentage}%)`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              padding: 15,
              titleFont: {
                size: 15,
                weight: 'bold'
              },
              bodyFont: {
                size: 14,
                weight: 600
              },
              displayColors: true,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1
            }
          }
        }
      });
      
      console.log('Pie chart created successfully with', totalDuties, 'total duties');
    } catch (error) {
      console.error('Error creating pie chart:', error);
    }
  }

  getBookingStatus(booking: any): string {
    const status = booking.status || booking.bookingStatus || 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('complete')) {
      return 'status-completed';
    } else if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return 'status-pending';
    } else if (statusLower.includes('cancelled') || statusLower.includes('cancel')) {
      return 'status-cancelled';
    } else if (statusLower.includes('progress') || statusLower.includes('ongoing') || statusLower.includes('active')) {
      return 'status-progress';
    }
    return 'status-default';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  viewDocument(fileName: string): void {
    if (!fileName) {
      this.messageBox.open('File not available', 'OK', {
        duration: 3000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    // Use dashboard service to fetch the document
    this.dashboardService.getDocument(fileName).subscribe({
      next: (blob: any) => {
        // Check if blob is valid
        if (!blob || blob.size === 0) {
          this.messageBox.open('Document is empty or not available.', 'OK', {
            duration: 3000,
            panelClass: ['custom-snackbar']
          });
          return;
        }

        // Create blob URL from the response
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Try to open in new tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow) {
          // Popup blocked - trigger download instead
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
          
          this.messageBox.open('Popup blocked. Document downloaded instead.', 'OK', {
            duration: 3000,
            panelClass: ['custom-snackbar']
          });
        } else {
          // Clean up blob URL after opening
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error fetching document:', error);
        
        let errorMessage = 'Failed to load document. Please try again.';
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Login session expired. Please login again.';
        } else if (error.status === 404) {
          errorMessage = 'Document not found.';
        }
        
        this.messageBox.open(errorMessage, 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar']
        });
      }
    });
  }

  async initializeWebSocket(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return;
    }

    const driverId = this.driverDetails?.driverId;
    if (!driverId) {
      console.warn('Driver ID not available for WebSocket connection');
      return;
    }

    try {
      // Check if libraries are available globally (loaded via CDN in index.html)
      // @ts-ignore - Check for global Stomp
      const Stomp = (window as any).Stomp || (globalThis as any).Stomp;
      // @ts-ignore - Check for global SockJS
      const SockJS = (window as any).SockJS || (globalThis as any).SockJS;
      
      if (!Stomp || !SockJS) {
        console.error('WebSocket libraries not loaded. Please check that CDN scripts are included in index.html');
        return;
      }

      // Use global libraries (from CDN/script tags)
      this.createStompClientWithGlobal(Stomp, SockJS, token, driverId);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private createStompClientWithGlobal(Stomp: any, SockJS: any, token: string, driverId: string): void {
    // Enable STOMP debug logging for troubleshooting
    Stomp.debug = (str: string) => {
      console.log('STOMP: ' + str);
    };
    
    // Create WebSocket URL - some backends require token in query parameter
    // Try with token in URL first, fallback to headers if needed
    const wsUrl = `http://localhost:8080/ws?token=${encodeURIComponent(token)}`;
    console.log('Creating SockJS connection to:', wsUrl);
    
    const socket = new SockJS(wsUrl);
    this.stompClient = Stomp.over(socket);
    
    // Set connection headers with JWT token (Spring may use either headers or query param)
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Attempting WebSocket connection with driverId:', driverId);
    console.log('Token present:', !!token);
    console.log('Token length:', token?.length);
    
    this.stompClient.connect(
      headers,
      (frame: IFrame) => {
        console.log('✅ WebSocket Connected successfully!');
        console.log('Connection frame:', frame);
        
        // Wait a moment before sending to ensure connection is fully established
        setTimeout(() => {
          // Send driver notification with proper ChatMessage format
          const chatMessage = {
            driverId: driverId,
            sender: null, // Will be set by backend
            content: null, // Will be set by backend
            timestamp: null // Will be set by backend
          };
          
          console.log('Sending message to /app/chat:', chatMessage);
          try {
            this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
            console.log('✅ Message sent successfully');
          } catch (error) {
            console.error('❌ Error sending message:', error);
          }
        }, 500);
        
        // Subscribe to messages
        console.log('Subscribing to /topic/messages');
        const subscription = this.stompClient.subscribe('/topic/messages', (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            console.log('✅ Received WebSocket message:', data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            console.error('Raw message body:', message.body);
          }
        });
        
        console.log('✅ Subscription created:', subscription);
        
        // Show success notification
        this.messageBox.open('WebSocket connected successfully!', 'OK', {
          duration: 2000,
          panelClass: ['custom-snackbar']
        });
      },
      (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        console.error('Error type:', typeof error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        // Try to extract more error information
        let errorMessage = 'WebSocket connection failed. ';
        if (error.headers) {
          console.error('Error headers:', error.headers);
          if (error.headers['message']) {
            errorMessage += error.headers['message'];
          }
        }
        if (error.body) {
          console.error('Error body:', error.body);
          try {
            const errorBody = JSON.parse(error.body);
            if (errorBody.message) {
              errorMessage += errorBody.message;
            }
          } catch (e) {
            errorMessage += error.body;
          }
        }
        if (errorMessage === 'WebSocket connection failed. ') {
          errorMessage += 'Please check:\n1. Backend server is running\n2. WebSocket endpoint is configured\n3. JWT token is valid\n4. CORS is properly configured';
        }
        
        this.messageBox.open(errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['custom-snackbar']
        });
      }
    );
  }


  handleWebSocketMessage(data: any): void {
    // Handle incoming WebSocket messages
    console.log('Handling WebSocket message:', data);
    
    // Show notification with content from backend
    if (data.content) {
      this.messageBox.open(data.content, 'OK', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
    } else if (data.message || data.notification) {
      this.messageBox.open(data.message || data.notification, 'OK', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
    }
    
    // Refresh booking history if a new booking is received
    if (data.type === 'new_booking' || data.type === 'booking_update') {
      if (this.driverDetails?.driverId) {
        this.loadBookingHistory();
      }
    }
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      try {
        // Try new API first (deactivate)
        if (typeof this.stompClient.deactivate === 'function') {
          this.stompClient.deactivate();
        } else if (typeof this.stompClient.disconnect === 'function') {
          // Old API (disconnect)
          this.stompClient.disconnect();
        }
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
      }
      this.stompClient = null;
      console.log('WebSocket disconnected');
    }
  }

  logout(): void {
    // Disconnect WebSocket before logout
    this.disconnectWebSocket();
    this.authService.clearAuthData();
    this.router.navigate(['/driver-login']);
  }
}

