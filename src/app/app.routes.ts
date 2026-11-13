import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './features/public/public.routes';
import { PRIVATE_ROUTES } from './features/only_us/private.routes';

export const routes: Routes = [
    ...PUBLIC_ROUTES,
    ...PRIVATE_ROUTES
];
