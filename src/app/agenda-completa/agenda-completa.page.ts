import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import {
  IonBackButton,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonText,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';

import { EventosService, EventoAgenda } from 'src/app/servicios/eventos.service';
import { CalendarioComponent } from '../components/calendario/calendario.component';
import { EventoAgendaComponent } from '../components/evento-agenda/evento-agenda.component';
import { FormAgendaComponent } from '../components/form-agenda/form-agenda.component';

@Component({
  selector: 'app-agenda-completa',
  templateUrl: './agenda-completa.page.html',
  styleUrls: ['./agenda-completa.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    CommonModule,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonText,
    IonContent,
    CalendarioComponent,
    EventoAgendaComponent,
    FormAgendaComponent
  ],
})
export class AgendaCompletaPage implements OnInit, OnDestroy {
  eventos: EventoAgenda[] = [];
  eventosFiltrados: EventoAgenda[] = [];
  fechaSeleccionada!: string;
  private eventosSub!: Subscription;

  constructor(
    private eventosService: EventosService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.fechaSeleccionada = new Date().toISOString().split('T')[0];

    this.eventosSub = this.eventosService.eventos$.subscribe(eventos => {
      this.eventos = eventos.sort((a, b) =>
        new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
      );
      this.filtrarEventosPorFecha();
    });
  }

  ngOnDestroy() {
    this.eventosSub.unsubscribe();
  }

  onFechaSeleccionada(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.filtrarEventosPorFecha();
  }

  filtrarEventosPorFecha() {
    this.eventosFiltrados = this.eventos.filter(e => e.fecha === this.fechaSeleccionada);
  }

  async abrirFormularioAgenda(eventoEditar?: EventoAgenda) {
    const modal = await this.modalCtrl.create({
      component: FormAgendaComponent,
      componentProps: {
        idMascota: eventoEditar?.idMascota ?? '',
        nombreMascota: eventoEditar?.nombreMascota ?? '',
        iconoEmoji: eventoEditar?.iconoEmoji ?? '',
        eventoEditar
      },
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'confirm' && data) {
      console.log('Evento guardado o actualizado:', data);
    }
  }

  async confirmarEliminarEvento(idEvento: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que quieres eliminar este evento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: async () => {
            await this.eventosService.eliminarEvento(idEvento);
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      console.log('Evento eliminado');
    } else {
      console.log('Eliminación cancelada');
    }
  }
}
