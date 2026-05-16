import { Component, Input, Inject } from '@angular/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../../work-app-config';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  standalone: true
})
export class TableViewComponent {
  @Input() groupID!: string;

  constructor(@Inject(WORK_APP_CONFIG) public config: WorkAppConfig) {}
}
