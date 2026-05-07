import { Component, OnInit, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  ModalController,
  IonButtons
} from '@ionic/angular/standalone';

import { FormMascotaComponent } from '../components/form-mascota/form-mascota.component';
import { MascotasService } from '../servicios/mascotas.service';
import { Mascota } from '../models/mascota.model';
import { MenuMascotaComponent } from '../components/menu-mascota/menu-mascota.component';

import { EventosService, EventoAgenda } from '../servicios/eventos.service';
import { Observable, map } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { AdmobService } from '../servicios/admob.service';

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [
    IonButtons,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    FormMascotaComponent,
    MenuMascotaComponent
  ],
  templateUrl: './mascotas.page.html',
  styleUrls: ['./mascotas.page.scss'],
})
export class MascotasPage implements OnInit {
  private mascotasService = inject(MascotasService);
  private eventosService = inject(EventosService);
  private auth = inject(AuthService);

  mascotas = this.mascotasService.mascotas;

  @ViewChild('toolbar', { read: ElementRef }) toolbar!: ElementRef;

  eventosProximos36hMap: { [idMascota: string]: Observable<boolean> } = {};
  mascotaAnimadaId: string | null = null;
  emojiActual: string | null = null;

  private lastInterstitialTime = 0;
  private readonly COOLDOWN_INTERSTITIAL_MS = 30000;

  constructor(
    private modalController: ModalController,
    private router: Router,
    private renderer: Renderer2,
    private alertController: AlertController,
    private admob: AdmobService
  ) {
    addIcons({ logOutOutline });
  }

  async ngOnInit() {
    await this.mascotasService.loadMascotas();
    await this.admob.init();
    await this.admob.prepareAll();

    for (const mascota of this.mascotas()) {
      this.eventosProximos36hMap[mascota.id] = this.eventosService.eventos$.pipe(
        map(eventos => this.tieneEventoProximo36h(mascota.id, eventos))
      );
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit() {
    this.adjustToolbarHeight();
  }

  private adjustToolbarHeight() {
    if (this.toolbar && this.toolbar.nativeElement) {
      const height = this.toolbar.nativeElement.offsetHeight;
      this.renderer.setStyle(document.documentElement, '--toolbar-height', `${height}px`);
    }
  }

  tieneEventoProximo36h(idMascota: string, eventos: EventoAgenda[]): boolean {
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + 36 * 60 * 60 * 1000);
    return eventos.some(e => {
      if (e.idMascota !== idMascota) return false;
      const fechaEvento = new Date(`${e.fecha}T${e.hora}`);
      return fechaEvento >= ahora && fechaEvento <= limite;
    });
  }

async abrirFormularioMascota(mascotaEditar?: Mascota) {
  const rewardedOk = await this.admob.showRewarded();
  if (!rewardedOk) {
    console.warn('No hay anuncio recompensado disponible, continuamos sin él.');
  }

  await this.abrirModalFormulario(mascotaEditar);
}


  private async abrirModalFormulario(mascotaEditar?: Mascota) {
    const modal = await this.modalController.create({
      component: FormMascotaComponent,
      componentProps: { initialData: mascotaEditar || null },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      await this.mascotasService.addOrUpdateMascota(data);
    }
  }

  animarEmoji(mascota: Mascota) {
    if (this.mascotaAnimadaId) return;
    this.mascotaAnimadaId = mascota.id;
    this.emojiActual = mascota.iconoEmoji;

    setTimeout(() => {
      this.mascotaAnimadaId = null;
      this.emojiActual = null;
    }, 1500);
  }

  async abrirAgendaMascota(mascota: Mascota) {
    const now = Date.now();
    if (now - this.lastInterstitialTime >= this.COOLDOWN_INTERSTITIAL_MS) {
      const ok = await this.admob.showInterstitial();
      this.lastInterstitialTime = Date.now();
      if (!ok) console.warn('Interstitial no estaba listo.');
    }
    this.animarEmoji(mascota);
    this.router.navigate(['/agenda-mascota'], { state: { mascota } });
  }

  async eliminarMascota(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar esta mascota?',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'secondary' },
        { text: 'Eliminar', role: 'confirm', handler: async () => {
            await this.mascotasService.removeMascota(id);
          }
        }
      ]
    });
    await alert.present();
  }

  calcularEdad(fechaNacimiento: string): string {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad < 1) {
      let meses = hoy.getMonth() - nacimiento.getMonth();
      if (meses < 0) meses += 12;
      if (hoy.getDate() < nacimiento.getDate()) meses--;
      return `${meses} meses`;
    }
    return `${edad} años`;
  }

  async irAgendaCompleta() {
    const now = Date.now();
    if (now - this.lastInterstitialTime >= this.COOLDOWN_INTERSTITIAL_MS) {
      const ok = await this.admob.showInterstitial();
      this.lastInterstitialTime = Date.now();
      if (!ok) console.warn('Interstitial no estaba listo.');
    }
    this.router.navigate(['/agenda-completa']);
  }

  verDetalleMascota(mascota: Mascota) {
    this.router.navigateByUrl('/detalle-mascota', { state: { mascota } });
  }
}
