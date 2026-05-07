import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Noticia } from '../../noticias-services/noticias.service';
import { VerNoticiaComponent } from '../ver-noticia/ver-noticia.component';
import { AdmobService } from 'src/app/servicios/admob.service';

@Component({
  selector: 'app-noticia',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './noticia.component.html',
  styleUrls: ['./noticia.component.scss']
})
export class NoticiaComponent implements OnInit {
  @Input() noticia!: Noticia;

  private modalCtrl = inject(ModalController);
  private admob = inject(AdmobService);

  ngOnInit() {
  console.log('Noticia completa:', this.noticia);
  console.log('Tipo de fechaHora:', typeof this.noticia.fechaHora);
  console.log('Instanceof Date:', this.noticia.fechaHora instanceof Date);
    this.admob.prepareInterstitial();
  }

  async abrirNoticia() {
    await this.admob.showInterstitial();
    const modal = await this.modalCtrl.create({
      component: VerNoticiaComponent,
      componentProps: { noticia: this.noticia },
      cssClass: 'modal-fullscreen'
    });
    await modal.present();
    await this.admob.prepareInterstitial();
  }
}
