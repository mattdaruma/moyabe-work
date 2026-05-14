**Configuration Contract (`src/work-app-config.ts`):**
```typescript
interface AuthConfig extends OpenIdConfiguration {
  name: string;
  display: string;
}

interface WorkGroupConfig {
  name: string;
  display: string;
  listUrl: string;
  itemUrl: string;
}

interface WorkAppConfig {
  auth: AuthConfig[];
  groups: WorkGroupConfig[];
}
```