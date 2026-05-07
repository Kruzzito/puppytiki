import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { close, logoYoutube, logoFacebook } from 'ionicons/icons';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent implements OnInit {
  @Input() type: 'policies' | 'terms' | 'welcome' = 'policies';
  htmlText: string = '';

  constructor(private modalCtrl: ModalController, private http: HttpClient) {
    addIcons({ close, logoYoutube, logoFacebook });
  }

  ngOnInit() {
    let file = '';
    switch (this.type) {
      case 'policies':
        file = 'assets/legal/policies.html';
        break;
      case 'terms':
        file = 'assets/legal/terms.html';
        break;
      case 'welcome':
        file = 'assets/legal/welcome.html';
        break;
    }

    this.http.get(file, { responseType: 'text' }).subscribe({
      next: (res) => this.htmlText = res,
      error: () => this.htmlText = '<p>Error al cargar el contenido.</p>'
    });
  }

  close() {
    this.modalCtrl.dismiss({ accepted: false });
  }

  accept() {
    this.modalCtrl.dismiss({ accepted: true });
  }
}
