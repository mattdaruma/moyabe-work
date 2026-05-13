import { Component, Inject } from '@angular/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../work-app-config';

@Component({
  selector: 'app-home',
  template: `
    <h2>Home</h2>
    <p>Welcome to the home page!</p>
  `,
  standalone: true
})
export class HomeComponent {
  constructor(@Inject(WORK_APP_CONFIG) public config: WorkAppConfig) {}
}
