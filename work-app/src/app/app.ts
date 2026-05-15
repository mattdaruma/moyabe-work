import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WORK_APP_CONFIG } from '../work-app-config';
import { catchError, take } from 'rxjs';
import { AuthMenuComponent } from './auth/auth-menu.component';
import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient)
  public testeroo(){
    console.warn('TESTROO')
    this.http.get('https://localhost:3000/api/protected').pipe(take(1), catchError(err => {
      console.error('HTTP ERROR', err)
      return err
    })).subscribe(r => {
      console.warn('HTTP RESPONSE', r)
    })
  }
}
