import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { LegalComponent } from '../components/legal/legal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  acceptedPolicies = false;
  acceptedTerms = false;
  acceptedWelcome = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private modalCtrl: ModalController
  ) {}

  async openLegal(type: 'policies' | 'terms' | 'welcome') {
    const modal = await this.modalCtrl.create({
      component: LegalComponent,
      componentProps: { type },
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.accepted) {
      if (type === 'policies') this.acceptedPolicies = true;
      if (type === 'terms') this.acceptedTerms = true;
      if (type === 'welcome') this.acceptedWelcome = true;
    }
  }

  async login() {
    if (this.acceptedPolicies && this.acceptedTerms && this.acceptedWelcome) {
      await this.auth.acceptLegal();
      this.router.navigate(['/tabs']);
    }
  }
}
