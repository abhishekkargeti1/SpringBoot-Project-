import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Dashboard } from './components/dashboard/dashboard';
import { ForgetPassword } from './components/forget-password/forget-password';
import { DriverHome } from './components/driver-home/driver-home';
import { DriverLogin } from './components/driver-login/driver-login';
import { DriverSignup } from './components/driver-signup/driver-signup';
import { DriverDashboard } from './components/driver-dashboard/driver-dashboard';

export const routes: Routes = [

    { 
        path: '', 
        component: Home,
        pathMatch: "full" 
    }
    ,
    { 
        path: 'login', 
        component: Login ,
        pathMatch: "full"
    },
    { 
        path: 'signup', 
        component: Signup,
        pathMatch: "full" 
    },
    { 
        path: 'dashboard', 
        component: Dashboard,
        pathMatch: "full" 
    },
    { 
        path: 'forgot-password', 
        component: ForgetPassword,
        pathMatch: "full" 
    },
    { 
        path: 'driver-portal', 
        component: DriverHome,
        pathMatch: "full" 
    },
    { 
        path: 'driver-login', 
        component: DriverLogin,
        pathMatch: "full" 
    },
    { 
        path: 'driver-signup', 
        component: DriverSignup,
        pathMatch: "full" 
    },
    { 
        path: 'driver-dashboard', 
        component: DriverDashboard,
        pathMatch: "full" 
    },

];
