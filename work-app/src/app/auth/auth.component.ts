import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WORK_APP_CONFIG, WorkAppConfig } from '../../work-app-config';
import { AuthCardComponent } from './auth-card.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [CommonModule, AuthCardComponent]
})
export class AuthComponent {
  constructor(
    @Inject(WORK_APP_CONFIG) public config: WorkAppConfig
  ) {}
}
