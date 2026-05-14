import { Injectable, inject } from '@angular/core';
import { WORK_APP_CONFIG } from '../../work-app-config';
import { OidcSecurityService, LoginResponse } from 'angular-auth-oidc-client';
import { combineLatest, forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthSession } from './auth-session.interface';

export interface ProviderAuthState {
  isLoggedIn: boolean;
  userData: any;
  expirationTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private config = inject(WORK_APP_CONFIG)
  private oidcSecurityService = inject(OidcSecurityService)
  public sessions$: Observable<AuthSession[]> = combineLatest([
    this.oidcSecurityService.isAuthenticated$.pipe(map(isAuthenticated => isAuthenticated.allConfigsAuthenticated)),
    this.oidcSecurityService.userData$.pipe(map(userData => userData?.allUserData))
  ]).pipe(
    switchMap(([allConfigsAuthenticated, allUserData]) => {
      const sessionObservables = this.config.auth.map(authConfig => {
        const isAuth = allConfigsAuthenticated?.find(a => a.configId == authConfig.configId)?.isAuthenticated ?? false;
        if(!isAuth){
          return of({
              isAuthenticated: isAuth,
              config: authConfig, 
              user:  null, 
              accessToken: null
            })
        }
        const ud = allUserData?.find(u => u.configId == authConfig.configId)?.userData
        return this.oidcSecurityService.getPayloadFromAccessToken(false, authConfig.configId).pipe(
          map(payload => {
            return { 
              isAuthenticated: isAuth,
              config: authConfig, 
              user:  ud, 
              accessToken: payload};
          })
        )
    })
    return forkJoin(sessionObservables)
  }))

  login(providerName: string): void {
    this.oidcSecurityService.authorize(providerName);
  }

  logout(providerName: string): void {
    this.oidcSecurityService.logoffLocal(providerName);
  }

  renew(providerName: string): Subscription {
    return this.oidcSecurityService.forceRefreshSession(undefined, providerName).pipe(take(1)).subscribe();
  }

  checkAuth(): Observable<LoginResponse[]> {
    return this.oidcSecurityService.checkAuthMultiple();
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
}
