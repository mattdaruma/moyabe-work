import { Component, Input, Inject } from '@angular/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../work-app-config';

@Component({
  selector: 'app-group',
  template: `
    <h2>Group: {{ groupID }}</h2>
    <p>Group placeholder.</p>
  `,
  standalone: true
})
export class GroupComponent {
  @Input() groupID!: string;

  constructor(@Inject(WORK_APP_CONFIG) public config: WorkAppConfig) {}
}
