import { Component, Input, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { map, timer } from 'rxjs';
import { AuthSession } from './auth-session.interface';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth-card',
  templateUrl: './auth-card.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AuthCardComponent {
  @Input() session!: AuthSession;
  private authService = inject(AuthService)
  private timer = timer(0, 1000).pipe(map(_ => {
    if(!this.session.accessToken || !this.session.accessToken.exp){
      return null;
    }
    const now = Date.now();
    const diff = (this.session.accessToken.exp * 1000) - now;
    if (diff <= 0) {
      return 'Expired';
    }
    return diff;
  }))
  public expiresInSig = toSignal(this.timer.pipe(map(state => {
    if(state === null) return '--';
    if(state === 'Expired') return 'Expired';
    return this.formatDiff(state)
  })))
  public renewsInSig = toSignal(this.timer.pipe(map(state => {
    if(state === null || state === 'Expired') return null;
    if (this.session.config.silentRenew && this.session.config.renewTimeBeforeTokenExpiresInSeconds) {
      const renewDiff = state - (this.session.config.renewTimeBeforeTokenExpiresInSeconds * 1000);
      if (renewDiff <= 0) {
        return 'Renewing...';
      } else {
        return this.formatDiff(renewDiff);
      }
    } else {
      return null
    }
  })))
  
  formatDiff(diff: number): string {
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }

  login() {
    this.authService.login(this.session.config.name);
  }

  logout() {
    this.authService.logout(this.session.config.name);
  }

  renew() {
    this.authService.renew(this.session.config.name);
  }
}