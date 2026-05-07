import {
  Component,
  OnInit,
  ViewChild,
  inject,
  AfterViewInit,
  ElementRef,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButtons,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';

import { AlertController } from '@ionic/angular/standalone';

import { MenuMascotaComponent } from '../components/menu-mascota/menu-mascota.component';
import { StorageService } from '../servicios/storage.service';
import { CreacionPdfService } from '../servicios/creacion-pdf.service';

@Component({
  selector: 'app-detalle-mascota',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonButtons,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    MenuMascotaComponent
  ],
  templateUrl: './detalle-mascota.page.html',
  styleUrls: ['./detalle-mascota.page.scss'],
})
export class DetalleMascotaPage implements OnInit, AfterViewInit {
  private modalCtrl = inject(ModalController);
  @ViewChild('menuMascota') menuMascota!: MenuMascotaComponent;
  @ViewChild('toolbar', { read: ElementRef }) toolbar!: ElementRef;

  mascota: any;
  agenda: any[] = [];
  storageKey: string = '';
  segment: string = 'info';
  touchStartX = 0;
  touchEndX = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private renderer: Renderer2,
    private storageService: StorageService,
    private creacionPdfService: CreacionPdfService
  ) {}

  ngOnInit() {
    const nav = history.state;
    if (nav && nav.mascota) {
      this.mascota = nav.mascota;
      this.storageKey = `agenda_mascota_${this.mascota.id || this.mascota.nombre}`;
      this.recargarAgenda();
    }
  }

  async recargarAgenda() {
    const datos = (await this.storageService.get(this.storageKey)) as { fecha: string }[] || [];
    this.agenda = datos
      .filter(item => item.fecha && !isNaN(new Date(item.fecha).getTime()))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  ngAfterViewInit() {
    this.adjustMenuTop();
  }

  adjustMenuTop() {
    if (this.toolbar && this.toolbar.nativeElement) {
      const height = this.toolbar.nativeElement.offsetHeight;
      this.renderer.setStyle(document.documentElement, '--toolbar-height', `${height}px`);
    }
  }

  calcularEdad(fecha: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  regresar() {
    this.router.navigate(['tabs']);
  }

async confirmarDescarga(tipo: string) {
  const nombreArchivo = `${tipo}_${this.mascota.nombre || 'sinNombre'}.pdf`;
  const alert = await this.alertController.create({
    header: 'Confirmar descarga',
    message: `¿Deseas descargar el archivo de ${nombreArchivo}?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Descargar',
        handler: async () => {
          switch (tipo) {
            case 'acta':
              await this.creacionPdfService.descargarActaNacimiento(this.mascota);
              break;
            case 'clave':
              await this.creacionPdfService.descargarClaveRegistro(this.mascota);
              break;
            case 'carnet':
              await this.creacionPdfService.descargarCarnetCitas(this.mascota, this.calcularEdad(this.mascota.fechaNacimiento), this.agenda);
              break;
            case 'credencial':
              await this.creacionPdfService.generarCredencialMascota(this.mascota, this.calcularEdad(this.mascota.fechaNacimiento));
              break;
          }
          this.mostrarMensaje(`Se ha descargado ${nombreArchivo} correctamente.`);
        },
      },
    ],
  });

  await alert.present();
}


  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'tertiary',
    });
    toast.present();
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const delta = this.touchEndX - this.touchStartX;
    const tabs = ['info', 'ubicacion', 'adopcion', 'responsable', 'emergencia'];
    const currentIndex = tabs.indexOf(this.segment);

    if (Math.abs(delta) > 50) {
      if (delta < 0 && currentIndex < tabs.length - 1) {
        this.segment = tabs[currentIndex + 1];
      } else if (delta > 0 && currentIndex > 0) {
        this.segment = tabs[currentIndex - 1];
      }
    }
  }
}
