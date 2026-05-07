import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonTextarea,
  IonList,
  IonToggle,
  IonSegment,
  IonSegmentButton,
  IonImg,
  IonNote,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonAccordion,
  IonAccordionGroup,
  IonText,
  IonButtons,
  IonBackButton,
  IonThumbnail,
  ToastController,
  ModalController,
  Platform
} from '@ionic/angular/standalone';

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-form-mascota',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonTextarea,
    IonList,
    IonToggle,
    IonSegment,
    IonSegmentButton,
    IonImg,
    IonNote,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonAccordion,
    IonAccordionGroup,
    IonText,
    IonButtons,
    IonBackButton,
    IonThumbnail,
  ],
  templateUrl: './form-mascota.component.html',
  styleUrls: ['./form-mascota.component.scss'],
})
export class FormMascotaComponent implements OnInit, OnDestroy {
  keyboardHeight = 0;
  private keyboardShowListener: any;
  private keyboardHideListener: any;
  @Input() initialData: any = null;
  @ViewChild(IonContent) content!: IonContent;


  mascotaForm!: FormGroup;
  previewImage: string | null = null;
  fechaMaxima: string = ''; // Limitar fecha al año actual

  seccionObligatoriaOpen = true;
  seccionResponsableOpen = false;
  seccionEmergenciaOpen = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {}

async scrollToInput(ev: any) {
  const el = ev.target as HTMLElement;

  setTimeout(async () => {
    const scrollElement = await this.content.getScrollElement();
    const scrollTop = scrollElement.scrollTop;

    const yOffset = el.getBoundingClientRect().top + scrollTop - 120;
    this.content.scrollToPoint(0, yOffset, 300);
  }, 300);
}

  ngOnDestroy(): void {
    this.keyboardShowListener?.remove();
    this.keyboardHideListener?.remove();
  }

  ngOnInit() {
    const hoy = new Date();
    const finAnio = new Date(hoy.getFullYear(), 11, 31);
    this.fechaMaxima = finAnio.toISOString();

    this.platform.ready().then(() => {
      const platform = Capacitor.getPlatform();
      if (platform !== 'web') {
        this.keyboardShowListener = Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
          this.keyboardHeight = info.keyboardHeight;
        });

        this.keyboardHideListener = Keyboard.addListener('keyboardWillHide', () => {
          this.keyboardHeight = 0;
        });
      }
    });

    this.inicializarFormulario();

    if (this.initialData) {
      this.mascotaForm.patchValue(this.initialData);
      this.previewImage = this.initialData.foto || null;
    }
  }


private asegurarId() {
  const idActual = this.mascotaForm.get('id')?.value;
  if (!idActual || idActual.trim() === '') {
    const nuevoId = uuidv4();
    this.mascotaForm.patchValue({ id: nuevoId });
  }
}

inicializarFormulario() {
  this.mascotaForm = this.fb.group({
    id: [''],
    foto: [''],
    iconoEmoji: ['🐶', Validators.required],
    nombre: ['', Validators.required],
    primerApellido: ['', Validators.required],
    segundoApellido: [''],
    sexo: ['', Validators.required],
    especie: ['', Validators.required],
    raza: ['', Validators.required],
    pais: ['', Validators.required],
    estado: ['', Validators.required],
    municipio: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, fechaValida]],
    fechaAdopcion: ['', [Validators.required, fechaValida]],
    responsable: this.fb.group({
      nombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
    }),
    
    emergencia: this.fb.group({
      domicilio: [''],
      telefono: [''],
      email: ['', Validators.email],
    }),
    claveRegistro: [''],
  });

  this.asegurarId();
}

  camposObligatorios = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'primerApellido', label: 'Primer Apellido' },
  { key: 'segundoApellido', label: 'Segundo Apellido', optional: true },
  { key: 'sexo', label: 'Sexo' },
  { key: 'especie', label: 'Especie' },
  { key: 'raza', label: 'Raza' },
  { key: 'pais', label: 'País' },
  { key: 'estado', label: 'Estado' },
  { key: 'municipio', label: 'Municipio' }
];


  get responsable() {
    return this.mascotaForm.get('responsable') as FormGroup;
  }

  get emergencia() {
    return this.mascotaForm.get('emergencia') as FormGroup;
  }

  async seleccionarFoto() {
    if (Capacitor.getPlatform() === 'web') {
      const input = document.getElementById('fileInput');
      if (input) input.click();
    } else {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
        });

        if (image?.base64String) {
          const dataUrl = `data:image/${image.format};base64,${image.base64String}`;
          this.previewImage = dataUrl;
          this.mascotaForm.patchValue({ foto: dataUrl });
        }
      } catch (error) {
        console.error('Error al seleccionar imagen:', error);
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.previewImage = null;
      this.mascotaForm.patchValue({ foto: '' });
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
      this.mascotaForm.patchValue({ foto: this.previewImage });
    };
    reader.readAsDataURL(file);
  }

  eliminarFoto() {
    this.previewImage = null;
    this.mascotaForm.patchValue({ foto: '' });
  }

