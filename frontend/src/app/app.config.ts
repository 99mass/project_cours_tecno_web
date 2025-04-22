import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoaderInterceptor } from './core/interceptors/loader.interceptor';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { Observable } from 'rxjs';
import { LoaderService } from './core/services/loader.service';

const authInterceptorFn = (req: HttpRequest<unknown>, next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const handler: HttpHandler = { handle: next };
  return new AuthInterceptor(authService, router, notificationService).intercept(req, handler);
};

const loaderInterceptorFn = (req: HttpRequest<unknown>, next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>) => {
  const loaderService = inject(LoaderService);
  const handler: HttpHandler = { handle: next };
  return new LoaderInterceptor(loaderService).intercept(req, handler);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptors([authInterceptorFn, loaderInterceptorFn])
    ),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,      
      resetTimeoutOnDuplicate: true,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true,       
      newestOnTop: true     
    })
  ]
};