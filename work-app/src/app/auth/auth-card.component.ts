import { Component, Input, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthConfig } from '../../work-app-config';
import { AuthService } from './auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-auth-card',
  templateUrl: './auth-card.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AuthCardComponent implements OnInit, OnDestroy {
  @Input() provider!: AuthConfig;
  
  providerState = computed(() => this.authService.authState()[this.provider.name]);
  
  timeRemaining = signal('--');
  renewalRemaining = signal('');
  
  private timerSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.timerSub = interval(1000).subscribe(() => {
      this.updateRemainingTime();
    });
    this.updateRemainingTime();
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  updateRemainingTime() {
    const state = this.providerState();
    if (!state || !state.expirationTime) {
      this.timeRemaining.set('--');
      this.renewalRemaining.set('');
      return;
    }
    
    const now = Date.now();
    const diff = state.expirationTime - now;
    
    if (diff <= 0) {
      this.timeRemaining.set('Expired');
      this.renewalRemaining.set('');
      return;
    }

    this.timeRemaining.set(this.formatDiff(diff));

    if (this.provider.silentRenew && this.provider.renewTimeBeforeTokenExpiresInSeconds) {
      const renewDiff = diff - (this.provider.renewTimeBeforeTokenExpiresInSeconds * 1000);
      if (renewDiff <= 0) {
        this.renewalRemaining.set('Renewing...');
      } else {
        this.renewalRemaining.set(this.formatDiff(renewDiff));
      }
    } else {
      this.renewalRemaining.set('');
    }
  }

  formatDiff(diff: number): string {
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }

  login() {
    this.authService.login(this.provider.name);
  }

  logout() {
    this.authService.logout(this.provider.name);
  }

  renew() {
    this.authService.renew(this.provider.name);
  }
}