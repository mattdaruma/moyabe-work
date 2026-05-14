import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthCardComponent } from './auth-card.component';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [CommonModule, AuthCardComponent]
})
export class AuthComponent {
  private auth = inject(AuthService)
  public sessionsSig = toSignal(this.auth.sessions$)
}
