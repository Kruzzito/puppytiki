import {
  Component,
  signal,
  TemplateRef,
  ViewChild,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonButtons,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { FormAgendaComponent } from '../form-agenda/form-agenda.component';
import { StorageService } from '../../servicios/storage.service';
import { FechaLargaPipe } from '../../pipes/fecha-larga.pipe';
import { EventosService, EventoAgenda } from 'src/app/servicios/eventos.service';
import { Subscription } from 'rxjs';
import { AdmobService } from 'src/app/servicios/admob.service';

@Component({
  selector: 'app-menu-mascota',
  standalone: true,
  imports: [
    IonToolbar,
    IonTitle,
    IonButtons,
    IonList,
    IonIcon,
    IonLabel,
    IonItem,
    IonButton,
    CommonModule,
    FechaLargaPipe,
  ],
  templateUrl: './menu-mascota.component.html',
  styleUrls: ['./menu-mascota.component.scss'],
  animations: [
    trigger('slideToggle', [
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
          transform: 'translateY(-100%)',
        })
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
          transform: 'translateY(0)',
        })
      ),
      transition('closed <=> open', animate('300ms ease-in-out')),
    ]),
  ],
})
export class MenuMascotaComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() mascota: any;
  @Input() confirmarDescarga!: (tipo: string) => Promise<void>;

  mostrarMenu = signal(false);
  eventosProximos: EventoAgenda[] = [];
  private eventosSub?: Subscription;

  mostrarMes = false;
  private cambioTimer!: any;

  menuTop = signal(56);

  @ViewChild('botonMenuTemplate', { static: true })
  botonMenu!: TemplateRef<any>;

  @ViewChild('ionHeader', { static: false, read: ElementRef }) ionHeaderRef?: ElementRef;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private eventosService: EventosService,
    private admob: AdmobService
  ) {}

  ngOnInit() {
    if (this.mascota?.id) {
      this.eventosSub = this.eventosService.eventosProximosPorMascota$(this.mascota.id).subscribe(eventos => {
        this.eventosProximos = eventos;
      });
    }

    this.cambioTimer = setInterval(() => {
      this.mostrarMes = !this.mostrarMes;
    }, 3000);

    this.admob.init().then(() => {
      this.admob.prepareRewarded();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      let alturaHeader = 56;
      const ionHeader = document.querySelector('ion-header');
      if (ionHeader) {
        alturaHeader = ionHeader.getBoundingClientRect().height;
      }
      this.menuTop.set(alturaHeader);
    }, 100);
  }

  ngOnDestroy() {
    clearInterval(this.cambioTimer);
    this.eventosSub?.unsubscribe();
  }

  toggleMenu() {
    this.mostrarMenu.update(v => !v);
  }

  async descargar(tipo: string) {
    if (!this.confirmarDescarga) {
      console.warn('Función confirmarDescarga no recibida');
      return;
    }

    const rewardedOk = await this.admob.showRewarded();
    if (!rewardedOk) {
      console.warn(`No hay anuncio recompensado disponible para ${tipo}, continuando...`);
    }

    await this.confirmarDescarga(tipo);
  }

  onSwipeDown() {
    this.mostrarMenu.set(true);
  }

  onSwipeUp() {
    this.mostrarMenu.set(false);
  }

  async abrirModalAgenda() {
    if (!this.mascota) {
      console.warn('No hay mascota seleccionada para asociar la cita');
      return;
    }

    const ok = await this.admob.showInterstitial();
    if (!ok) console.warn('Interstitial no estaba listo, continuamos sin él.');

    const modal = await this.modalCtrl.create({
      component: FormAgendaComponent,
      componentProps: {
        idMascota: this.mascota.id,
        iconoEmoji: this.mascota.iconoEmoji,
        nombreMascota: this.mascota.nombre,
      },
    });
    await modal.present();
  }

  async abrirAgenda() {
    const ok = await this.admob.showInterstitial();
    if (!ok) console.warn('Interstitial no estaba listo, continuamos sin él.');

    this.router.navigate(['/agenda-mascota'], {
      state: { mascota: this.mascota },
    });
  }
}
