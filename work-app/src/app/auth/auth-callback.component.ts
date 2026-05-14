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
export class AuthCallbackComponent {
}
