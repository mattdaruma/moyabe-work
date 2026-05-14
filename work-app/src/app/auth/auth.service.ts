import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WORK_APP_CONFIG } from '../../work-app-config';
import { OidcSecurityService, LoginResponse } from 'angular-auth-oidc-client';
import { combineLatest, forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthSession } from './auth-session.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private config = inject(WORK_APP_CONFIG)
  private oidcSecurityService = inject(OidcSecurityService)
  private router = inject(Router)
  
  public sessions$: Observable<AuthSession[]> = combineLatest([
    this.oidcSecurityService.isAuthenticated$.pipe(map(isAuthenticated => isAuthenticated.allConfigsAuthenticated)),
    this.oidcSecurityService.userData$.pipe(map(userData => userData?.allUserData))
  ]).pipe(
    switchMap(([allConfigsAuthenticated, allUserData]) => {
      if (allConfigsAuthenticated?.some(a => a.isAuthenticated)) {
        const returnUrl = sessionStorage.getItem('post_login_url');
        if (returnUrl) {
          sessionStorage.removeItem('post_login_url');
          this.router.navigateByUrl(returnUrl);
        }
      }

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
        if(ud && !ud.display) ud.display = ud.sub || ud.name || 'Unknown'
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
    sessionStorage.setItem('post_login_url', this.router.url);
    this.oidcSecurityService.authorize(providerName);
  }

  logout(providerName: string): void {
    this.oidcSecurityService.logoffLocal(providerName);
  }

  renew(providerName: string): Subscription {
    return this.oidcSecurityService.forceRefreshSession(undefined, providerName).pipe(take(1)).subscribe();
  }
}
