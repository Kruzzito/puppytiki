import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventoAgenda } from 'src/app/servicios/eventos.service';
import { FechaLargaPipe } from 'src/app/pipes/fecha-larga.pipe';

@Component({
  selector: 'app-detalle-evento',
  standalone: true,
  imports: [CommonModule, IonicModule, FechaLargaPipe],
  templateUrl: './detalle-evento.component.html',
  styleUrls: ['./detalle-evento.component.scss'],
})
export class DetalleEventoComponent {
  @Input() evento!: EventoAgenda;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

selectedEmoji: string = '';
emojiRotation: string = '';

ngOnInit() {
  const emojis = ['🥾', '🚢', '🛣️', '🛤️', '🌉', '🌇', '🌆', '🌅', '🌄', '🏘️', '🏝️', '🏜️', '🏖️', '🏕️', '⛰️', '🧸', '🥏', '⚾', '⚽', '🌵', '🌴', '🌳', '🦴', '🏞️'];
  const randomIndex = Math.floor(Math.random() * emojis.length);
  this.selectedEmoji = emojis[randomIndex];

}


}
