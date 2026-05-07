import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent {
  showLogo1 = true;
  showLogo2 = false;

  constructor(private router: Router, private auth: AuthService) {
    setTimeout(async () => {
      this.showLogo1 = false;
      this.showLogo2 = true;

      setTimeout(async () => {
        const accepted = await this.auth.hasAcceptedLegal();
        this.router.navigate([accepted ? '/tabs' : '/login']);
      }, 3000);

    }, 3000);
  }
}
