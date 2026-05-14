import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WORK_APP_CONFIG } from '../work-app-config';
import { AuthService } from './auth/auth.service';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthMenuComponent } from './auth/auth-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private config = inject(WORK_APP_CONFIG)
  protected readonly titleSig = signal(this.config.ui.title);
  protected readonly iconSig = signal(this.config.ui.icon);
}
