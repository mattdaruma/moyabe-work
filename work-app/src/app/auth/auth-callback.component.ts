import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="container mt-4">
      <div class="alert alert-info">
        Processing authentication...
      </div>
    </div>
  `,
  standalone: true
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const provider = this.route.snapshot.paramMap.get('provider');
    if (provider) {
      this.authService.isLoggedIn(provider).subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/auth']);
        }
      });
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
