import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './auth/auth.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    const authServiceMock = {
      checkAuth: () => of(null)
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('moyabe-app');
  });
});
