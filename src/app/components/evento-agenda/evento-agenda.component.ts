import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { EventoAgenda } from 'src/app/servicios/eventos.service';
import { DetalleEventoComponent } from '../detalle-evento/detalle-evento.component';
import {
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';

import { FechaLargaPipe } from 'src/app/pipes/fecha-larga.pipe'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-evento-agenda',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonButtons,
    FechaLargaPipe,
  ],
  templateUrl: './evento-agenda.component.html',
  styleUrls: ['./evento-agenda.component.scss'],
})
export class EventoAgendaComponent {
  @Input() evento!: EventoAgenda;

  @Output() editar = new EventEmitter<EventoAgenda>();
  @Output() eliminar = new EventEmitter<string>();

  constructor(private modalCtrl: ModalController) {}

  async abrirDetalle() {
    console.log('Fecha del evento cruda:', this.evento.fecha);
console.log('Tipo de dato:', typeof this.evento.fecha);
console.log('Fecha como local:', new Date(this.evento.fecha).toString());

    const modal = await this.modalCtrl.create({
      component: DetalleEventoComponent,
      componentProps: {
        evento: this.evento,

      },
    });
    await modal.present();
  }

  onEditar(event: MouseEvent) {
    event.stopPropagation();
    this.editar.emit(this.evento);
  }

  onEliminar(event: MouseEvent) {
    event.stopPropagation();
    this.eliminar.emit(this.evento.id);
  }

  
}

