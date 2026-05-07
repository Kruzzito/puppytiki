import { Component, inject, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonToast,
  ModalController,
  IonButtons
} from '@ionic/angular/standalone';

import { EventosService, EventoAgenda } from 'src/app/servicios/eventos.service';
import { MascotasService } from 'src/app/servicios/mascotas.service';

@Component({
  selector: 'app-form-agenda',
  standalone: true,
  imports: [
    IonButtons,
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonToast,
  ],
  templateUrl: './form-agenda.component.html',
  styleUrls: ['./form-agenda.component.scss'],
})
export class FormAgendaComponent implements OnInit, OnDestroy {
  fecha: string = '';
  hora: string = '12:00';
  minFecha: string = '';
  maxFecha: string = '2100-12-31';
  lugar: string = '';
  evento: string = '';
  descripcion: string = '';
  mostrarToast = false;
  fechaInvalida = false;

  @Input() idMascota!: string;
  @Input() iconoEmoji!: string;
  @Input() nombreMascota!: string;
  @Input() eventoEditar?: EventoAgenda;

  @ViewChild(IonContent) content!: IonContent;
  keyboardVisible = false;

  private modalCtrl = inject(ModalController);
  private eventosService = inject(EventosService);
  private mascotasService = inject(MascotasService);
  private keyboardListeners: any[] = [];

  constructor() {}

  ngOnInit() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.minFecha = `${yyyy}-${mm}-${dd}`;

    if (this.eventoEditar) {
      this.fecha = this.eventoEditar.fecha;
      this.hora = this.eventoEditar.hora;
      this.lugar = this.eventoEditar.lugar;
      this.evento = this.eventoEditar.evento;
      this.descripcion = this.eventoEditar.descripcion;
      this.nombreMascota = this.eventoEditar.nombreMascota;
      this.iconoEmoji = this.eventoEditar.iconoEmoji;
      this.idMascota = this.eventoEditar.idMascota;
    } else {
      this.fecha = this.minFecha;
      const mascota = this.mascotasService.getMascotaById(this.idMascota);
      if (mascota) {
        this.nombreMascota = mascota.nombre;
        this.iconoEmoji = mascota.iconoEmoji;
      } else {
        console.warn('Mascota no encontrada con ID:', this.idMascota);
        this.nombreMascota = 'Desconocida';
        this.iconoEmoji = '❓';
      }
    }

    if (Capacitor.getPlatform() !== 'web' && Keyboard && typeof Keyboard.addListener === 'function') {
      this.keyboardListeners.push(
        Keyboard.addListener('keyboardWillShow', () => {
          this.keyboardVisible = true;
        }),
        Keyboard.addListener('keyboardWillHide', () => {
          this.keyboardVisible = false;
        })
      );
    }
  }

  ngOnDestroy() {
    this.keyboardListeners.forEach(async (listener) => {
      try {
        if (listener && typeof listener.remove === 'function') {
          await listener.remove();
        } else if (typeof listener === 'function') {
          await listener(); 
        }
      } catch (error) {
        console.warn('❗Error al remover listener del teclado:', error);
      }
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async guardar(form: NgForm) {
    this.fechaInvalida = !this.validarFecha(this.fecha);
    if (form.invalid || this.fechaInvalida) return;

    const nuevoEvento: EventoAgenda = {
      id: this.eventoEditar ? this.eventoEditar.id : crypto.randomUUID(),
      idMascota: this.idMascota,
      nombreMascota: this.nombreMascota,
      iconoEmoji: this.iconoEmoji,
      evento: this.evento.trim(),
      fecha: this.fecha,
      hora: this.hora,
      lugar: this.lugar.trim(),
      descripcion: this.descripcion.trim(),
    };

    if (this.eventoEditar) {
      await this.eventosService.actualizarEvento(nuevoEvento);
    } else {
      await this.eventosService.agregarEvento(nuevoEvento);
    }

    this.mostrarToast = true;
    setTimeout(() => {
      this.modalCtrl.dismiss(nuevoEvento, 'confirm');
    }, 1200);
  }

  private validarFecha(fecha: string): boolean {
    if (!fecha) return false;

    const fechaMaxima = '2100-12-31';
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;

    return fecha >= hoyStr && fecha <= fechaMaxima;
  }

  async scrollToInput(event: any) {
    const element = event.target as HTMLElement;

    setTimeout(async () => {
      const scrollElement = await this.content.getScrollElement();
      const rect = element.getBoundingClientRect();
      const scrollTop = scrollElement.scrollTop;
      const headerHeight = 56;

      const offset = rect.top + scrollTop - headerHeight - 10;
      this.content.scrollToPoint(0, offset, 300);
    }, 300);
  }
}
