import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { AuthService, UserDetails } from '../../services/auth.service';
import { Dashboardservice } from '../../services/dashboardservice';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  private routeLayer: L.LayerGroup | undefined;
  private testMarker: L.Marker | undefined;
  userDetails: UserDetails | null = null;
  showUserDropdown = false;
  showProfileModal = false;
  showVehicleModal = false;
  showCarModal = false;
  showAmountModal = false;
  showErrorModal = false;
  errorMessage = '';
  showSuccessModal = false;
  successMessage = '';
  showBookingPopup = false;
  showBookingDetailsModal = false;
  bookingDetails: {
    bookingId: number | null;
    route: string;
    vehicleType: string;
    carName: string;
    distance: string;
    duration: string;
    amount: number;
    paymentType: string;
    driverName: string;
    driverContact: string;
  } | null = null;
  allBookings: any[] = [];
  isLoadingBookings = false;
  selectedBookingIndex = 0;
  bookingHistory: any[] = [];
  isLoadingHistory = false;
  showTripDetailsModal = false;
  selectedTripDetails: any = null;
  showAllHistory = false;
  isBookingPopupMinimized = false;
  bookingPopupPosition = { x: window.innerWidth - 400, y: 100 };
  floatingIconPosition = { x: window.innerWidth - 80, y: window.innerHeight - 100 };
  
  // Initialize floating icon position on window resize
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isBookingPopupMinimized && this.showBookingPopup) {
      // Keep icon in bottom right corner
      this.floatingIconPosition = { 
        x: window.innerWidth - 80, 
        y: window.innerHeight - 100 
      };
    }
  }
  
  // Route-related properties
  isLoadingRoute = signal(false);
  isLoadingVehicles = signal(false);
  isLoadingCars = signal(false);
  isLoadingAmount = signal(false);
  isLoadingDriver = signal(false);
  routeInfo = signal<{distance: string, duration: string} | null>(null);
  amountInfo = signal<{beforeGSTAmount: number | string, SGST: number | string, CGST: number | string, finalAmount: number | string} | null>(null);
  driverDetails: {id: number, firstName: string, middleName?: string, lastName: string, contactNumber: string, driverRating?: string} | null = null;
  routeData = {
    source: '',
    destination: ''
  };
  isRoundTrip = false;
  selectedPaymentType: 'cash' | 'upi' | null = null;
  
  // Coupon code properties
  couponCode: string = '';
  discountedAmount: number | null = null;
  discountApplied: boolean = false;
  isLoadingCoupon = signal(false);
  couponError: string = '';
  
  // Vehicle selection properties
  vehicles: any[] = [];
  selectedVehicle: any = null;
  
  // Car selection properties
  cars: any[] = [];
  selectedCar: any = null;
  selectedVehicleType: any = null;
  
  // Geocoding properties
  sourceCoordinates: L.LatLngTuple | null = null;
  destinationCoordinates: L.LatLngTuple | null = null;
  sourceSuggestions = signal<string[]>([]);
  destinationSuggestions = signal<string[]>([]);
  showSourceSuggestions = signal(false);
  showDestinationSuggestions = signal(false);
  cityList: string[] = [];
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: Dashboardservice
  ) {}
  
  ngOnInit(): void {
    // Fix for default marker icon issue with Leaflet
    this.fixLeafletIconIssue();
    
    // Get user details from auth service
    this.userDetails = this.authService.getUserDetails();
    
    this.cityList = Object.keys(this.indianCities).sort((a, b) =>
      a.localeCompare(b)
    );
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load all booking details for the user after authentication check
    if (this.userDetails?.id) {
      this.loadAllBookings();
      this.loadBookingHistory();
    } else {
      console.warn('User details not available, will retry loading bookings');
      // Retry after a short delay in case userDetails is being set asynchronously
      setTimeout(() => {
        this.userDetails = this.authService.getUserDetails();
        if (this.userDetails?.id) {
          this.loadAllBookings();
          this.loadBookingHistory();
        }
      }, 500);
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile') && !target.closest('.user-dropdown')) {
      this.showUserDropdown = false;
    }
    if (!target.closest('.search-input-wrapper')) {
      this.showSourceSuggestions.set(false);
      this.showDestinationSuggestions.set(false);
    }
  }

  ngAfterViewInit(): void {
    // Use setTimeout to ensure the DOM is fully rendered
    setTimeout(() => {
      this.initMap();
    }, 1000); // Increased delay to ensure DOM is ready
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    console.log('Initializing map...');
    
    // Check if map container exists
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map container not found!');
      return;
    }
    
    console.log('Map container found:', mapElement);
    console.log('Map container dimensions:', {
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
      clientWidth: mapElement.clientWidth,
      clientHeight: mapElement.clientHeight
    });

    // Check if map container has proper dimensions
    if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
      console.warn('Map container has no dimensions, retrying in 500ms...');
      setTimeout(() => {
        this.initMap();
      }, 500);
      return;
    }

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded!');
      return;
    }
    
    try {
      // Initialize the map centered on India
      this.map = L.map('map', {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        zoomControl: true,
        preferCanvas: false,
        renderer: L.canvas()
      });

      console.log('Map created successfully:', this.map);
    } catch (error) {
      console.error('Error creating map:', error);
      return;
    }

    try {
      // Add OpenStreetMap tile layer (shows highways, road names, and details)
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      }).addTo(this.map);

      // Add error handling for tile loading
      osmLayer.on('tileerror', (e) => {
        console.warn('Tile loading error:', e);
        // Try fallback tile layer
        this.addFallbackTileLayer();
      });

      osmLayer.on('load', () => {
        console.log('Map tiles with highway details loaded successfully');
        // Add loaded class to hide loading text
        const mapElement = document.getElementById('map');
        if (mapElement) {
          mapElement.classList.add('loaded');
        }
      });

      console.log('OpenStreetMap tile layer with highway details added');
    } catch (error) {
      console.error('Error adding tile layer:', error);
      this.addFallbackTileLayer();
    }

    // Add a test marker to verify map is working
    try {
      this.testMarker = L.marker([28.6139, 77.2090]).addTo(this.map);
      this.testMarker.bindPopup('<b>Test Marker</b><br>Map is working!').openPopup();
      console.log('Test marker added to verify map functionality');
    } catch (error) {
      console.error('Error adding test marker:', error);
    }

    // Map is now ready for route planning without fixed markers
    
    // Invalidate map size after a short delay to ensure proper rendering
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Map size invalidated');
        
        // Force a re-render
        this.map.setView([20.5937, 78.9629], 5);
        console.log('Map view set');
      }
    }, 1000);
  }


  private fixLeafletIconIssue(): void {
    // Fix for Leaflet's default icon path issue
    // Use CDN icons as fallback if local assets don't exist
    const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
    const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';
    
    try {
      const iconDefault = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = iconDefault;
      console.log('Leaflet icon configuration set');
    } catch (error) {
      console.warn('Could not set custom Leaflet icon, using default:', error);
    }
  }

  toggleUserDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showUserDropdown = !this.showUserDropdown;
    console.log('User dropdown toggled:', this.showUserDropdown);
  }

  logout(): void {
    // Clear auth data
    this.authService.clearAuthData();
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }

  openProfileModal(): void {
    this.showProfileModal = true;
    this.showUserDropdown = false;
    this.scrollToTop();
    this.preventBodyScroll(true);
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.preventBodyScroll(false);
  }

  getUserDisplayName(): string {
    if (!this.userDetails) {
      return 'John Doe';
    }
    
    const firstName = this.userDetails.firstName || 'John';
    const middleName = this.userDetails.middleName || '';
    const lastName = this.userDetails.lastName || 'Doe';
    
    if (middleName) {
      return `${firstName} ${middleName} ${lastName}`;
    } else {
      return `${firstName} ${lastName}`;
    }
  }

  // Geocoding methods - Comprehensive list of Indian cities from all states and union territories
  private indianCities: { [key: string]: [number, number] } = {
    // ANDHRA PRADESH
    'Visakhapatnam': [17.6868, 83.2185],
    'Vijayawada': [16.5062, 80.6480],
    'Guntur': [16.3067, 80.4365],
    'Nellore': [14.4426, 79.9864],
    'Kurnool': [15.8305, 78.0500],
    'Rajahmundry': [17.0005, 81.8040],
    'Tirupati': [13.6288, 79.4192],
    'Kadapa': [14.4753, 78.8234],
    'Anantapur': [14.6819, 77.6006],
    'Chittoor': [13.2156, 79.1004],
    'Eluru': [16.7050, 81.1047],
    'Ongole': [15.5036, 80.0445],
    'Nandyal': [15.4777, 78.4836],
    'Machilipatnam': [16.1871, 81.1389],
    'Adoni': [15.6279, 77.2750],
    'Tenali': [16.2430, 80.6404],
    'Chilakaluripet': [16.0892, 80.1676],
    'Proddatur': [14.7500, 78.5500],
    'Hindupur': [13.8290, 77.4934],
    'Madanapalle': [13.5500, 78.5000],

    // ARUNACHAL PRADESH
    'Itanagar': [27.0844, 93.6053],
    'Naharlagun': [27.1044, 93.6953],
    'Pasighat': [28.0667, 95.3333],
    'Bomdila': [27.2667, 92.4167],
    'Tawang': [27.5833, 91.8667],
    'Ziro': [27.6333, 93.8333],
    'Along': [28.1667, 94.7667],
    'Daporijo': [27.9833, 94.2167],
    'Anini': [28.8000, 95.9000],
    'Khonsa': [26.9833, 95.5667],

    // ASSAM
    'Guwahati': [26.1833, 91.7333],
    'Silchar': [24.8167, 92.8000],
    'Dibrugarh': [27.4833, 94.9000],
    'Jorhat': [26.7500, 94.2167],
    'Tinsukia': [27.5000, 95.3667],
    'Sivasagar': [26.9833, 94.6333],
    'North Lakhimpur': [27.2333, 94.1167],
    'Dhemaji': [27.4833, 94.5833],
    'Nagaon': [26.3500, 92.6833],
    'Tezpur': [26.6333, 92.8000],
    'Barpeta': [26.3167, 91.0000],
    'Dhubri': [26.0167, 90.0167],
    'Goalpara': [26.1667, 90.6167],
    'Bongaigaon': [26.4667, 90.5667],
    'Karimganj': [24.8667, 92.3500],
    'Hailakandi': [24.6833, 92.5667],
    'Diphu': [25.8333, 93.4333],
    'Haflong': [25.1667, 93.0167],

    // BIHAR
    'Patna': [25.5941, 85.1376],
    'Gaya': [24.7500, 85.0167],
    'Bhagalpur': [25.2500, 87.0000],
    'Muzaffarpur': [26.1167, 85.4000],
    'Darbhanga': [26.1667, 85.9000],
    'Purnia': [25.7833, 87.4667],
    'Arrah': [25.5667, 84.6667],
    'Begusarai': [25.4167, 86.1333],
    'Katihar': [25.5333, 87.5833],
    'Munger': [25.3833, 86.4667],
    'Chhapra': [25.7833, 84.7500],
    'Saharsa': [25.8833, 86.6000],
    'Sasaram': [24.9500, 84.0167],
    'Hajipur': [25.6833, 85.2167],
    'Dehri': [24.9000, 84.1833],
    'Bettiah': [26.8000, 84.5000],
    'Motihari': [26.6500, 84.9167],
    'Siwan': [26.2167, 84.3667],
    'Kishanganj': [26.1000, 87.9500],
    'Sitamarhi': [26.6000, 85.4833],

    // CHHATTISGARH
    'Raipur': [21.2514, 81.6296],
    'Bhilai': [21.2167, 81.4333],
    'Bilaspur': [22.0833, 82.1500],
    'Korba': [22.3500, 82.6833],
    'Rajnandgaon': [21.1000, 81.0333],
    'Raigarh': [21.9000, 83.4000],
    'Jagdalpur': [19.0833, 82.0333],
    'Ambikapur': [23.1167, 83.2000],
    'Mahasamund': [21.1167, 82.1000],
    'Durg': [21.1833, 81.2833],
    'Bhatapara': [21.7333, 81.9333],
    'Dalli-Rajhara': [20.5833, 81.0833],
    'Naila Janjgir': [22.0167, 82.5833],
    'Tilda Newra': [21.5500, 81.6167],
    'Mungeli': [22.0667, 81.6833],
    'Manendragarh': [23.2000, 82.2000],
    'Sakti': [22.0333, 82.9667],
    'Chirmiri': [23.2000, 82.3500],
    'Pathalgaon': [22.5667, 83.4667],
    'Khairagarh': [21.4167, 80.9667],

    // GOA
    'Panaji': [15.4909, 73.8278],
    'Margao': [15.2721, 73.9572],
    'Vasco da Gama': [15.3860, 73.8158],
    'Mapusa': [15.6000, 73.8167],
    'Ponda': [15.4000, 74.0167],
    'Sanquelim': [15.5667, 74.0167],
    'Mormugao': [15.4000, 73.8000],
    'Curchorem': [15.2500, 74.1000],
    'Canacona': [15.0167, 74.0167],
    'Sanguem': [15.2333, 74.1500],

    // GUJARAT
    'Ahmedabad': [23.0225, 72.5714],
    'Surat': [21.1702, 72.8311],
    'Vadodara': [22.3072, 73.1812],
    'Rajkot': [22.3039, 70.8022],
    'Bhavnagar': [21.7645, 72.1519],
    'Jamnagar': [22.4707, 70.0577],
    'Junagadh': [21.5167, 70.4500],
    'Gandhinagar': [23.2156, 72.6369],
    'Nadiad': [22.7000, 72.8667],
    'Morbi': [22.8167, 70.8333],
    'Surendranagar': [22.7167, 71.6667],
    'Bharuch': [21.7000, 72.9667],
    'Anand': [22.5667, 72.9333],
    'Navsari': [20.9500, 72.9333],
    'Veraval': [20.9000, 70.3667],
    'Porbandar': [21.6419, 69.6093],
    'Ankleshwar': [21.6167, 73.0000],
    'Bardoli': [21.1167, 73.1167],
    'Godhra': [22.7500, 73.6167],
    'Palanpur': [24.1667, 72.4333],

    // HARYANA
    'Faridabad': [28.4089, 77.3178],
    'Gurgaon': [28.4595, 77.0266],
    'Panipat': [29.3833, 76.9667],
    'Ambala': [30.3786, 76.7805],
    'Yamunanagar': [30.1000, 77.2833],
    'Rohtak': [28.9000, 76.5667],
    'Hisar': [29.1667, 75.7167],
    'Karnal': [29.6833, 76.9833],
    'Sonipat': [28.9833, 77.0167],
    'Panchkula': [30.6911, 76.8536],
    'Bhiwani': [28.7833, 76.1333],
    'Sirsa': [29.5333, 75.0167],
    'Bahadurgarh': [28.6833, 76.9167],
    'Jind': [29.3167, 76.3167],
    'Thanesar': [29.9667, 76.8167],
    'Kaithal': [29.8000, 76.3833],
    'Rewari': [28.2000, 76.6167],
    'Palwal': [28.1500, 77.3333],
    'Hansi': [29.1000, 75.9667],
    'Narnaul': [28.0500, 76.1000],

    // HIMACHAL PRADESH
    'Shimla': [31.1048, 77.1734],
    'Dharamshala': [32.2200, 76.3200],
    'Solan': [30.9167, 77.1167],
    'Mandi': [31.7167, 76.9167],
    'Palampur': [32.1167, 76.5333],
    'Nahan': [30.5500, 77.3000],
    'Una': [31.4667, 76.2667],
    'Chamba': [32.5500, 76.1333],
    'Kullu': [31.9667, 77.1000],
    'Baddi': [30.9500, 76.8000],
    'Parwanoo': [30.8333, 76.9500],
    'Nalagarh': [31.0500, 76.7167],
    'Paonta Sahib': [30.4333, 77.6167],
    'Sundarnagar': [31.5333, 76.8833],
    'Kangra': [32.1000, 76.2667],
    'Hamirpur': [31.6833, 76.5167],
    'Bilaspur HP': [31.3333, 76.7667],
    'Rampur': [31.4500, 77.6167],
    'Theog': [31.1167, 77.3500],
    'Jogindernagar': [31.9833, 76.7833],

    // JHARKHAND
    'Ranchi': [23.3441, 85.3096],
    'Jamshedpur': [22.8000, 86.1833],
    'Dhanbad': [23.8000, 86.4500],
    'Bokaro': [23.7833, 85.9667],
    'Deoghar': [24.4833, 86.7000],
    'Phusro': [23.7833, 85.9833],
    'Hazaribagh': [24.0000, 85.3667],
    'Giridih': [24.1833, 86.3000],
    'Ramgarh': [23.6333, 85.5167],
    'Medininagar': [24.2167, 84.8667],
    'Chirkunda': [23.7500, 86.8667],
    'Sahibganj': [25.2500, 87.6500],
    'Chaibasa': [22.5667, 85.8167],
    'Gumla': [23.0500, 84.5500],
    'Dumka': [24.2667, 87.2500],
    'Madhupur': [24.2667, 86.6500],
    'Chas': [23.6333, 86.1667],
    'Jhumri Telaiya': [24.4333, 85.5167],
    'Ghatshila': [22.6000, 86.4667],
    'Simdega': [22.6167, 84.5167],

    // KARNATAKA
    'Bangalore': [12.9716, 77.5946],
    'Mysore': [12.2958, 76.6394],
    'Hubli': [15.3647, 75.1240],
    'Mangalore': [12.9141, 74.8560],
    'Belgaum': [15.8667, 74.5000],
    'Gulbarga': [17.3333, 76.8333],
    'Davanagere': [14.4667, 75.9167],
    'Bellary': [15.1500, 76.9333],
    'Bijapur': [16.8167, 75.7167],
    'Shimoga': [13.9167, 75.5667],
    'Tumkur': [13.3333, 77.1000],
    'Raichur': [16.2000, 77.3667],
    'Bidar': [17.9000, 77.5500],
    'Hospet': [15.2667, 76.4000],
    'Hassan': [13.0000, 76.1000],
    'Gadag': [15.4167, 75.6167],
    'Udupi': [13.3333, 74.7500],
    'Robertsonpet': [12.9667, 78.2667],
    'Bhadravati': [13.8667, 75.7000],
    'Chitradurga': [14.2333, 76.4000],

    // KERALA
    'Kochi': [9.9312, 76.2673],
    'Thiruvananthapuram': [8.5241, 76.9366],
    'Kozhikode': [11.2588, 75.7804],
    'Thrissur': [10.5167, 76.2167],
    'Kollam': [8.8806, 76.5917],
    'Palakkad': [10.7667, 76.6500],
    'Alappuzha': [9.5000, 76.3333],
    'Malappuram': [11.0500, 76.0833],
    'Kannur': [11.8667, 75.3667],
    'Kasaragod': [12.5000, 74.9833],
    'Kottayam': [9.5833, 76.5167],
    'Pathanamthitta': [9.2667, 76.7833],
    'Idukki': [9.8500, 76.9667],
    'Wayanad': [11.6833, 76.1333],
    'Manjeri': [11.1167, 76.1167],
    'Thalassery': [11.7500, 75.4833],
    'Ponnani': [10.7667, 75.9167],
    'Payyannur': [12.1000, 75.2000],
    'Nedumangad': [8.6000, 77.0000],
    'Koyilandy': [11.4333, 75.7000],

    // MADHYA PRADESH
    'Bhopal': [23.2599, 77.4126],
    'Indore': [22.7196, 75.8577],
    'Gwalior': [26.2183, 78.1828],
    'Jabalpur': [23.1815, 79.9864],
    'Ujjain': [23.1833, 75.7667],
    'Sagar': [23.8333, 78.7167],
    'Dewas': [22.9667, 76.0667],
    'Satna': [24.5833, 80.8333],
    'Ratlam': [23.3333, 75.0333],
    'Rewa': [24.5333, 81.3000],
    'Murwara': [23.8500, 80.4000],
    'Singrauli': [24.2000, 82.6667],
    'Burhanpur': [21.3000, 76.2333],
    'Khandwa': [21.8167, 76.3500],
    'Chhindwara': [22.0667, 78.9500],
    'Morena': [26.5000, 78.0000],
    'Bhind': [26.5667, 78.7833],
    'Guna': [24.6500, 77.3167],
    'Shivpuri': [25.4333, 77.6500],
    'Vidisha': [23.5333, 77.8167],

    // MAHARASHTRA
    'Mumbai': [19.0760, 72.8777],
    'Pune': [18.5204, 73.8567],
    'Nagpur': [21.1458, 79.0882],
    'Thane': [19.2183, 72.9781],
    'Nashik': [19.9975, 73.7898],
    'Aurangabad': [19.8762, 75.3433],
    'Solapur': [17.6599, 75.9064],
    'Amravati': [20.9374, 77.7796],
    'Kolhapur': [16.7050, 74.2433],
    'Nanded': [19.1383, 77.3210],
    'Sangli': [16.8524, 74.5815],
    'Malegaon': [20.5597, 74.5255],
    'Ulhasnagar': [19.2215, 73.1645],
    'Jalgaon': [21.0077, 75.5626],
    'Latur': [18.4088, 76.5604],
    'Parbhani': [19.2613, 76.7784],
    'Ichalkaranji': [16.7008, 74.4609],
    'Jalna': [19.8410, 75.8864],
    'Bhusawal': [21.0436, 75.7851],
    'Panvel': [18.9881, 73.1103],
    'Satara': [17.6805, 73.9889],
    'Beed': [18.9894, 75.7564],
    'Yavatmal': [20.3932, 78.1320],
    'Kamptee': [21.2333, 79.2000],
    'Achalpur': [21.2572, 77.5086],
    'Osmanabad': [18.1667, 76.0500],
    'Nandurbar': [21.3667, 74.2500],
    'Wardha': [20.7500, 78.6167],
    'Udgir': [18.3833, 77.1167],
    'Amalner': [21.0500, 75.0667],
    'Akola': [20.7000, 77.0000],
    'Dhule': [20.9000, 74.7833],

    // MANIPUR
    'Imphal': [24.8167, 93.9500],
    'Thoubal': [24.6333, 94.0167],
    'Bishnupur': [24.6333, 93.7667],
    'Churachandpur': [24.3333, 93.6833],
    'Ukhrul': [25.1167, 94.3667],
    'Kakching': [24.4833, 93.9833],
    'Lilong': [24.7000, 93.9000],
    'Mayang Imphal': [24.6167, 93.8833],
    'Moirang': [24.5000, 93.7667],
    'Nambol': [24.7500, 93.8500],

    // MEGHALAYA
    'Shillong': [25.5744, 91.8789],
    'Tura': [25.5167, 90.2167],
    'Nongstoin': [25.5167, 91.2667],
    'Jowai': [25.4500, 92.2000],
    'Williamnagar': [25.5000, 90.6167],
    'Baghmara': [25.2000, 90.6167],
    'Nongpoh': [25.9000, 91.8833],
    'Mairang': [25.5667, 91.6333],
    'Resubelpara': [25.9000, 90.6167],
    'Khliehriat': [25.3167, 92.3667],

    // MIZORAM
    'Aizawl': [23.7271, 92.7176],
    'Lunglei': [22.8833, 92.7333],
    'Saiha': [22.4833, 92.9833],
    'Champhai': [23.4667, 93.3167],
    'Kolasib': [24.2167, 92.6833],
    'Serchhip': [23.3167, 92.8500],
    'Lawngtlai': [22.5333, 92.9000],
    'Mamit': [23.9333, 92.4833],
    'Khawzawl': [23.3167, 93.1167],
    'Saitual': [23.7167, 92.9667],

    // NAGALAND
    'Kohima': [25.6667, 94.1167],
    'Dimapur': [25.9000, 93.7333],
    'Mokokchung': [26.3333, 94.5167],
    'Tuensang': [26.2833, 94.8167],
    'Wokha': [26.1000, 94.2667],
    'Zunheboto': [26.0167, 94.5167],
    'Phek': [25.6667, 94.4667],
    'Mon': [26.7500, 95.1000],
    'Longleng': [26.5333, 94.9000],
    'Kiphire': [25.9000, 94.8167],

    // ODISHA
    'Bhubaneswar': [20.2961, 85.8245],
    'Cuttack': [20.4667, 85.8833],
    'Rourkela': [22.2500, 84.8833],
    'Berhampur': [19.3167, 84.7833],
    'Sambalpur': [21.4667, 83.9667],
    'Puri': [19.8000, 85.8500],
    'Balasore': [21.5000, 86.9333],
    'Bhadrak': [21.0667, 86.5000],
    'Baripada': [21.9333, 86.7167],
    'Baleshwar': [21.5000, 86.9333],
    'Jharsuguda': [21.8500, 84.0333],
    'Bargarh': [21.3333, 83.6167],
    'Paradip': [20.3167, 86.6167],
    'Bhawanipatna': [19.9000, 83.1667],
    'Dhenkanal': [20.6667, 85.6000],
    'Barbil': [22.1167, 85.4000],
    'Kendujhar': [21.6333, 85.6000],
    'Sunabeda': [18.7000, 82.8667],
    'Talcher': [20.9500, 85.2167],
    'Gopalpur': [19.2667, 84.9167],

    // PUNJAB
    'Ludhiana': [30.9010, 75.8573],
    'Amritsar': [31.6340, 74.8723],
    'Jalandhar': [31.3256, 75.5792],
    'Patiala': [30.3167, 76.4000],
    'Bathinda': [30.2083, 74.9500],
    'Mohali': [30.7046, 76.7179],
    'Firozpur': [30.9167, 74.6000],
    'Batala': [31.8167, 75.2000],
    'Pathankot': [32.2667, 75.6500],
    'Moga': [30.8167, 75.1667],
    'Abohar': [30.1333, 74.2000],
    'Malerkotla': [30.5167, 75.8833],
    'Khanna': [30.7000, 76.2167],
    'Phagwara': [31.2167, 75.7667],
    'Muktsar': [30.4833, 74.5167],
    'Barnala': [30.3833, 75.5500],
    'Rajpura': [30.4833, 76.6000],
    'Sangrur': [30.2500, 75.8333],
    'Fazilka': [30.4000, 74.0167],
    'Kapurthala': [31.3833, 75.3833],

    // RAJASTHAN
    'Jaipur': [26.9124, 75.7873],
    'Jodhpur': [26.2389, 73.0243],
    'Kota': [25.2138, 75.8648],
    'Bikaner': [28.0167, 73.3167],
    'Ajmer': [26.4499, 74.6399],
    'Udaipur': [24.5854, 73.7125],
    'Bhilwara': [25.3500, 74.6333],
    'Alwar': [27.5667, 76.6000],
    'Bharatpur': [27.2167, 77.4833],
    'Sikar': [27.6167, 75.1500],
    'Pali': [25.7667, 73.3333],
    'Sri Ganganagar': [29.9167, 73.8833],
    'Kishangarh': [26.5833, 74.8667],
    'Beawar': [26.1000, 74.3167],
    'Hanumangarh': [29.5833, 74.3167],
    'Dungarpur': [23.8333, 73.7167],
    'Banswara': [23.5500, 74.4500],
    'Chittorgarh': [24.8833, 74.6333],
    'Baran': [25.1000, 76.5167],
    'Bundi': [25.4333, 75.6333],

    // SIKKIM
    'Gangtok': [27.3389, 88.6065],
    'Namchi': [27.1667, 88.3500],
    'Mangan': [27.5167, 88.5333],
    'Rangpo': [27.1833, 88.5333],
    'Jorethang': [27.1167, 88.2667],
    'Singtam': [27.2333, 88.4833],
    'Gyalshing': [27.2833, 88.2667],
    'Pakyong': [27.2500, 88.5833],
    'Ravangla': [27.3167, 88.3500],
    'Lachen': [27.7167, 88.5333],

    // TAMIL NADU
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Salem': [11.6643, 78.1460],
    'Tirunelveli': [8.7139, 77.7567],
    'Tiruppur': [11.1085, 77.3411],
    'Erode': [11.3428, 77.7274],
    'Vellore': [12.9202, 79.1500],
    'Thoothukkudi': [8.7833, 78.1333],
    'Dindigul': [10.3500, 77.9500],
    'Thanjavur': [10.7833, 79.1333],
    'Ranipet': [12.9333, 79.3167],
    'Sivakasi': [9.4500, 77.8167],
    'Karur': [10.9500, 78.0833],
    'Udhagamandalam': [11.4086, 76.6939],
    'Hosur': [12.7167, 77.8167],
    'Nagercoil': [8.1833, 77.4333],
    'Kanchipuram': [12.8333, 79.7000],
    'Cuddalore': [11.7500, 79.7500],

    // TELANGANA
    'Hyderabad': [17.3850, 78.4867],
    'Warangal': [17.9689, 79.5941],
    'Nizamabad': [18.6667, 78.1167],
    'Khammam': [17.2500, 80.1500],
    'Karimnagar': [18.4333, 79.1500],
    'Ramagundam': [18.8000, 79.4500],
    'Mahbubnagar': [16.7333, 78.0000],
    'Nalgonda': [17.0500, 79.2667],
    'Adilabad': [19.6667, 78.5333],
    'Suryapet': [17.1333, 79.6167],
    'Miryalaguda': [16.8667, 79.5667],
    'Siddipet': [18.1000, 78.8500],
    'Jagtial': [18.8000, 78.9167],
    'Mancherial': [18.8667, 79.4333],
    'Bodhan': [18.6667, 77.9000],
    'Koratla': [18.8167, 78.7167],
    'Mahabubabad': [17.6000, 80.0167],
    'Sangareddy': [17.6167, 78.0833],
    'Vikarabad': [17.3333, 77.9000],
    'Medak': [18.0333, 78.2667],

    // TRIPURA
    'Agartala': [23.8315, 91.2862],
    'Dharmanagar': [24.3667, 92.1667],
    'Udaipur Tripura': [23.5333, 91.4833],
    'Ambassa': [23.9333, 91.8500],
    'Kailashahar': [24.3333, 92.0000],
    'Belonia': [23.2500, 91.4500],
    'Khowai': [24.0667, 91.6000],
    'Teliamura': [23.8167, 91.6167],
    'Sabroom': [23.0000, 91.7167],
    'Kamalpur': [24.2000, 91.8333],

    // UTTAR PRADESH
    'Lucknow': [26.8467, 80.9462],
    'Kanpur': [26.4499, 80.3319],
    'Ghaziabad': [28.6692, 77.4538],
    'Agra': [27.1767, 78.0081],
    'Meerut': [28.9845, 77.7064],
    'Varanasi': [25.3176, 82.9739],
    'Allahabad': [25.4358, 81.8464],
    'Bareilly': [28.3667, 79.4167],
    'Aligarh': [27.8833, 78.0833],
    'Moradabad': [28.8333, 78.7833],
    'Saharanpur': [29.9667, 77.5500],
    'Gorakhpur': [26.7500, 83.3667],
    'Firozabad': [27.1500, 78.4000],
    'Jhansi': [25.4333, 78.5833],
    'Muzaffarnagar': [29.4667, 77.7000],
    'Mathura': [27.5000, 77.6833],
    'Shahjahanpur': [27.8833, 79.9167],
    'Rampur UP': [28.8000, 79.0167],
    'Modinagar': [28.8333, 77.7500],
    'Hapur': [28.7167, 77.7833],

    // UTTARAKHAND
    'Dehradun': [30.3165, 78.0322],
    'Haridwar': [29.9500, 78.1667],
    'Roorkee': [29.8667, 77.8833],
    'Kashipur': [29.2167, 78.9500],
    'Rudrapur': [28.9833, 79.4000],
    'Rishikesh': [30.1167, 78.3167],
    'Haldwani': [29.2167, 79.5167],
    'Ramnagar': [29.4000, 79.1167],
    'Pithoragarh': [29.5833, 80.2167],
    'Almora': [29.6167, 79.6667],
    'Nainital': [29.3833, 79.4500],
    'Mussoorie': [30.4500, 78.0667],
    'Kotdwara': [29.7500, 78.5333],
    'Srinagar UK': [30.2167, 78.7833],
    'Tanakpur': [29.0833, 80.1167],
    'Bageshwar': [29.8500, 79.7667],
    'Champawat': [29.3333, 80.0833],
    'Khatima': [28.9167, 79.9667],
    'Lalkuan': [29.0667, 79.5000],
    'Sitarganj': [28.9333, 79.7000],

    // WEST BENGAL
    'Kolkata': [22.5726, 88.3639],
    'Howrah': [22.5958, 88.2636],
    'Durgapur': [23.5500, 87.3167],
    'Asansol': [23.6833, 86.9833],
    'Siliguri': [26.7167, 88.4167],
    'Malda': [25.0167, 88.1333],
    'Baharampur': [24.1000, 88.2500],
    'Habra': [22.8333, 88.6333],
    'Kharagpur': [22.3167, 87.3167],
    'Shantipur': [23.2500, 88.4333],
    'Dankuni': [22.6833, 88.3000],
    'Dhulian': [24.6833, 87.9667],
    'Ranaghat': [23.1833, 88.5833],
    'Haldia': [22.0333, 88.0667],
    'Raiganj': [25.6167, 88.1167],
    'Krishnanagar': [23.4000, 88.5000],
    'Nabadwip': [23.4000, 88.3667],
    'Medinipur': [22.4333, 87.3167],
    'Jalpaiguri': [26.5167, 88.7333],
    'Balurghat': [25.2167, 88.7667],

    // UNION TERRITORIES
    // Andaman and Nicobar Islands
    'Port Blair': [11.6667, 92.7500],
    'Diglipur': [13.2667, 93.0000],
    'Mayabunder': [12.9333, 92.9333],
    'Rangat': [12.5000, 92.9167],
    'Car Nicobar': [9.1667, 92.7500],

    // Chandigarh
    'Chandigarh': [30.7333, 76.7794],

    // Dadra and Nagar Haveli and Daman and Diu
    'Daman': [20.4167, 72.8500],
    'Diu': [20.7167, 70.9833],
    'Silvassa': [20.2667, 73.0167],

    // Delhi
    'New Delhi': [28.6139, 77.2090],
    'Delhi': [28.7041, 77.1025],

    // Jammu and Kashmir
    'Srinagar': [34.0837, 74.7973],
    'Jammu': [32.7333, 74.8667],
    'Anantnag': [33.7333, 75.1500],
    'Baramulla': [34.2000, 74.3500],
    'Sopore': [34.3000, 74.4667],
    'Kathua': [32.3833, 75.5167],
    'Udhampur': [32.9167, 75.1333],
    'Punch': [33.7667, 74.0833],
    'Rajauri': [33.3833, 74.3000],
    'Kishtwar': [33.3167, 75.7667],

    // Ladakh
    'Leh': [34.1642, 77.5841],
    'Kargil': [34.5500, 76.1167],

    // Lakshadweep
    'Kavaratti': [10.5667, 72.6333],
    'Agatti': [10.8333, 72.1833],
    'Amini': [11.1167, 72.7167],
    'Andrott': [10.8167, 73.6667],
    'Kadmat': [11.2333, 72.7833],

    // Puducherry
    'Puducherry': [11.9167, 79.8167],
    'Karaikal': [10.9167, 79.8333],
    'Mahe': [11.7000, 75.5333],
    'Yanam': [16.7333, 82.2167]
  };

  searchLocation(query: string, type: 'source' | 'destination'): void {
    if (!query || query.length < 2) {
      if (type === 'source') {
        this.sourceSuggestions.set([]);
        this.showSourceSuggestions.set(false);
      } else {
        this.destinationSuggestions.set([]);
        this.showDestinationSuggestions.set(false);
      }
      return;
    }

    const suggestions = Object.keys(this.indianCities)
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    if (type === 'source') {
      this.sourceSuggestions.set(suggestions);
      this.showSourceSuggestions.set(suggestions.length > 0);
    } else {
      this.destinationSuggestions.set(suggestions);
      this.showDestinationSuggestions.set(suggestions.length > 0);
    }
  }

  selectSuggestion(suggestion: string, type: 'source' | 'destination'): void {
    if (type === 'source') {
      this.routeData.source = suggestion;
      this.sourceCoordinates = this.indianCities[suggestion] as L.LatLngTuple;
      this.showSourceSuggestions.set(false);
    } else {
      this.routeData.destination = suggestion;
      this.destinationCoordinates = this.indianCities[suggestion] as L.LatLngTuple;
      this.showDestinationSuggestions.set(false);
    }
  }

  onCitySelect(city: string, type: 'source' | 'destination'): void {
    if (type === 'source') {
      // Prevent selecting same city as destination
      if (city && city === this.routeData.destination) {
        alert('Source and destination cannot be the same. Please select a different city.');
        this.routeData.source = '';
        return;
      }
      this.routeData.source = city;
      this.sourceCoordinates = city ? (this.indianCities[city] as L.LatLngTuple) : null;
      this.showSourceSuggestions.set(false);
    } else {
      // Prevent selecting same city as source
      if (city && city === this.routeData.source) {
        alert('Source and destination cannot be the same. Please select a different city.');
        this.routeData.destination = '';
        return;
      }
      this.routeData.destination = city;
      this.destinationCoordinates = city ? (this.indianCities[city] as L.LatLngTuple) : null;
      this.showDestinationSuggestions.set(false);
    }
  }

  // Route planning methods
  planRoute(): void {
    if (!this.routeData.source || !this.routeData.destination) {
      alert('Please enter both source and destination locations.');
      return;
    }
    
    // Validate that source and destination are different
    if (this.routeData.source === this.routeData.destination) {
      alert('Source and destination cannot be the same. Please select different cities.');
      return;
    }

    console.log('Planning route from:', this.routeData.source, 'to:', this.routeData.destination);

    // Open vehicle selection modal
    this.openVehicleModal();
  }

  openVehicleModal(): void {
    this.showVehicleModal = true;
    this.isLoadingVehicles.set(true);
    this.selectedVehicle = null;
    this.scrollToTop();
    this.preventBodyScroll(true);
    
    // Fetch vehicle details from API
    this.dashboardService.getVehicleDetails().subscribe({
      next: (response: any) => {
        console.log('Vehicle details received:', response);
        // Handle different response formats
        if (response.details && Array.isArray(response.details)) {
          this.vehicles = response.details;
        } else if (Array.isArray(response)) {
          this.vehicles = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.vehicles = response.data;
        } else if (response.vehicles && Array.isArray(response.vehicles)) {
          this.vehicles = response.vehicles;
        } else {
          this.vehicles = [];
        }
        this.isLoadingVehicles.set(false);
      },
      error: (error) => {
        console.error('Error fetching vehicle details:', error);
        alert('Failed to load vehicle details. Please try again.');
        this.isLoadingVehicles.set(false);
        this.closeVehicleModal();
      }
    });
  }

  closeVehicleModal(): void {
    this.showVehicleModal = false;
    this.selectedVehicle = null;
    this.vehicles = [];
    this.preventBodyScroll(false);
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicle = vehicle;
  }

  confirmVehicleSelection(): void {
    if (!this.selectedVehicle) {
      alert('Please select a vehicle type.');
      return;
    }

    console.log('Selected vehicle type:', this.selectedVehicle);
    
    // Store selected vehicle type and open car selection modal
    this.selectedVehicleType = this.selectedVehicle;
    this.closeVehicleModal();
    this.openCarModal();
  }

  openCarModal(): void {
    this.showCarModal = true;
    this.isLoadingCars.set(true);
    this.selectedCar = null;
    this.scrollToTop();
    this.preventBodyScroll(true);
    
    // Get vehicle type ID from selected vehicle
    // Try different possible field names
    const vehicleTypeId = this.selectedVehicleType?.id || 
                         this.selectedVehicleType?.vehicalTypeId || 
                         this.selectedVehicleType?.vehicleTypeId ||
                         this.selectedVehicleType?.vehicle_type_id ||
                         this.selectedVehicleType?.typeId;
    
    console.log('Selected vehicle type object:', this.selectedVehicleType);
    console.log('Extracted vehicle type ID:', vehicleTypeId);
    
    if (!vehicleTypeId) {
      console.error('Vehicle type ID not found. Available fields:', Object.keys(this.selectedVehicleType || {}));
      alert('Unable to fetch cars. Vehicle type ID is missing.');
      this.isLoadingCars.set(false);
      this.closeCarModal();
      return;
    }
    
    console.log('Fetching cars for vehicle type ID:', vehicleTypeId);
    
    // Fetch car details from API
    this.dashboardService.getCarDetailsByType(vehicleTypeId).subscribe({
      next: (response: any) => {
        console.log('Car details received:', response);
        // Handle different response formats
        if (response.details && Array.isArray(response.details)) {
          this.cars = response.details;
        } else if (Array.isArray(response)) {
          this.cars = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.cars = response.data;
        } else {
          this.cars = [];
        }
        this.isLoadingCars.set(false);
      },
      error: (error) => {
        console.error('Error fetching car details:', error);
        alert('Failed to load car details. Please try again.');
        this.isLoadingCars.set(false);
        this.closeCarModal();
      }
    });
  }

  closeCarModal(): void {
    this.showCarModal = false;
    this.selectedCar = null;
    this.cars = [];
    this.preventBodyScroll(false);
  }

  goBackToVehicleSelection(): void {
    // Close car modal and open vehicle type selection modal
    this.closeCarModal();
    // Reset selected car but keep the selected vehicle type
    this.selectedCar = null;
    // Open vehicle modal again
    this.openVehicleModal();
  }

  selectCar(car: any): void {
    this.selectedCar = car;
  }

  confirmCarSelection(): void {
    if (!this.selectedCar) {
      alert('Please select a car.');
      return;
    }

    console.log('Selected car:', this.selectedCar);
    console.log('Selected vehicle type:', this.selectedVehicleType);
    console.log('Route data:', this.routeData);
    
    // Close car modal (but keep selectedCar and selectedVehicleType)
    this.showCarModal = false;
    this.cars = []; // Clear the cars list but keep selectedCar
    
    // Calculate distance and duration immediately if not already set
    if (!this.routeInfo() && this.sourceCoordinates && this.destinationCoordinates) {
      const distance = this.calculateDistance(this.sourceCoordinates, this.destinationCoordinates);
      const duration = this.calculateDuration(distance);
      this.routeInfo.set({ distance, duration });
    } else if (!this.routeInfo() && this.routeData.source && this.routeData.destination) {
      // Try to get coordinates from cities database
      const sourceCoords = this.indianCities[this.routeData.source];
      const destCoords = this.indianCities[this.routeData.destination];
      if (sourceCoords && destCoords && Array.isArray(sourceCoords) && Array.isArray(destCoords)) {
        const distance = this.calculateDistance(sourceCoords as L.LatLngTuple, destCoords as L.LatLngTuple);
        const duration = this.calculateDuration(distance);
        this.routeInfo.set({ distance, duration });
        this.sourceCoordinates = sourceCoords as L.LatLngTuple;
        this.destinationCoordinates = destCoords as L.LatLngTuple;
      }
    }
    
    // Scroll to route planner section to show booking details after modal closes
    setTimeout(() => {
      this.scrollToPlanner();
    }, 300);
    
    // Calculate and display route on map (this happens in background)
    setTimeout(() => {
      // Get coordinates for the locations
      let sourceCoords = this.sourceCoordinates;
      let destCoords = this.destinationCoordinates;

      // If coordinates are not set, try to find them in the cities database
      if (!sourceCoords) {
        const coords = this.indianCities[this.routeData.source];
        if (coords && Array.isArray(coords) && coords.length === 2) {
          sourceCoords = coords as L.LatLngTuple;
          console.log('Source coordinates from database:', sourceCoords);
        }
      }

      if (!destCoords) {
        const coords = this.indianCities[this.routeData.destination];
        if (coords && Array.isArray(coords) && coords.length === 2) {
          destCoords = coords as L.LatLngTuple;
          console.log('Destination coordinates from database:', destCoords);
        }
      }

      if (!sourceCoords || !destCoords) {
        console.error('Coordinates not found for:', { 
          source: this.routeData.source, 
          destination: this.routeData.destination,
          sourceCoords,
          destCoords
        });
        alert('Location not found. Please select from suggestions or check the city name.');
        return;
      }

      // Ensure coordinates are in correct format [lat, lng]
      if (!Array.isArray(sourceCoords) || sourceCoords.length !== 2) {
        console.error('Invalid source coordinates format:', sourceCoords);
        alert('Invalid source coordinates. Please try again.');
        return;
      }

      if (!Array.isArray(destCoords) || destCoords.length !== 2) {
        console.error('Invalid destination coordinates format:', destCoords);
        alert('Invalid destination coordinates. Please try again.');
        return;
      }

      console.log('Using coordinates:', { sourceCoords, destCoords });
      console.log('Map initialized?', !!this.map);

      this.isLoadingRoute.set(true);
      
      // Ensure map is initialized
      if (!this.map) {
        console.warn('Map not initialized, initializing now...');
        this.initMap();
      }
      
      // Scroll to map section first
      this.scrollToMap();
      
      // Wait for map to be ready, then display route
      const checkMapReady = () => {
        if (this.map) {
          console.log('Map is ready, displaying route...');
          this.map.invalidateSize();
          setTimeout(() => {
            this.displayRoute(sourceCoords as L.LatLngTuple, destCoords as L.LatLngTuple);
            this.isLoadingRoute.set(false);
          }, 500);
        } else {
          console.warn('Map still not ready, retrying...');
          setTimeout(checkMapReady, 500);
        }
      };
      
      setTimeout(checkMapReady, 500);
    }, 300);
  }

  private fetchRouteFromOSRM(
    sourceCoords: L.LatLngTuple, 
    destCoords: L.LatLngTuple,
    sourceMarker: L.Marker,
    destMarker: L.Marker
  ): void {
    // OSRM API endpoint (using public demo server)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sourceCoords[1]},${sourceCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson&steps=false`;
    
    console.log('Fetching route from:', osrmUrl);
    
    fetch(osrmUrl)
      .then(response => response.json())
      .then((data: any) => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeGeometry = route.geometry.coordinates;
          
          // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
          const routeCoordinates = routeGeometry.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngTuple);
          
          // Display route on map
          const routeLine = L.polyline(routeCoordinates, {
            color: '#4f46e5',
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1
          }).addTo(this.routeLayer!);
          
          console.log('✅ Route line added from OSRM');
          
          // Calculate distance and duration from route
          let distanceInMeters = route.distance; // Distance in meters
          let durationInSeconds = route.duration; // Duration in seconds
          
          // Double distance and duration for round trip
          if (this.isRoundTrip) {
            distanceInMeters = distanceInMeters * 2;
            durationInSeconds = durationInSeconds * 2;
          }
          
          // Convert to readable format
          const distance = distanceInMeters < 1000 
            ? `${Math.round(distanceInMeters)} m` 
            : `${(distanceInMeters / 1000).toFixed(1)} km`;
          
          const hours = Math.floor(durationInSeconds / 3600);
          const minutes = Math.floor((durationInSeconds % 3600) / 60);
          const duration = hours > 0 
            ? `${hours}h ${minutes}min` 
            : `${minutes} min`;
          
          // Set route info
          this.routeInfo.set({
            distance: distance,
            duration: duration
          });
          
          console.log('✅ Route info set:', { distance, duration });
          
          // Fit map to show entire route
          const group = L.featureGroup([sourceMarker, destMarker, routeLine]);
          const bounds = group.getBounds();
          
          if (this.map) {
            this.map.fitBounds(bounds.pad(0.2), {
              maxZoom: 15,
              animate: true
            });
            console.log('✅ Map bounds set to show route');
            
            // Open source popup
            setTimeout(() => {
              if (sourceMarker && this.map) {
                sourceMarker.openPopup();
              }
            }, 800);
            
            // Invalidate size again after fitting bounds
            setTimeout(() => {
              if (this.map) {
                this.map.invalidateSize();
                console.log('✅ Map size invalidated after bounds fit');
              }
            }, 1000);
          }
          
          console.log('✅✅✅ ROUTE DISPLAYED SUCCESSFULLY FROM OSRM ✅✅✅');
        } else {
          console.error('OSRM route error:', data);
          // Fallback to straight line if routing fails
          this.displayFallbackRoute(sourceCoords, destCoords, sourceMarker, destMarker);
        }
      })
      .catch((error) => {
        console.error('Error fetching route from OSRM:', error);
        // Fallback to straight line if API call fails
        this.displayFallbackRoute(sourceCoords, destCoords, sourceMarker, destMarker);
      });
  }

  private displayFallbackRoute(
    sourceCoords: L.LatLngTuple,
    destCoords: L.LatLngTuple,
    sourceMarker: L.Marker,
    destMarker: L.Marker
  ): void {
    console.log('Using fallback straight line route');
    
    // Add route line (straight line fallback)
    const routeLine = L.polyline(
      [[sourceCoords[0], sourceCoords[1]], [destCoords[0], destCoords[1]]], 
      {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.9,
        dashArray: '10, 10'
      }
    ).addTo(this.routeLayer!);
    
    // Fit map to show both markers
    const group = L.featureGroup([sourceMarker, destMarker, routeLine]);
    const bounds = group.getBounds();
    
    if (this.map) {
      this.map.fitBounds(bounds.pad(0.2), {
        maxZoom: 15,
        animate: true
      });
    }
    
    // Calculate distance and duration (straight line)
    const distance = this.calculateDistance(sourceCoords, destCoords);
    const duration = this.calculateDuration(distance);
    
    // Set route info
    this.routeInfo.set({
      distance: distance,
      duration: duration
    });
  }

  private displayRoute(sourceCoords: L.LatLngTuple, destCoords: L.LatLngTuple): void {
    console.log('=== DISPLAY ROUTE CALLED ===');
    console.log('Source coordinates:', sourceCoords);
    console.log('Destination coordinates:', destCoords);
    console.log('Map available:', !!this.map);
    
    if (!this.map) {
      console.error('❌ Map not initialized! Cannot display route.');
      alert('Map is not ready. Please wait a moment and try again.');
      return;
    }

    // Validate coordinates
    if (!Array.isArray(sourceCoords) || sourceCoords.length !== 2 || 
        !Array.isArray(destCoords) || destCoords.length !== 2) {
      console.error('❌ Invalid coordinates format:', { sourceCoords, destCoords });
      alert('Invalid coordinates. Please select valid locations.');
      return;
    }

    console.log('✅ Map is available, clearing existing route...');

    // Clear existing route and test marker
    this.clearRouteFromMap();

    // Invalidate map size immediately
    this.map.invalidateSize();

    // Small delay to ensure map is ready
    setTimeout(() => {
      if (!this.map) {
        console.error('❌ Map became unavailable');
        return;
      }

      try {
        console.log('Creating route layer...');
        // Create route layer
        this.routeLayer = L.layerGroup().addTo(this.map);
        console.log('✅ Route layer created');

        // Add source marker
        console.log('Adding source marker at:', sourceCoords);
        const sourceMarker = L.marker([sourceCoords[0], sourceCoords[1]]).addTo(this.routeLayer);
        sourceMarker.bindPopup(`
          <div class="marker-popup">
            <strong>Source</strong><br>
            ${this.routeData.source}
          </div>
        `);
        console.log('✅ Source marker added');

        // Add destination marker
        console.log('Adding destination marker at:', destCoords);
        const destMarker = L.marker([destCoords[0], destCoords[1]]).addTo(this.routeLayer);
        destMarker.bindPopup(`
          <div class="marker-popup">
            <strong>Destination</strong><br>
            ${this.routeData.destination}
          </div>
        `);
        console.log('✅ Destination marker added');

        // Fetch actual route from OSRM routing service
        console.log('Fetching route from OSRM...');
        this.fetchRouteFromOSRM(sourceCoords, destCoords, sourceMarker, destMarker);
        
        // Scroll to booking details section after route is calculated
        if (this.selectedCar && this.selectedVehicleType) {
          setTimeout(() => {
            this.scrollToPlanner();
          }, 500);
        }
        
      } catch (error) {
        console.error('❌❌❌ ERROR displaying route:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        alert('Error displaying route on map: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }, 200);
  }

  scrollToMap(): void {
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  private calculateDistance(coord1: L.LatLngTuple, coord2: L.LatLngTuple): string {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coord2[0] - coord1[0]);
    const dLon = this.toRad(coord2[1] - coord1[1]);
    const lat1 = this.toRad(coord1[0]);
    const lat2 = this.toRad(coord2[0]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${Math.round(distance)} km`;
    }
  }

  private calculateDuration(distanceStr: string): string {
    const distance = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
    const unit = distanceStr.includes('km') ? 'km' : 'm';
    const distanceInKm = unit === 'km' ? distance : distance / 1000;
    
    // Assume average speed of 60 km/h for road travel
    const hours = distanceInKm / 60;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private addFallbackTileLayer(): void {
    if (!this.map) return;
    
    try {
      console.log('Adding fallback tile layer...');
      // Try CartoDB as fallback
      const fallbackLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(this.map);
      
      fallbackLayer.on('load', () => {
        console.log('Fallback tile layer loaded successfully');
        const mapElement = document.getElementById('map');
        if (mapElement) {
          mapElement.classList.add('loaded');
        }
      });
    } catch (error) {
      console.error('Error adding fallback tile layer:', error);
    }
  }

  swapLocations(): void {
    const temp = this.routeData.source;
    this.routeData.source = this.routeData.destination;
    this.routeData.destination = temp;
    this.sourceCoordinates = this.routeData.source
      ? (this.indianCities[this.routeData.source] as L.LatLngTuple)
      : null;
    this.destinationCoordinates = this.routeData.destination
      ? (this.indianCities[this.routeData.destination] as L.LatLngTuple)
      : null;
  }

  clearRoute(): void {
    this.routeData.source = '';
    this.routeData.destination = '';
    this.isRoundTrip = false;
    this.sourceCoordinates = null;
    this.destinationCoordinates = null;
    this.sourceSuggestions.set([]);
    this.destinationSuggestions.set([]);
    this.showSourceSuggestions.set(false);
    this.showDestinationSuggestions.set(false);
    this.clearRouteFromMap();
    this.routeInfo.set(null);
  }

  private clearRouteFromMap(): void {
    if (this.routeLayer && this.map) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }
    // Remove test marker if it exists
    if (this.testMarker && this.map) {
      this.map.removeLayer(this.testMarker);
      this.testMarker = undefined;
    }
  }

  scrollToPlanner(): void {
    const plannerSection = document.getElementById('route-planner');
    if (plannerSection) {
      try {
        plannerSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } catch (error) {
        console.warn('Smooth scrolling to planner failed, using instant scroll:', error);
        plannerSection.scrollIntoView();
      }
    }
  }

  scrollToHistory(): void {
    console.log('scrollToHistory method called');
    
    // Try multiple approaches to find the element
    let historySection = document.getElementById('history-section');
    
    if (!historySection) {
      // Fallback: try to find by class name
      historySection = document.querySelector('.history-section') as HTMLElement;
    }
    
    console.log('History section element:', historySection);
    
    if (historySection) {
      console.log('Scrolling to history section...');
      
      // Try smooth scrolling first
      try {
        historySection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } catch (error) {
        console.warn('Smooth scrolling failed, trying instant scroll:', error);
        // Fallback to instant scroll
        historySection.scrollIntoView();
      }
    } else {
      console.error('History section element not found!');
      // Try scrolling to the bottom of the page as a last resort
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }


  saveProfile(): void {  
    alert('Save profile clicked');
    // TODO: Implement save profile functionality
    // This could save the profile data to the database
  }

  confirmBooking(): void {
    if (!this.selectedCar || !this.selectedVehicleType || !this.routeData.source || !this.routeData.destination) {
      alert('Please complete all booking details.');
      return;
    }

    // Get vehicle type ID
    const vehicleTypeId = this.selectedVehicleType?.id || 
                         this.selectedVehicleType?.vehicalTypeId || 
                         this.selectedVehicleType?.vehicleTypeId ||
                         this.selectedVehicleType?.vehicle_type_id ||
                         this.selectedVehicleType?.typeId;

    if (!vehicleTypeId) {
      alert('Vehicle type ID is missing. Please try again.');
      return;
    }

    console.log('Fetching driver details for vehicle type ID:', vehicleTypeId);
    this.isLoadingDriver.set(true);
    this.driverDetails = null;

    // First, call getDriver API with vehicle type ID to fetch driver details
    this.dashboardService.getDriver(vehicleTypeId).subscribe({
      next: (driverResponse: any) => {
        console.log('Driver details response:', driverResponse);
        
        // Handle different response structures
        const driverData = driverResponse?.data || driverResponse;
        
        // Check if response contains an error message
        if (driverData?.message && !driverData?.firstName && !driverData?.lastName) {
          console.error('Driver API returned error message:', driverData.message);
          this.isLoadingDriver.set(false);
          this.showErrorModalWithMessage(driverData.message);
          return;
        }
        
        // Validate that we have at least basic driver information (firstName or lastName)
        if (!driverData || (!driverData.firstName && !driverData.lastName)) {
          console.error('Invalid driver response:', driverResponse);
          const errorMsg = driverData?.message || driverResponse?.message || 'Failed to fetch driver details. Please try again.';
          this.isLoadingDriver.set(false);
          this.showErrorModalWithMessage(errorMsg);
          return;
        }

        // Extract driver ID - check multiple possible field names
        const driverId = driverData.id !== undefined ? driverData.id :
                        driverData.driverId !== undefined ? driverData.driverId :
                        driverData.driver_id !== undefined ? driverData.driver_id :
                        driverData.ID !== undefined ? driverData.ID :
                        driverData.DriverId !== undefined ? driverData.DriverId :
                        null;
        
        console.log('Extracted driver ID:', driverId);
        console.log('Driver data object:', driverData);
        console.log('Driver ID type:', typeof driverId);
        
        // Store driver details
        this.driverDetails = {
          id: driverId,
          firstName: driverData.firstName || '',
          middleName: driverData.middleName || '',
          lastName: driverData.lastName || '',
          contactNumber: driverData.contactNumber || '',
          driverRating: driverData.driverRating || ''
        };

        console.log('Driver details stored:', this.driverDetails);
        console.log('Driver ID in stored details:', this.driverDetails.id);
        this.isLoadingDriver.set(false);

        // Now proceed with amount calculation
        this.calculateBookingAmount(vehicleTypeId);
      },
      error: (error) => {
        console.error('Error fetching driver details:', error);
        this.isLoadingDriver.set(false);
        
        // Extract error message from various possible locations in the error object
        const errorMessage = error?.error?.message || 
                           error?.error?.error || 
                           error?.error?.errorMessage ||
                           error?.message || 
                           error?.error ||
                           'Failed to fetch driver details. Please try again.';
        
        // Display the backend error message in modal
        this.showErrorModalWithMessage(errorMessage);
      }
    });
  }

  private calculateBookingAmount(vehicleTypeId: number): void {
    // Parse distance from string (e.g., "853.9 km" -> 853.9)
    const distanceStr = this.routeInfo()?.distance || '0 km';
    const distanceValue = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
    
    if (isNaN(distanceValue) || distanceValue <= 0) {
      alert('Invalid distance. Please plan the route again.');
      this.isLoadingAmount.set(false);
      return;
    }
    
    const distanceInKm = distanceStr.includes('km') ? distanceValue : distanceValue / 1000;
    
    if (!distanceInKm || distanceInKm <= 0 || isNaN(distanceInKm)) {
      alert('Invalid distance. Please plan the route again.');
      this.isLoadingAmount.set(false);
      return;
    }

    console.log('Calculating amount for:', { vehicleTypeId, distance: distanceInKm });

    this.isLoadingAmount.set(true);

    // Call calculateAmount API - send exact distance without rounding
    console.log('Calling calculateAmount API with:', { vehicleTypeId, distance: distanceInKm, isRoundTrip: this.isRoundTrip });
    
    this.dashboardService.calculateAmount(vehicleTypeId, distanceInKm, this.isRoundTrip).subscribe({
      next: (response: any) => {
        console.log('Amount calculated response (full):', JSON.stringify(response, null, 2));
        console.log('Amount calculated response (object):', response);
        
        // Handle different response structures (direct object or nested in data property)
        const responseData = response?.data || response;
        
        // Validate response structure
        if (!responseData || typeof responseData !== 'object') {
          console.error('Invalid response format:', response);
          alert('Invalid response from server. Please try again.');
          this.isLoadingAmount.set(false);
          return;
        }
        
        // Store amount info - preserve exact values from API as strings to avoid precision loss
        const preserveExactValue = (value: any): string => {
          if (value === null || value === undefined) return '0';
          // Convert to string to preserve exact decimal representation
          const strValue = String(value);
          // Remove any unnecessary trailing zeros after the decimal point, but keep the exact precision
          return strValue;
        };
        
        const amountData = {
          beforeGSTAmount: preserveExactValue(responseData.beforeGSTAmount),
          SGST: preserveExactValue(responseData.SGST),
          CGST: preserveExactValue(responseData.CGST),
          finalAmount: preserveExactValue(responseData.finalAmount)
        };
        
        console.log('Raw values from API:', {
          beforeGSTAmount: responseData.beforeGSTAmount,
          SGST: responseData.SGST,
          CGST: responseData.CGST,
          finalAmount: responseData.finalAmount
        });
        console.log('Stored amount data (as strings to preserve precision):', amountData);
        
        this.amountInfo.set(amountData);
        this.isLoadingAmount.set(false);

        // Show booking confirmation with amount details
        const bookingData = {
          source: this.routeData.source,
          destination: this.routeData.destination,
          vehicleType: this.selectedVehicleType?.vehicalType || this.selectedVehicleType?.vehicleType || this.selectedVehicleType?.type || this.selectedVehicleType?.name,
          vehicleTypeId: vehicleTypeId,
          carId: this.selectedCar?.id || this.selectedCar?.vehical_type_id,
          carName: this.selectedCar?.name || this.selectedCar?.carName || this.selectedCar?.vehicleName,
          distance: this.routeInfo()?.distance,
          duration: this.routeInfo()?.duration,
          model: this.selectedCar?.model,
          year: this.selectedCar?.year,
          amount: amountData
        };

        // Show amount modal instead of alert
        this.showAmountModal = true;
        this.scrollToTop();
        this.preventBodyScroll(true);
      },
      error: (error) => {
        console.error('Error calculating amount:', error);
        this.isLoadingAmount.set(false);
        const errorMessage = error?.error?.message || error?.message || 'Unknown error';
        alert(`Failed to calculate booking amount: ${errorMessage}\n\nPlease check:\n- Vehicle Type ID: ${vehicleTypeId}\n- Distance: ${distanceInKm} km\n\nPlease try again.`);
      }
    });
  }

  clearBooking(): void {
    this.selectedCar = null;
    this.selectedVehicleType = null;
    this.amountInfo.set(null);
    this.driverDetails = null;
    this.showAmountModal = false;
    this.isRoundTrip = false;
    this.selectedPaymentType = null;
    this.couponCode = '';
    this.discountedAmount = null;
    this.discountApplied = false;
    this.couponError = '';
    this.bookingDetails = null; // Clear booking details too
    this.showBookingPopup = false;
    this.isBookingPopupMinimized = false;
    this.clearRoute();
  }

  clearBookingForm(): void {
    // Clear form data but keep bookingDetails for popup
    this.selectedCar = null;
    this.selectedVehicleType = null;
    this.amountInfo.set(null);
    this.driverDetails = null;
    this.showAmountModal = false;
    this.isRoundTrip = false;
    this.selectedPaymentType = null;
    this.couponCode = '';
    this.discountedAmount = null;
    this.discountApplied = false;
    this.couponError = '';
    this.clearRoute();
    // Don't clear bookingDetails, showBookingPopup, or isBookingPopupMinimized
  }

  closeAmountModal(): void {
    this.showAmountModal = false;
    this.selectedPaymentType = null;
    this.couponCode = '';
    this.discountedAmount = null;
    this.discountApplied = false;
    this.couponError = '';
    this.preventBodyScroll(false);
  }

  applyCouponCode(): void {
    if (!this.couponCode || !this.couponCode.trim()) {
      this.couponError = 'Please enter a coupon code';
      return;
    }

    if (!this.amountInfo()) {
      this.couponError = 'Amount information is missing';
      return;
    }

    const finalAmount = parseFloat(String(this.amountInfo()!.finalAmount));
    if (isNaN(finalAmount) || finalAmount <= 0) {
      this.couponError = 'Invalid amount';
      return;
    }

    this.isLoadingCoupon.set(true);
    this.couponError = '';
    const amountString = finalAmount.toFixed(2);

    this.dashboardService.getDiscount(this.couponCode.trim().toUpperCase(), amountString).subscribe({
      next: (response: any) => {
        console.log('Discount response:', response);
        const discountedAmount = response?.['Final Amount'] || response?.finalAmount || response?.data?.['Final Amount'] || response?.data?.finalAmount;
        
        if (!discountedAmount || isNaN(parseFloat(String(discountedAmount)))) {
          this.couponError = 'Invalid response from server';
          this.isLoadingCoupon.set(false);
          return;
        }

        this.discountedAmount = parseFloat(String(discountedAmount));
        this.discountApplied = true;
        this.isLoadingCoupon.set(false);
        console.log('Coupon applied successfully. Discounted amount:', this.discountedAmount);
      },
      error: (error) => {
        console.error('Error applying coupon:', error);
        this.isLoadingCoupon.set(false);
        const errorMessage = error?.error?.message || error?.error?.error || error?.error?.errorMessage || error?.message || 'Invalid coupon code. Please try again.';
        this.couponError = errorMessage;
        this.discountedAmount = null;
        this.discountApplied = false;
      }
    });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.discountedAmount = null;
    this.discountApplied = false;
    this.couponError = '';
  }

  getFinalAmount(): number {
    if (this.discountApplied && this.discountedAmount !== null) {
      return this.discountedAmount;
    }
    if (this.amountInfo()) {
      return parseFloat(String(this.amountInfo()!.finalAmount));
    }
    return 0;
  }

  getDiscountAmount(): number {
    if (this.discountApplied && this.discountedAmount !== null && this.amountInfo()) {
      const originalAmount = parseFloat(String(this.amountInfo()!.finalAmount));
      return originalAmount - this.discountedAmount;
    }
    return 0;
  }

  showErrorModalWithMessage(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
    this.scrollToTop();
    this.preventBodyScroll(true);
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = '';
    this.preventBodyScroll(false);
  }

  showSuccessModalWithMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessModal = true;
    this.scrollToTop();
    this.preventBodyScroll(true);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
    this.preventBodyScroll(false);
  }

  showBookingDetailsPopup(bookingId: number, bookingResponse: any, savedBookingData?: any): void {
    // Use saved data if available, otherwise try to get from current state
    let route: string;
    let vehicleType: string;
    let carName: string;
    let distance: string;
    let duration: string;
    let amount: number;
    let paymentType: string;
    let driverName: string;
    let driverContact: string;

    if (savedBookingData) {
      // Use saved data
      route = savedBookingData.route || 'N/A';
      vehicleType = savedBookingData.vehicleType || 'N/A';
      carName = savedBookingData.carName || 'N/A';
      distance = savedBookingData.distance || 'N/A';
      duration = savedBookingData.duration || 'N/A';
      amount = savedBookingData.amount || 0;
      paymentType = savedBookingData.paymentType || 'Cash';
      driverName = savedBookingData.driverName || 'N/A';
      driverContact = savedBookingData.driverContact || 'N/A';
    } else {
      // Fallback to current state (may be cleared)
      route = this.getRouteDisplay();
      vehicleType = this.selectedVehicleType?.vehicalType || this.selectedVehicleType?.vehicleType || this.selectedVehicleType?.type || this.selectedVehicleType?.name || 'N/A';
      carName = this.selectedCar?.name || this.selectedCar?.carName || this.selectedCar?.vehicleName || 'N/A';
      distance = this.routeInfo()?.distance || 'N/A';
      duration = this.routeInfo()?.duration || 'N/A';
      amount = this.getFinalAmount();
      paymentType = this.selectedPaymentType === 'upi' ? 'UPI' : 'Cash';
      driverName = this.driverDetails ? 
        `${this.driverDetails.firstName} ${this.driverDetails.middleName || ''} ${this.driverDetails.lastName}`.trim() : 'N/A';
      driverContact = this.driverDetails?.contactNumber || 'N/A';
    }

    this.bookingDetails = {
      bookingId: bookingId,
      route: route,
      vehicleType: vehicleType,
      carName: carName,
      distance: distance,
      duration: duration,
      amount: amount,
      paymentType: paymentType,
      driverName: driverName,
      driverContact: driverContact
    };

    this.showBookingPopup = true;
    this.isBookingPopupMinimized = false;
  }

  closeBookingPopup(): void {
    this.showBookingPopup = false;
    this.isBookingPopupMinimized = false;
    // Don't clear bookingDetails - keep it for navbar access
  }

  openBookingDetailsModal(): void {
    console.log('Opening booking details modal');
    console.log('Current bookingDetails:', this.bookingDetails);
    console.log('All bookings:', this.allBookings);
    console.log('Bookings count:', this.allBookings.length);
    console.log('Is loading:', this.isLoadingBookings);
    
    // Always reload bookings when opening modal to ensure fresh data
    if (this.userDetails?.id && !this.isLoadingBookings) {
      console.log('Reloading bookings when opening modal...');
      this.loadAllBookings();
    }
    
    // Always show modal, even if no bookings (will show loading or empty state)
    this.showBookingDetailsModal = true;
    this.scrollToTop();
    this.preventBodyScroll(true);
    
    console.log('Modal should be visible now:', this.showBookingDetailsModal);
  }

  closeBookingDetailsModal(): void {
    this.showBookingDetailsModal = false;
    this.preventBodyScroll(false);
  }

  hasActiveBooking(): boolean {
    const hasBookings = this.allBookings.length > 0;
    const hasBookingDetails = this.bookingDetails !== null && this.bookingDetails.bookingId !== null;
    const result = hasBookings || hasBookingDetails;
    console.log('hasActiveBooking check:', { hasBookings, hasBookingDetails, result, allBookingsCount: this.allBookings.length });
    return result;
  }

  loadAllBookings(): void {
    const userId = this.userDetails?.id;
    if (!userId) {
      console.warn('User ID not available, cannot load bookings');
      return;
    }

    console.log('Loading bookings for user ID:', userId);
    this.isLoadingBookings = true;
    this.dashboardService.getBookingDetailsByUserId(userId).subscribe({
      next: (response: any) => {
        console.log('All bookings API response:', response);
        this.isLoadingBookings = false;
        
        // Handle different response structures
        let bookings = [];
        // Check for "Booking Details " with trailing space first
        if (response?.['Booking Details ']) {
          bookings = Array.isArray(response['Booking Details ']) ? response['Booking Details '] : [];
        } else if (response?.['Booking Details']) {
          bookings = Array.isArray(response['Booking Details']) ? response['Booking Details'] : [];
        } else if (response?.bookingDetails) {
          bookings = Array.isArray(response.bookingDetails) ? response.bookingDetails : [];
        } else if (response?.data) {
          bookings = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          bookings = response;
        } else if (response && typeof response === 'object') {
          // If response is a single object, wrap it in an array
          bookings = [response];
        }
        
        console.log('Parsed bookings array:', bookings);
        console.log('First booking sample:', bookings.length > 0 ? bookings[0] : 'No bookings');
        
        if (bookings.length > 0) {
          // Assign directly - Angular should detect the change
          this.allBookings = [...bookings]; // Use spread operator to create new array reference
          console.log('Bookings loaded successfully. Count:', this.allBookings.length);
          console.log('Sample booking data:', JSON.stringify(bookings[0], null, 2));
          console.log('First booking fields:', {
            id: bookings[0].id,
            from: bookings[0].from,
            to: bookings[0].to,
            vehicleName: bookings[0].vehicleName,
            carName: bookings[0].carName,
            distance: bookings[0].distance,
            timeDuration: bookings[0].timeDuration,
            amountToPaid: bookings[0].amountToPaid,
            paymentType: bookings[0].paymentType,
            status: bookings[0].status,
            driverDetails: bookings[0]['Driver Details']
          });
          console.log('allBookings array assigned:', this.allBookings);
          console.log('allBookings[0].from:', this.allBookings[0]?.from);
          console.log('allBookings[0].to:', this.allBookings[0]?.to);
          console.log('allBookings[0].vehicleName:', this.allBookings[0]?.vehicleName);
          
          // Always set the most recent booking as the active one for the popup
          const latestBooking = bookings[0]; // Assuming first is latest
          this.setBookingDetailsFromApi(latestBooking);
        } else {
          console.log('No bookings found in response');
          this.allBookings = [];
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        console.error('Error details:', error?.error || error);
        this.isLoadingBookings = false;
        this.allBookings = [];
        // Don't show error modal for this - it's a background operation
      }
    });
  }

  setBookingDetailsFromApi(booking: any): void {
    console.log('Setting booking details from API:', booking);
    console.log('Booking keys:', Object.keys(booking || {}));
    
    // Map API response to bookingDetails format
    const bookingId = booking.id || booking.bookingId || null;
    const from = booking.from || '';
    const to = booking.to || '';
    const distance = booking.distance || '';
    const duration = booking.timeDuration || booking.duration || '';
    const amount = booking.amountToPaid || booking.amount || 0;
    const paymentType = booking.paymentType || '';
    
    // Handle nested Driver Details object
    const driverDetails = booking['Driver Details'] || booking.DriverDetails || booking.driverDetails || null;
    let driverName = 'N/A';
    let driverContact = 'N/A';
    
    if (driverDetails) {
      const firstName = driverDetails.firstName || '';
      const middleName = driverDetails.middleName || '';
      const lastName = driverDetails.lastName || '';
      driverName = `${firstName} ${middleName} ${lastName}`.trim() || 'N/A';
      driverContact = driverDetails.contactNumber || driverDetails.contact || 'N/A';
    } else {
      // Fallback to flat structure if Driver Details is not nested
      driverName = booking.driverName || 'N/A';
      driverContact = booking.driverContact || booking.driverContactNumber || 'N/A';
    }
    
    console.log('Extracted values:', { bookingId, from, to, distance, duration, amount, paymentType, driverName, driverContact });
    
    this.bookingDetails = {
      bookingId: bookingId,
      route: from && to ? `${from} → ${to}` : 'N/A → N/A',
      vehicleType: booking.vehicleName || booking.vehicleType || booking.vehicleTypeName || 'N/A',
      carName: booking.carName || booking.selectedCarName || 'N/A',
      distance: distance ? `${distance} km` : 'N/A',
      duration: duration || 'N/A',
      amount: amount || 0,
      paymentType: paymentType || 'N/A',
      driverName: driverName,
      driverContact: driverContact
    };
    
    console.log('Mapped bookingDetails:', this.bookingDetails);
  }

  getBookingAmount(booking: any): number {
    if (!booking) return 0;
    const amount = booking.amountToPaid || booking.amount;
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof amount === 'number' ? amount : 0;
  }

  getObjectKeys(obj: any): string {
    if (!obj) return 'null';
    try {
      return Object.keys(obj).join(', ');
    } catch (e) {
      return 'error: ' + e;
    }
  }

  getBookingJson(booking: any): string {
    if (!booking) return 'null';
    try {
      return JSON.stringify(booking, null, 2);
    } catch (e) {
      return 'error: ' + e;
    }
  }

  getPaymentStatus(booking: any): string {
    if (!booking) return 'N/A';
    const status = booking['Payment Status'] || booking.paymentStatus || booking.status || null;
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getTripStatus(booking: any): string {
    if (!booking) return 'N/A';
    const status = booking['Trip Status'] || booking.tripStatus || null;
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  loadBookingHistory(): void {
    const userId = this.userDetails?.id;
    if (!userId) {
      console.warn('User ID not available, cannot load booking history');
      return;
    }

    console.log('Loading booking history for user ID:', userId);
    this.isLoadingHistory = true;
    this.dashboardService.getBookingHistory(userId).subscribe({
      next: (response: any) => {
        console.log('Booking history API response:', response);
        this.isLoadingHistory = false;
        
        // Handle different response structures
        let history = [];
        // Check for "Booking Details " with trailing space first
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
        
        console.log('Parsed booking history array:', history);
        
        if (history.length > 0) {
          this.bookingHistory = [...history];
          console.log('Booking history loaded successfully. Count:', this.bookingHistory.length);
        } else {
          console.log('No booking history found in response');
          this.bookingHistory = [];
        }
      },
      error: (error) => {
        console.error('Error loading booking history:', error);
        console.error('Error details:', error?.error || error);
        this.isLoadingHistory = false;
        this.bookingHistory = [];
      }
    });
  }

  formatHistoryDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  }

  formatHistoryTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'N/A';
    }
  }

  viewTripDetails(bookingId: number): void {
    // Find the booking in bookingHistory or allBookings
    const booking = this.bookingHistory.find(b => b.id === bookingId) ||
                    this.allBookings.find(b => b.id === bookingId);
    
    if (booking) {
      this.selectedTripDetails = booking;
      this.showTripDetailsModal = true;
      this.scrollToTop();
      this.preventBodyScroll(true);
    } else {
      this.showErrorModalWithMessage('Trip details not found.');
    }
  }

  closeTripDetailsModal(): void {
    this.showTripDetailsModal = false;
    this.selectedTripDetails = null;
    this.preventBodyScroll(false);
  }

  viewAllHistory(): void {
    // Toggle showing all history bookings
    this.showAllHistory = !this.showAllHistory;
    if (this.showAllHistory) {
      this.scrollToHistory();
    }
  }

  getDisplayedHistory(): any[] {
    // Return first 3 bookings if showAllHistory is false, otherwise return all
    if (this.showAllHistory) {
      return this.bookingHistory;
    }
    return this.bookingHistory.slice(0, 3);
  }

  minimizeBookingPopup(): void {
    this.isBookingPopupMinimized = true;
    // Position icon in bottom right corner when minimizing
    this.floatingIconPosition = { 
      x: window.innerWidth - 80, 
      y: window.innerHeight - 100 
    };
  }

  maximizeBookingPopup(): void {
    this.isBookingPopupMinimized = false;
  }

  isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  onBookingPopupDragStart(event: MouseEvent): void {
    if (event.target && (event.target as HTMLElement).closest('.booking-popup-btn')) {
      return; // Don't drag if clicking on buttons
    }
    this.isDragging = true;
    const popup = (event.currentTarget as HTMLElement).closest('.booking-popup') as HTMLElement;
    if (popup) {
      const rect = popup.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
    document.addEventListener('mousemove', this.onBookingPopupDragMove);
    document.addEventListener('mouseup', this.onBookingPopupDragEnd);
    event.preventDefault();
  }

  onFloatingIconDragStart(event: MouseEvent): void {
    // Don't start dragging if it's a click (not a drag)
    const startX = event.clientX;
    const startY = event.clientY;
    let hasMoved = false;
    
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaX > 5 || deltaY > 5) {
        hasMoved = true;
        this.isDragging = true;
        const icon = event.currentTarget as HTMLElement;
        const rect = icon.getBoundingClientRect();
        this.dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        // Remove the initial mouse move listener
        document.removeEventListener('mousemove', onMouseMove);
        // Add the actual drag handlers
        document.addEventListener('mousemove', this.onFloatingIconDragMove);
        document.addEventListener('mouseup', this.onFloatingIconDragEnd);
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (!hasMoved) {
        // It was a click, not a drag - maximize the popup
        this.maximizeBookingPopup();
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
    event.stopPropagation();
  }

  onBookingPopupDragMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    this.bookingPopupPosition = {
      x: event.clientX - this.dragOffset.x,
      y: event.clientY - this.dragOffset.y
    };
    // Keep popup within viewport
    this.bookingPopupPosition.x = Math.max(0, Math.min(this.bookingPopupPosition.x, window.innerWidth - 400));
    this.bookingPopupPosition.y = Math.max(0, Math.min(this.bookingPopupPosition.y, window.innerHeight - 300));
  };

  onFloatingIconDragMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    this.floatingIconPosition = {
      x: event.clientX - this.dragOffset.x,
      y: event.clientY - this.dragOffset.y
    };
    // Keep icon within viewport, but allow it to be dragged anywhere
    this.floatingIconPosition.x = Math.max(0, Math.min(this.floatingIconPosition.x, window.innerWidth - 64));
    this.floatingIconPosition.y = Math.max(0, Math.min(this.floatingIconPosition.y, window.innerHeight - 64));
  };

  onBookingPopupDragEnd = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onBookingPopupDragMove);
    document.removeEventListener('mouseup', this.onBookingPopupDragEnd);
  };

  onFloatingIconDragEnd = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onFloatingIconDragMove);
    document.removeEventListener('mouseup', this.onFloatingIconDragEnd);
  };

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preventBodyScroll(prevent: boolean): void {
    if (prevent) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }

  formatAmount(value: number | string): string {
    // Format to 2 decimal places for display
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(numValue)) return '0.00';
    // Format to exactly 2 decimal places
    return numValue.toFixed(2);
  }

  getRouteDisplay(): string {
    if (!this.routeData.source || !this.routeData.destination) {
      return 'Not planned yet';
    }
    if (this.isRoundTrip) {
      return `${this.routeData.source} → ${this.routeData.destination} → ${this.routeData.source}`;
    }
    return `${this.routeData.source} → ${this.routeData.destination}`;
  }

  parseRating(ratingString: string | undefined): number {
    if (!ratingString) return 0;
    // Extract numeric value from strings like "3.8 rating" or "3.8"
    const match = ratingString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  getStarRating(rating: number): { filled: number, half: boolean, empty: number } {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return {
      filled: fullStars,
      half: hasHalfStar,
      empty: emptyStars
    };
  }

  finalizeBooking(): void {
    // This is called when user confirms the booking in the amount modal
    if (!this.selectedPaymentType) {
      alert('Please select a payment method.');
      return;
    }

    if (!this.amountInfo()) {
      alert('Amount information is missing. Please try again.');
      return;
    }

    if (!this.driverDetails) {
      alert('Driver details are missing. Please try again.');
      return;
    }

    console.log('Finalizing booking with amount:', this.amountInfo());
    console.log('Payment method:', this.selectedPaymentType);
    console.log('Driver details:', this.driverDetails);
    
    // Handle UPI payment with Razorpay
    if (this.selectedPaymentType === 'upi') {
      this.processUPIPayment();
      return;
    }
    
    // Handle Cash payment
    this.processCashPayment();
  }

  processCashPayment(): void {
    // Prepare booking data for cash payment
    const customerId = this.userDetails?.id || '';
    const vehicleTypeId = this.selectedVehicleType?.id || 
                         this.selectedVehicleType?.vehicalTypeId || 
                         this.selectedVehicleType?.vehicleTypeId || 0;
    const selectedCarId = this.selectedCar?.id || 
                          this.selectedCar?.vehical_type_id || 
                          this.selectedCar?.carId || 0;
    // Get driverId - it might not be in the response, so we'll send 0 or null
    const driverId = this.driverDetails?.id || 0;
    console.log('Driver ID for booking:', driverId);
    console.log('Driver Details:', this.driverDetails);

    // Validate required data
    if (!customerId) {
      console.error('Customer ID is missing');
      this.showErrorModalWithMessage('Customer information is missing. Please login again.');
      return;
    }

    if (!vehicleTypeId || vehicleTypeId === 0) {
      console.error('Vehicle Type ID is missing');
      this.showErrorModalWithMessage('Vehicle type information is missing. Please try again.');
      return;
    }

    if (!selectedCarId || selectedCarId === 0) {
      console.error('Selected Car ID is missing');
      this.showErrorModalWithMessage('Car selection information is missing. Please try again.');
      return;
    }

    // Validate driver information exists (id is optional, but driver details should be present)
    if (!this.driverDetails || (!this.driverDetails.firstName && !this.driverDetails.lastName)) {
      console.error('Driver information is missing');
      this.showErrorModalWithMessage('Driver information is missing. Please try again.');
      return;
    }

    if (!this.routeData.source || !this.routeData.destination) {
      console.error('Route information is missing');
      this.showErrorModalWithMessage('Route information is missing. Please try again.');
      return;
    }

    // Extract distance as number (remove units)
    const distanceStr = this.routeInfo()?.distance || '0 km';
    const distanceValue = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
    const distanceInKm = distanceStr.includes('km') ? distanceValue : distanceValue / 1000;
    
    // Get duration string
    const timeDuration = this.routeInfo()?.duration || null;
    
    // Get final amount
    const amountToPaid = this.getFinalAmount();
    
    // Get payment type
    const paymentType = this.selectedPaymentType || 'cash';
    
        const bookingData = {
          razorpayPaymentId: '', // Empty for cash payment
          razorpayOrderId: '', // Empty for cash payment
          razorpaySignature: '', // Empty for cash payment
          from: this.routeData.source,
          to: this.routeData.destination,
          customerId: customerId,
          vehicleTypeId: vehicleTypeId,
          selectedCarId: selectedCarId,
          driverId: driverId || null,
          distance: isNaN(distanceInKm) || distanceInKm <= 0 ? null : distanceInKm,
          timeDuration: timeDuration,
          amountToPaid: amountToPaid,
          paymentType: paymentType,
          status: 'pending' // Cash payment status - sending even though READ_ONLY (may work on POST)
        };

    console.log('Saving cash booking details:', bookingData);
    console.log('Driver ID value being sent:', bookingData.driverId);
    console.log('Full booking payload:', JSON.stringify(bookingData, null, 2));
    this.isLoadingAmount.set(true);

    // Call API to save booking details
    this.dashboardService.saveBookingDetails(bookingData).subscribe({
      next: (bookingResponse: any) => {
        console.log('Cash booking saved successfully:', bookingResponse);
        this.isLoadingAmount.set(false);
        
        // Check if booking status is "Confirm"
        const bookingStatus = bookingResponse?.['Booking Status'] || bookingResponse?.bookingStatus || bookingResponse?.status || '';
        const bookingId = bookingResponse?.['Booking Id'] || bookingResponse?.bookingId || bookingResponse?.id || null;
        
        // Save booking data before clearing
        const savedBookingData = {
          route: this.getRouteDisplay(),
          vehicleType: this.selectedVehicleType?.vehicalType || this.selectedVehicleType?.vehicleType || this.selectedVehicleType?.type || this.selectedVehicleType?.name || 'N/A',
          carName: this.selectedCar?.name || this.selectedCar?.carName || this.selectedCar?.vehicleName || 'N/A',
          distance: this.routeInfo()?.distance || 'N/A',
          duration: this.routeInfo()?.duration || 'N/A',
          amount: this.getFinalAmount(),
          paymentType: this.selectedPaymentType === 'upi' ? 'UPI' : 'Cash',
          driverName: this.driverDetails ? 
            `${this.driverDetails.firstName} ${this.driverDetails.middleName || ''} ${this.driverDetails.lastName}`.trim() : 'N/A',
          driverContact: this.driverDetails?.contactNumber || 'N/A'
        };

        if (bookingStatus === 'Confirm' && bookingId) {
          // Show success modal first
          const finalAmount = this.getFinalAmount();
          const finalAmountFormatted = this.formatAmount(finalAmount);
          this.showSuccessModalWithMessage(`Booking confirmed successfully!\n\nPayment Method: Cash\nTotal Amount: ₹${finalAmountFormatted}\n\nYour trip has been booked.`);
          
          // After modal closes, show booking details popup with saved data
          setTimeout(() => {
            this.closeSuccessModal();
            // Show popup BEFORE clearing booking
            this.showBookingDetailsPopup(bookingId, bookingResponse, savedBookingData);
            // Clear booking form data but keep bookingDetails for popup
            this.clearBookingForm();
            // Reload all bookings to update the list
            this.loadAllBookings();
          }, 2000);
        } else {
          const finalAmount = this.getFinalAmount();
          const finalAmountFormatted = this.formatAmount(finalAmount);
          this.showErrorModalWithMessage(`Booking confirmed successfully!\n\nPayment Method: Cash\nTotal Amount: ₹${finalAmountFormatted}\n\nYour trip has been booked.`);
          // Clear everything after successful booking
          this.clearBooking();
        }
      },
      error: (error) => {
        console.error('Error saving cash booking:', error);
        this.isLoadingAmount.set(false);
        const errorMessage = error?.error?.message || error?.error?.error || error?.error?.errorMessage || error?.message || 'Failed to save booking details. Please try again.';
        this.showErrorModalWithMessage(`Failed to save booking:\n\n${errorMessage}`);
        // Don't clear booking on error - user might need to retry
      }
    });
  }

  processUPIPayment(): void {
    if (!this.amountInfo()) {
      alert('Amount information is missing. Please try again.');
      return;
    }

    const finalAmount = this.getFinalAmount();
    // Send amount with decimal as string to API
    const amountString = finalAmount.toString();

    this.isLoadingAmount.set(true);

    // Call create_order API - send amount with decimal as string
    this.dashboardService.createOrder(amountString).subscribe({
      next: (response: any) => {
        console.log('Order created successfully - Full response:', JSON.stringify(response, null, 2));
        
        // Handle different response structures
        // Flat response: { id: "...", ... }
        // Nested response: { OrderDetails: { id: "..." }, keyID: "..." }
        // Or wrapped: { data: { id: "..." } }
        
        // Extract order ID - response structure: { keyId: "...", order: { id: "..." } }
        const orderId = response?.order?.id || 
                       response?.OrderDetails?.id ||
                       response?.id || 
                       response?.order_id ||
                       response?.orderId ||
                       response?.data?.order?.id ||
                       response?.data?.id;

        // Extract key ID - response structure: { keyId: "...", order: { ... } }
        const keyId = response?.keyId || 
                     response?.keyID || 
                     response?.key_id || 
                     response?.key ||
                     response?.OrderDetails?.keyID ||
                     response?.data?.keyID;

        console.log('Full response object:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response || {}));
        console.log('Extracted values - Order ID:', orderId, 'Key ID:', keyId);
        console.log('Direct access - response.order.id:', response?.order?.id);
        console.log('Direct access - response.keyId:', response?.keyId);

        if (!orderId) {
          console.error('Order ID not found in response.');
          console.error('Response structure:', JSON.stringify(response, null, 2));
          console.error('Available keys:', Object.keys(response || {}));
          console.error('Direct response.id value:', response?.id);
          alert('Failed to create order. Order ID not found in response. Please check console for details.');
          this.isLoadingAmount.set(false);
          return;
        }

        // If keyID is not in response, we need to get it from backend or config
        // For now, let's make it optional and see if Razorpay can work without it
        // or we need to add an API call to get the keyID
        if (!keyId) {
          console.warn('Key ID not found in response. This is required for Razorpay.');
          console.warn('Response structure:', JSON.stringify(response, null, 2));
          // TODO: Add API call to get keyID or store it in config
          alert('Key ID is missing. Please ensure your backend returns keyID in the create_order response.');
          this.isLoadingAmount.set(false);
          return;
        }

        // Initialize Razorpay checkout
        // Convert amount to paise for Razorpay (Razorpay requires amount in paise)
        const amountInPaise = Math.round(finalAmount * 100).toString();
        console.log('Initializing Razorpay with Order ID:', orderId, 'Key ID:', keyId);
        
        // Hide loading state before opening Razorpay
        this.isLoadingAmount.set(false);
        
        // Small delay to ensure UI updates before opening Razorpay modal
        setTimeout(() => {
          this.initializeRazorpay(orderId, keyId, amountInPaise, finalAmount);
        }, 100);
      },
      error: (error) => {
        console.error('Error creating order - Full error:', error);
        console.error('Error response:', error?.error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to create payment order. Please try again.';
        alert(errorMessage);
        this.isLoadingAmount.set(false);
      }
    });
  }

  initializeRazorpay(orderId: string, keyId: string, amountInPaise: string, amountInRupees: number): void {
    // Access Razorpay from window object
    const Razorpay = (window as any).Razorpay;

    if (!Razorpay) {
      alert('Razorpay SDK not loaded. Please refresh the page and try again.');
      return;
    }

    const userDetails = this.userDetails;
    const userName = this.getUserDisplayName();
    const userEmail = userDetails?.email || '';
    const userContact = userDetails?.contactNumber || '';

    console.log('Initializing Razorpay with options:', {
      key: keyId,
      amount: amountInPaise,
      order_id: orderId
    });

    const options: any = {
      key: keyId,
      // For testing: Set amount to 1 rupee (100 paise)
      //amount: 100, // 100 paise = ₹1.00
      // For production: Use actual amount
       amount: amountInPaise,
      currency: 'INR',
      name: 'QuickRide',
      description: `Trip Booking - ${this.getRouteDisplay()}`,
      image: '', // Add your logo URL here if available
      order_id: orderId,
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        paylater: true
      },
      // Try explicit UPI configuration
      readonly: {
        email: false,
        contact: false
      },
      handler: (response: any) => {
        console.log('Payment successful:', response);
        
        // Prepare booking data
        const customerId = this.userDetails?.id || '';
        const vehicleTypeId = this.selectedVehicleType?.id || 
                             this.selectedVehicleType?.vehicalTypeId || 
                             this.selectedVehicleType?.vehicleTypeId || 0;
        const selectedCarId = this.selectedCar?.id || 
                              this.selectedCar?.vehical_type_id || 
                              this.selectedCar?.carId || 0;
        const driverId = this.driverDetails?.id || 0;

        // Validate required data
        if (!customerId) {
          console.error('Customer ID is missing');
          this.showErrorModalWithMessage('Customer information is missing. Please login again.');
          return;
        }

        if (!vehicleTypeId || vehicleTypeId === 0) {
          console.error('Vehicle Type ID is missing');
          this.showErrorModalWithMessage('Vehicle type information is missing. Please try again.');
          return;
        }

        if (!selectedCarId || selectedCarId === 0) {
          console.error('Selected Car ID is missing');
          this.showErrorModalWithMessage('Car selection information is missing. Please try again.');
          return;
        }

        // Validate driver information exists (id is optional, but driver details should be present)
        if (!this.driverDetails || (!this.driverDetails.firstName && !this.driverDetails.lastName)) {
          console.error('Driver information is missing');
          this.showErrorModalWithMessage('Driver information is missing. Please try again.');
          return;
        }

        if (!this.routeData.source || !this.routeData.destination) {
          console.error('Route information is missing');
          this.showErrorModalWithMessage('Route information is missing. Please try again.');
          return;
        }

        // Extract distance as number (remove units)
        const distanceStr = this.routeInfo()?.distance || '0 km';
        const distanceValue = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
        const distanceInKm = distanceStr.includes('km') ? distanceValue : distanceValue / 1000;
        
        // Get duration string
        const timeDuration = this.routeInfo()?.duration || null;
        
        // Get final amount
        const amountToPaid = this.getFinalAmount();
        
        // Get payment type
        const paymentType = this.selectedPaymentType || 'upi';
        
        const bookingData = {
          razorpayPaymentId: response.razorpay_payment_id || '',
          razorpayOrderId: response.razorpay_order_id || '',
          razorpaySignature: response.razorpay_signature || '',
          from: this.routeData.source,
          to: this.routeData.destination,
          customerId: customerId,
          vehicleTypeId: vehicleTypeId,
          selectedCarId: selectedCarId,
          driverId: driverId || null,
          distance: isNaN(distanceInKm) || distanceInKm <= 0 ? null : distanceInKm,
          timeDuration: timeDuration,
          amountToPaid: amountToPaid,
          paymentType: paymentType,
          status: 'paid' // UPI payment status - sending even though READ_ONLY (may work on POST)
        };

        console.log('Saving booking details:', bookingData);
        console.log('Driver ID value being sent:', bookingData.driverId);
        console.log('Full booking payload:', JSON.stringify(bookingData, null, 2));

        // Call API to save booking details
        this.dashboardService.saveBookingDetails(bookingData).subscribe({
          next: (bookingResponse: any) => {
            console.log('Booking saved successfully:', bookingResponse);
            
            // Check if booking status is "Confirm"
            const bookingStatus = bookingResponse?.['Booking Status'] || bookingResponse?.bookingStatus || bookingResponse?.status || '';
            const bookingId = bookingResponse?.['Booking Id'] || bookingResponse?.bookingId || bookingResponse?.id || null;
            
            // Save booking data before clearing
            const savedBookingData = {
              route: this.getRouteDisplay(),
              vehicleType: this.selectedVehicleType?.vehicalType || this.selectedVehicleType?.vehicleType || this.selectedVehicleType?.type || this.selectedVehicleType?.name || 'N/A',
              carName: this.selectedCar?.name || this.selectedCar?.carName || this.selectedCar?.vehicleName || 'N/A',
              distance: this.routeInfo()?.distance || 'N/A',
              duration: this.routeInfo()?.duration || 'N/A',
              amount: this.getFinalAmount(),
              paymentType: this.selectedPaymentType === 'upi' ? 'UPI' : 'Cash',
              driverName: this.driverDetails ? 
                `${this.driverDetails.firstName} ${this.driverDetails.middleName || ''} ${this.driverDetails.lastName}`.trim() : 'N/A',
              driverContact: this.driverDetails?.contactNumber || 'N/A'
            };

            if (bookingStatus === 'Confirm' && bookingId) {
              // Show success modal first
              this.showSuccessModalWithMessage(`Payment Successful!\n\nYour trip has been booked successfully!`);
              
              // After modal closes, show booking details popup with saved data
              setTimeout(() => {
                this.closeSuccessModal();
                // Show popup BEFORE clearing booking
                this.showBookingDetailsPopup(bookingId, bookingResponse, savedBookingData);
                // Clear booking form data but keep bookingDetails for popup
                this.clearBookingForm();
              }, 2000);
            } else {
              this.showErrorModalWithMessage(`Payment Successful!\n\nYour trip has been booked successfully!`);
              // Clear everything after successful booking
              this.clearBooking();
            }
          },
          error: (error) => {
            console.error('Error saving booking:', error);
            const errorMessage = error?.error?.message || error?.error?.error || error?.error?.errorMessage || error?.message || 'Failed to save booking details. Please contact support.';
            this.showErrorModalWithMessage(`Payment was successful, but there was an error saving your booking:\n\n${errorMessage}\n\nPlease contact support with Payment ID: ${response.razorpay_payment_id}`);
            // Don't clear booking on error - user might need to retry
          }
        });
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userContact.replace(/[^\d]/g, '') // Remove non-digits
      },
      notes: {
        route: this.getRouteDisplay(),
        vehicleType: this.selectedVehicleType?.vehicalType || this.selectedVehicleType?.vehicleType || this.selectedVehicleType?.type || this.selectedVehicleType?.name || 'N/A',
        car: this.selectedCar?.name || this.selectedCar?.carName || this.selectedCar?.vehicleName || 'N/A',
        distance: this.routeInfo()?.distance || 'N/A',
        duration: this.routeInfo()?.duration || 'N/A'
      },
      theme: {
        color: '#4f46e5' // Match your primary color
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
          this.isLoadingAmount.set(false);
        }
      }
    };

    const rzp1 = new Razorpay(options);

    // Log when modal opens to debug
    rzp1.on('ready', (response: any) => {
      console.log('Razorpay modal ready:', response);
    });

    rzp1.on('payment.failed', (response: any) => {
      console.error('Payment failed:', response);
      alert(`Payment Failed!\n\nError Code: ${response.error.code}\nDescription: ${response.error.description}\nReason: ${response.error.reason}\n\nPlease try again.`);
      this.isLoadingAmount.set(false);
    });

    console.log('Opening Razorpay checkout...');
    console.log('Note: UPI option typically appears only on mobile devices with UPI apps installed.');
    console.log('If testing on desktop, UPI may not be visible.');
    
    rzp1.open();
  }

}
