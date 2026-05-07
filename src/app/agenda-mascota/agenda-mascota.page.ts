import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService, EventoAgenda } from 'src/app/servicios/eventos.service';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';

import { CalendarioComponent } from "../components/calendario/calendario.component";
import { EventoAgendaComponent } from '../components/evento-agenda/evento-agenda.component';
import { ModalController } from '@ionic/angular';
import { FormAgendaComponent } from '../components/form-agenda/form-agenda.component';
import { AdmobService } from 'src/app/servicios/admob.service';

@Component({
  selector: 'app-agenda-mascota',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonButton,
    CalendarioComponent,
    EventoAgendaComponent,
    FormAgendaComponent
  ],
  templateUrl: './agenda-mascota.page.html',
  styleUrls: ['./agenda-mascota.page.scss'],
})
export class AgendaMascotaPage implements OnInit, OnDestroy {
  eventos: EventoAgenda[] = [];
  eventosFiltrados: EventoAgenda[] = [];
  private eventosSub!: Subscription;

  idMascota!: string;
  nombreMascota!: string;
  fechaSeleccionada!: string;

  private admob = inject(AdmobService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private eventosService = inject(EventosService);

  ngOnInit() {
    const nav = history.state;
    this.idMascota = nav.mascota?.id;
    this.nombreMascota = nav.mascota?.nombre;

    this.fechaSeleccionada = new Date().toISOString().split('T')[0];

    this.eventosSub = this.eventosService.eventos$.subscribe(eventos => {
      this.eventos = eventos
        .filter(e => e.idMascota === this.idMascota)
        .sort((a, b) =>
          new Date(`${a.fecha}T${a.hora}`).getTime() -
          new Date(`${b.fecha}T${b.hora}`).getTime()
        );

      this.filtrarEventosPorFecha();
    });

    this.admob.prepareInterstitial();
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
    await this.admob.showInterstitial();

    const modal = await this.modalCtrl.create({
      component: FormAgendaComponent,
      componentProps: {
        idMascota: this.idMascota,
        nombreMascota: this.nombreMascota,
        iconoEmoji: eventoEditar?.iconoEmoji ?? undefined,
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