async guardarMascota() {
  this.asegurarId();

  if (this.mascotaForm.valid) {
    const datosMascota = this.mascotaForm.getRawValue();

    if (!datosMascota.foto || datosMascota.foto.trim() === '') {
      datosMascota.foto = await this.convertEmojiToDataUrl(datosMascota.iconoEmoji);
      this.mascotaForm.patchValue({ foto: datosMascota.foto });
    }

    if (!datosMascota.claveRegistro) {
      const clave = this.generarClaveMascota(datosMascota);
      this.mascotaForm.patchValue({ claveRegistro: clave });
      datosMascota.claveRegistro = clave;
    }

    await this.presentToast('¡Mascota guardada con éxito!');

    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement) activeEl.blur();

    this.modalController.dismiss(datosMascota, 'confirm');
  } else {
    this.mascotaForm.markAllAsTouched();
    await this.presentToast('Completa los campos requeridos.', 'danger');
  }
}

private convertEmojiToDataUrl(emoji: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.font = `${size * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
ctx.fillText(emoji, size / 2, size / 2 + size * 0.09);
    resolve(canvas.toDataURL());
  });
}



  async cancelar() {
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement) {
      activeEl.blur();
    }

    setTimeout(() => {
      this.modalController.dismiss(null, 'cancel');
    }, 100);
  }

  private async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  toggleSeccion(section: 'obligatoria' | 'responsable' | 'emergencia') {
    switch (section) {
      case 'obligatoria':
        this.seccionObligatoriaOpen = !this.seccionObligatoriaOpen;
        break;
      case 'responsable':
        this.seccionResponsableOpen = !this.seccionResponsableOpen;
        break;
      case 'emergencia':
        this.seccionEmergenciaOpen = !this.seccionEmergenciaOpen;
        break;
    }
  }

  private generarClaveMascota(m: any): string {
    const nombre = (m.nombre || '').toUpperCase();
    const apellido1 = (m.primerApellido || '').toUpperCase();
    const apellido2 = (m.segundoApellido || '').toUpperCase();
    const sexo = (m.sexo || 'X').substring(0, 1).toUpperCase();
    const fecha = new Date(m.fechaNacimiento);
    const pais = (m.estado || 'XX').substring(0, 2).toUpperCase();

    const getVocalInterna = (str: string) =>
      (str.match(/[AEIOU]/g) || ['X'])[1] || 'X';

    const getConsonanteInterna = (str: string) =>
      (str.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || ['X'])[1] || 'X';

    const clave =
      apellido1[0] +
      getVocalInterna(apellido1) +
      apellido2[0] +
      nombre[0] +
      fecha.getFullYear().toString().slice(2) +
      ('0' + (fecha.getMonth() + 1)).slice(-2) +
      ('0' + fecha.getDate()).slice(-2) +
      sexo +
      pais +
      getConsonanteInterna(apellido1) +
      getConsonanteInterna(apellido2) +
      getConsonanteInterna(nombre) +
      Math.floor(Math.random() * 90 + 10);

    return clave;
  }
}

export function fechaValida(control: any) {
  const valor = control.value;
  if (!valor) return null;

  const fecha = new Date(valor);
  const hoy = new Date();
  const hace20Anios = new Date();
  hace20Anios.setFullYear(hoy.getFullYear() - 20);

  if (fecha > hoy) {
    return { fechaFutura: true };
  }

  if (fecha < hace20Anios) {
    return { fechaMuyAntigua: true };
  }

  return null;
}
