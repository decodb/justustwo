import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { MediaComponent } from "./pages/media/media.component";
import { SignInComponent } from "./pages/sign-in/sign-in.component";

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'mini-gallery',
        component: MediaComponent,
    },
    {
        path: 'sign-in',
        component: SignInComponent
    }
];