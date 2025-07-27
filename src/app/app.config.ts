import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AuthInterceptor } from './features/auth/auth.interceptor';

import { routes } from './app.routes';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },importProvidersFrom(MatCardModule, MatButtonModule)
  ]
};
