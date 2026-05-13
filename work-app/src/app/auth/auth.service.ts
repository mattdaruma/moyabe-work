import { Injectable, Inject, signal } from '@angular/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../../work-app-config';
import { OidcSecurityService, LoginResponse } from 'angular-auth-oidc-client';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProviderAuthState {
  isLoggedIn: boolean;
  userData: any;
  expirationTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // State signal holding auth data for all providers
  readonly authState = signal<Record<string, ProviderAuthState>>({});

  constructor(
    @Inject(WORK_APP_CONFIG) private config: WorkAppConfig,
    private oidcSecurityService: OidcSecurityService
  ) {
    // Keep signal explicitly in sync with the library's internal state events
    this.config.auth.forEach(provider => {
      this.oidcSecurityService.isAuthenticated(provider.name).subscribe((result: any) => {
        const isAuth = typeof result === 'boolean' ? result : (result?.isAuthenticated ?? false);
        
        // Immediate update to ensure the GUI instantly shows "Logged In" without waiting
        // for asynchronous user data or payload retrieval. We preserve existing data if present.
        this.authState.update(state => ({
          ...state,
          [provider.name]: {
             isLoggedIn: isAuth,
             userData: state[provider.name]?.userData || null,
             expirationTime: state[provider.name]?.expirationTime || 0
          }
        }));

        if (isAuth) {
          // If the library detects auth, fetch current user data and sync
          this.oidcSecurityService.getUserData(provider.name).subscribe(userRes => {
            const userData = userRes?.userData || userRes || null;
            this.updateProviderState(provider.name, true, userData, this.authState()[provider.name]?.expirationTime || 0);
            
            // Then attempt to grab expiration time
            this.oidcSecurityService.getPayloadFromAccessToken(false, provider.name).subscribe({
              next: (payload: any) => {
                const expTime = payload?.exp ? payload.exp * 1000 : 0;
                this.updateProviderState(provider.name, true, userData, expTime);
              }
            });
          });
        } else {
          this.updateProviderState(provider.name, false, null, 0);
        }
      });
    });
  }

  login(providerName: string) {
    this.oidcSecurityService.authorize(providerName);
  }

  logout(providerName: string) {
    this.oidcSecurityService.logoffLocal(providerName);
    this.updateProviderState(providerName, false, null, 0);
  }

  renew(providerName: string) {
    this.oidcSecurityService.forceRefreshSession(undefined, providerName).subscribe((res: LoginResponse) => {
      this.handleLoginResponse(providerName, res);
    });
  }

  checkAuth(): Observable<any> {
    return this.oidcSecurityService.checkAuthMultiple().pipe(
      tap((responses: LoginResponse[]) => {
        responses.forEach(res => {
          if (res.configId) {
            this.handleLoginResponse(res.configId, res);
          }
        });
      })
    );
  }

  private handleLoginResponse(providerName: string, res: LoginResponse) {
    const isAuthenticated = typeof res.isAuthenticated === 'boolean' ? res.isAuthenticated : false;
    const userData = res.userData || null;
    
    if (isAuthenticated) {
      // Update immediately to prevent UI lag while waiting for token payload
      this.updateProviderState(providerName, true, userData, this.authState()[providerName]?.expirationTime || 0);

      this.oidcSecurityService.getPayloadFromAccessToken(false, providerName).subscribe({
        next: (payload: any) => {
          const expTime = payload?.exp ? payload.exp * 1000 : 0;
          this.updateProviderState(providerName, true, userData, expTime);
        },
        error: () => {
          this.updateProviderState(providerName, true, userData, 0);
        }
      });
    } else {
      this.updateProviderState(providerName, false, null, 0);
    }
  }

  private updateProviderState(providerName: string, isLoggedIn: boolean, userData: any, expirationTime: number) {
    this.authState.update(state => {
      const current = state[providerName];
      const isUserDataEqual = JSON.stringify(current?.userData) === JSON.stringify(userData);
      
      // Only emit a new state object if something actually changed to prevent redundant change detection
      if (current && current.isLoggedIn === isLoggedIn && current.expirationTime === expirationTime && isUserDataEqual) {
        return state; 
      }
      return {
        ...state,
        [providerName]: { isLoggedIn, userData, expirationTime }
      };
    });
  }

  isLoggedIn(providerName: string): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated(providerName).pipe(
      map((result: any) => {
        if (typeof result === 'boolean') {
          return result;
        }
        return result?.isAuthenticated ?? false;
      })
    );
  }

  getUserData(providerName: string): Observable<any> {
    return this.oidcSecurityService.getUserData(providerName).pipe(
      map(res => res?.userData || res)
    );
  }

  getTokenExpiration(providerName: string): Observable<number> {
    return this.oidcSecurityService.getPayloadFromAccessToken(false, providerName).pipe(
      map((payload: any) => {
        return payload?.exp ? payload.exp * 1000 : 0;
      })
    );
  }
}
