import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth-menu',
  templateUrl: './auth-menu.component.html',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }']
})
export class AuthMenuComponent {
  private authService = inject(AuthService)
  public loggedInSig = toSignal(this.authService.sessions$.pipe(map(sessions => {
    return sessions.filter(s => s.isAuthenticated)
  })))
  public loggedOutSig = toSignal(this.authService.sessions$.pipe(map(sessions => {
    return sessions.filter(s => !s.isAuthenticated)
  })))
  login(providerName: string){
    this.authService.login(providerName);
  }
  logout(providerName: string){
    this.authService.logout(providerName);
  }
}