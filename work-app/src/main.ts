import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { WorkAppConfig, WORK_APP_CONFIG } from './work-app-config';
import { provideAuth, withAppInitializerAuthCheck } from 'angular-auth-oidc-client';

fetch('/work-app-config.json')
  .then((response) => response.json())
  .then((config: WorkAppConfig) => {
    bootstrapApplication(App, {
      ...appConfig,
      providers: [
        ...(appConfig.providers || []),
        { provide: WORK_APP_CONFIG, useValue: config },
        provideAuth({ config: config.auth }, withAppInitializerAuthCheck())
      ]
    }).catch((err) => console.error(err));
  })
  .catch((err) => console.error('Failed to load application configuration', err));
