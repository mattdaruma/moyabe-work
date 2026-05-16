import { Component, Inject } from '@angular/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../../work-app-config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true
})
export class HomeComponent {
  constructor(@Inject(WORK_APP_CONFIG) public config: WorkAppConfig) {}
}
