import { InjectionToken } from '@angular/core';
import { OpenIdConfiguration } from 'angular-auth-oidc-client';

export interface AuthConfig extends OpenIdConfiguration {
  name: string;
  display: string;
}

export interface WorkGroupConfig {
  name: string;
  display: string;
  listUrl: string;
  itemUrl: string;
}

export interface WorkAppConfig {
  auth: AuthConfig[];
  groups: WorkGroupConfig[];
}

export const WORK_APP_CONFIG = new InjectionToken<WorkAppConfig>('work-app.config');
