import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Noticia } from '../../noticias-services/noticias.service';
import { SafeUrlPipe } from '../../noticias-pipes/safe-url.pipe';

@Component({
  selector: 'app-ver-noticia',
  standalone: true,
  imports: [CommonModule, IonicModule, SafeUrlPipe],
  templateUrl: './ver-noticia.component.html',
  styleUrls: ['./ver-noticia.component.scss']
})
export class VerNoticiaComponent {
  @Input() noticia!: Noticia;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get youtubeEmbedUrl(): string {
    if (!this.noticia.videoUrl) return '';
    const match = this.noticia.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=0` : this.noticia.videoUrl;
  }
}
