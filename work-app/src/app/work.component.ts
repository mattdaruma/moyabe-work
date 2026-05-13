import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { WORK_APP_CONFIG, WorkAppConfig } from '../work-app-config';

@Component({
  selector: 'app-work',
  template: `
    <h2>Work Item: {{ workID }}</h2>
    <p>Formly with Bootstrap is set up!</p>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit(model)">
      <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
      <button type="submit" class="btn btn-primary mt-3">Submit</button>
    </form>
  `,
  imports: [ReactiveFormsModule, FormlyModule],
  standalone: true
})
export class WorkComponent implements OnInit {
  @Input() workID!: string;

  constructor(@Inject(WORK_APP_CONFIG) public config: WorkAppConfig) {}

  form = new FormGroup({});
  model = { email: 'email@gmail.com' };
  fields: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email address',
        placeholder: 'Enter email',
        required: true,
      }
    }
  ];

  ngOnInit() {
    // Component logic initialized with workID ignored/presented
  }

  onSubmit(model: any) {
    console.log(model);
  }
}
