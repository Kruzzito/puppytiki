import { Responsable } from './../models/mascota.model';
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { FascinateFontBase64 } from '../fonts/fascinate-font';
import { RobotoBoldBase64 } from '../fonts/roboto-bold';
import { RobotoCondensedBase64 } from '../fonts/roboto-condensed';

@Injectable({
  providedIn: 'root'
})
export class CreacionPdfService {
  constructor() {}

  async descargarActaNacimiento(mascota: any) {
    const doc = this.crearDocumentoBase();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marcoActa = await this.loadImageBase64('assets/imgs/marcoActa.jpg');
    doc.addImage(marcoActa, 'JPG', 0, 0, pageWidth, pageHeight);

    doc.setFont('FascinateInline');
    doc.setFontSize(30);
    doc.text('Registro digital de mascotas', pageWidth / 2, 65, { align: 'center' });

    doc.setFont('RobotoCondensed');
    doc.setFontSize(13);
    doc.text('En la presente se hace constar que ha nacido una mascota con los siguientes datos:', 24, 75);

    let y = 80;
    y = this.dibujarSeccionDatosMascota(doc, mascota, y);
    y = this.dibujarSeccionDatosAdoptante(doc, mascota, y);
    y = this.dibujarSeccionDatosContacto(doc, mascota, y);

    y += 20;
    doc.setFontSize(13);
    doc.setTextColor('red');
    doc.text('El presente documento no tiene validez oficial y solo fue creado con fines de entretenimiento.', 24, y);

    y += 20;
    doc.setTextColor('black');
    doc.text('Firma del responsable: ______________________', 24, y);

await this.guardarODescargarPDF(doc, `acta-nacimiento-${mascota.nombre}`);
  }

  private crearDocumentoBase(): jsPDF {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    doc.addFileToVFS('FascinateInline.ttf', FascinateFontBase64);
    doc.addFont('FascinateInline.ttf', 'FascinateInline', 'normal');

    doc.addFileToVFS('Roboto-Bold.ttf', RobotoBoldBase64);
    doc.addFont('Roboto-Bold.ttf', 'RobotoBold', 'normal');

    doc.addFileToVFS('Roboto-Condensed.ttf', RobotoCondensedBase64);
    doc.addFont('Roboto-Condensed.ttf', 'RobotoCondensed', 'normal');

    return doc;
  }

private async guardarODescargarPDF(doc: jsPDF, nombreArchivoCompleto: string) {
  const base64 = doc.output('datauristring').split(',')[1];
  const archivo = `${nombreArchivoCompleto}.pdf`;

  if (Capacitor.isNativePlatform()) {
    await this.guardarPDF(base64, nombreArchivoCompleto);
  } else {
    doc.save(archivo);
  }
}

private async guardarPDF(base64: string, nombreArchivoCompleto: string) {
  const archivo = `${nombreArchivoCompleto}.pdf`;

  try {
    await Filesystem.writeFile({
      path: archivo,
      data: base64,
      directory: Directory.Cache,
    });

    const fileUri = await Filesystem.getUri({
      path: archivo,
      directory: Directory.Cache,
    });

    await Share.share({
      title: 'Compartir PDF',
      text: 'Aquí está tu archivo PDF',
      url: fileUri.uri,
      dialogTitle: 'Compartir con',
    });
  } catch (error) {
    console.error('Error al guardar/compartir PDF:', error);
  }
}


  private async loadImageBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private dibujarSeccionDatosMascota(doc: jsPDF, mascota: any, y: number): number {
    doc.setFillColor(105, 166, 224);
    doc.rect(22, y, 172, 8, 'F');
    doc.setTextColor(0);
    doc.setFontSize(15);
    doc.setFont('RobotoBold');
    doc.text('Datos de la mascota', 24, y + 6);

    y += 12;
    doc.setFont('RobotoCondensed');
    doc.setFontSize(14);

    doc.text(mascota.nombre || '', 24, y + 3);
    doc.text(mascota.primerApellido || '', 82, y + 3);
    doc.text(mascota.segundoApellido || '', 142, y + 3);

    doc.line(22, y + 4, 70, y + 4);
    doc.line(80, y + 4, 130, y + 4);
    doc.line(140, y + 4, 190, y + 4);

    doc.setFontSize(10);
    doc.text('Nombre', 24, y + 8);
    doc.text('Primer apellido', 82, y + 8);
    doc.text('Segundo apellido', 142, y + 8);

    y += 18;
    doc.setFontSize(14);

    doc.text(mascota.especie || '', 24, y);
    doc.text(mascota.raza || '', 67, y);
    doc.text(mascota.sexo || '', 107, y);
    doc.text(this.formatearFecha(mascota.fechaNacimiento), 142, y);

    doc.line(22, y + 1, 55, y + 1);
    doc.line(65, y + 1, 95, y + 1);
    doc.line(105, y + 1, 130, y + 1);
    doc.line(140, y + 1, 190, y + 1);

    doc.setFontSize(10);
    doc.text('Especie', 24, y + 5);
    doc.text('Raza', 67, y + 5);
    doc.text('Sexo', 107, y + 5);
    doc.text('Fecha de nacimiento', 142, y + 5);

    y += 14;
    doc.setFontSize(14);

    doc.text(mascota.pais || '', 24, y + 1);
    doc.text(mascota.estado || '', 82, y + 1);
    doc.text(mascota.municipio || '', 142, y + 1);

    doc.line(22, y + 2, 70, y + 2);
    doc.line(80, y + 2, 130, y + 2);
    doc.line(140, y + 2, 190, y + 2);

    doc.setFontSize(10);
    doc.text('País', 24, y + 6);
    doc.text('Estado', 82, y + 6);
    doc.text('Municipio', 142, y + 6);

    return y + 14;
  }

  private dibujarSeccionDatosAdoptante(doc: jsPDF, mascota: any, y: number): number {
    doc.setFillColor(105, 166, 224);
    doc.rect(22, y, 172, 8, 'F');
    doc.setTextColor(0);
    doc.setFontSize(15);
    doc.setFont('RobotoBold');
    doc.text('Datos del adoptante', 24, y + 6);

    y += 12;
    doc.setFont('RobotoCondensed');
    doc.setFontSize(14);

    doc.text(mascota.responsable?.nombre || '', 24, y + 3);
    doc.text(mascota.responsable?.primerApellido || '', 82, y + 3);
    doc.text(mascota.responsable?.segundoApellido || '', 142, y + 3);

    doc.line(22, y + 4, 70, y + 4);
    doc.line(80, y + 4, 130, y + 4);
    doc.line(140, y + 4, 190, y + 4);

    doc.setFontSize(10);
    doc.text('Nombre', 24, y + 8);
    doc.text('Primer apellido', 82, y + 8);
    doc.text('Segundo apellido', 142, y + 8);

    return y + 14;
  }

  private dibujarSeccionDatosContacto(doc: jsPDF, mascota: any, y: number): number {
    doc.setFillColor(105, 166, 224);
    doc.rect(22, y, 172, 8, 'F');
    doc.setTextColor(0);
    doc.setFontSize(15);
    doc.setFont('RobotoBold');
    doc.text('Datos de contacto', 24, y + 6);

    y += 12;
    doc.setFont('RobotoCondensed');
    doc.setFontSize(14);

    doc.text(mascota.emergencia?.domicilio || '', 24, y + 3);
    doc.line(22, y + 4, 190, y + 4);
    doc.setFontSize(10);
    doc.text('Domicilio', 24, y + 8);

    y += 14;
    doc.setFontSize(14);

    doc.text(mascota.emergencia?.telefono || '', 24, y + 3);
    doc.text(mascota.emergencia?.email || '', 82, y + 3);

    doc.line(22, y + 4, 70, y + 4);
    doc.line(80, y + 4, 190, y + 4);

    doc.setFontSize(10);
    doc.text('Teléfono', 24, y + 8);
    doc.text('Correo electrónico', 82, y + 8);

    return y + 14;
  }

  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private calcularEdad(fecha: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  async optimizarImagenBase64(base64: string, maxWidth = 400, maxHeight = 400, quality = 0.6): Promise<string> {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', quality);
        resolve(optimized);
      };
      img.src = base64;
    });
  }

  public obtenerNombreArchivo(tipo: string): string {
  switch (tipo) {
    case 'acta':
      return 'Acta de Nacimiento';
    case 'clave':
      return 'Clave de Registro';
    case 'carnet':
      return 'Carnet de Citas';
    case 'credencial':
      return 'Credencial';
    default:
      return 'archivo';
  }
}

async descargarClaveRegistro(mascota: any) {
  const doc = this.crearDocumentoBase();

  const pageWidth = doc.internal.pageSize.getWidth();
  const anchoImagen = 215.9;
  const altoImagen = 107.6;

  const marcoCRDM = await this.loadImageBase64('assets/imgs/marcoCRDM.jpg');
  doc.addImage(marcoCRDM, 'JPG', 0, 0, anchoImagen, altoImagen);

  // Texto dividido en dos líneas y alineado a la izquierda
  const textoLinea1 = 'Clave de Registro';
  const textoLinea2 = 'Digital de la mascota';
  const margenIzquierdo = 50; // distancia desde el borde izquierdo en mm
  const yLinea1 = 24;
  const yLinea2 = 32;

  doc.setFont('FascinateInline');
  doc.setFontSize(23);
  doc.text(textoLinea1, margenIzquierdo, yLinea1);
  doc.text(textoLinea2, margenIzquierdo, yLinea2);

  const imgSize = 40;
  const imgX = 30;
  const imgY = 40;
  if (mascota.foto) {
    doc.addImage(mascota.foto, 'JPEG', imgX, imgY, imgSize, imgSize);
  }

  const textX = imgX + imgSize + 6;
  let textY = imgY + 14;
  const clave = mascota.claveRegistro || 'CLAVE_NO_DISPONIBLE';

  doc.setFont('RobotoBold');
  doc.setFontSize(17);
  doc.setTextColor(0);
  doc.text(`CRDM: ${clave}`, textX, textY);

  textY += 14;
  doc.text(`${mascota.nombre} ${mascota.primerApellido} ${mascota.segundoApellido}`, textX, textY);

  textY += 20;
  doc.setFontSize(13);
  doc.setFont('RobotoCondensed');
  doc.setTextColor('red');
  doc.text(
    'El presente documento no tiene validez oficial y solo fue creado con fines de entretenimiento.',
    24,
    textY
  );

await this.guardarODescargarPDF(doc, `clave-registro-${mascota.nombre}`);
}


async descargarCarnetCitas(mascota: any, edad: number, agenda: any[]) {
  const { jsPDF } = await import('jspdf');

  async function cargarImagenBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al cargar imagen: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const anchoContenidoCm = 9.5;
  const altoContenidoCm = 12.5;
  const ptPorCm = 28.3465;

  const anchoContenidoPt = anchoContenidoCm * ptPorCm;
  const altoContenidoPt = altoContenidoCm * ptPorCm;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const margenIzquierdo = 20;
  const margenSuperior = 30;

  const fondoBase64 = await cargarImagenBase64('assets/imgs/fondoCarnet.jpg');
  doc.addImage(fondoBase64, 'JPEG', margenIzquierdo, margenSuperior, anchoContenidoPt, altoContenidoPt);

  let y = margenSuperior;

  const fotoW = 50;
  const fotoH = 50;
  const fotoX = margenIzquierdo + 20;
  const fotoY = y + 25;

  if (mascota.foto) {
    doc.addImage(mascota.foto, 'JPEG', fotoX, fotoY, fotoW, fotoH);
  } else {
    doc.setDrawColor(150);
    doc.rect(fotoX, fotoY, fotoW, fotoH, 'D');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Foto', fotoX + fotoW / 2, fotoY + fotoH / 2, { align: 'center', baseline: 'middle' });
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
    doc.text('EXPEDIENTE:', fotoX + fotoW + 130, fotoY + 1);

  doc.text('NOMBRE:', fotoX + fotoW + 10, fotoY +35);

  const nombreMascota = `${mascota.nombre ?? ''} ${mascota.primerApellido ?? ''} ${mascota.segundoApellido ?? ''}`.trim();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreMascota, fotoX + fotoW + 10, fotoY + 46);

  y = fotoY + fotoH + 15;

  const datosMascotaIz = [
    { label: 'ESPECIE:', value: mascota.especie ?? '' },
    { label: 'RAZA:', value: mascota.raza ?? '' },
    { label: 'GENERO:', value: mascota.sexo ?? '' },
    { label: 'EDAD:', value: `${edad ?? ''} años` }
  ];

  datosMascotaIz.forEach(dato => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(dato.label, margenIzquierdo + 20, y + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(dato.value, margenIzquierdo + 30, y + 36);
    y += 24;
  });

    y = fotoY + fotoH + 15;

  const datosMascotaDe = [
    { label: 'FECHA DE NACIMIENTO:', value: mascota.fechaNacimiento ? this.formatearFecha(mascota.fechaNacimiento) : '' },
    { label: 'FECHA DE ADOPCION:', value: mascota.fechaAdopcion ? this.formatearFecha(mascota.fechaAdopcion) : '' },
    { label: 'CLAVE REGISTRO DIGITAL MASCOTA:', value: mascota.claveRegistro ?? '' },
  ];

  datosMascotaDe.forEach(dato => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal'); 
    doc.text(dato.label, margenIzquierdo + 110, y + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');   
    doc.text(dato.value, margenIzquierdo + 115, y + 36);
    y += 24;
  });



  y += 85;

  const datosDueno = [
    { label: 'NOMBRE:', value: `${mascota.responsable?.nombre ?? ''} ${mascota.responsable?.primerApellido ?? ''} ${mascota.responsable?.segundoApellido ?? ''}`.trim() },
    { label: 'TELEFONO:', value: mascota.emergencia.telefono ?? '' },
    { label: 'DOMICILIO:', value: mascota.emergencia.domicilio ?? '' }
  ];

  datosDueno.forEach(dato => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal'); 
    doc.text(dato.label, margenIzquierdo + 20, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');   
    doc.text(dato.value, margenIzquierdo + 25, y + 10, { maxWidth: anchoContenidoPt - 80 });
    y += 24;
  });

  await this.guardarODescargarPDF(doc, `carnet-${nombreMascota || 'mascota'}`);
}


async generarCredencialMascota(mascota: any, edad: number) {
  const doc = this.crearDocumentoBase();

  const cardWidth = 86;    // mm
  const cardHeight = 54;   // mm

  const frenteX = 20;
  const reversoX = frenteX + cardWidth + 10;
  const cardY = 40;

  const fondoFrente = await this.loadImageBase64('assets/imgs/credencialFrente.jpg');
  const fondoReverso = await this.loadImageBase64('assets/imgs/credencialReverso.jpg');

  doc.addImage(fondoFrente, 'JPG', frenteX, cardY, cardWidth, cardHeight);

  if (mascota.foto) {
    doc.addImage(mascota.foto, 'JPEG', frenteX + 3.2, cardY + 13.2, 26, 26);
  }

  doc.setFont('RobotoBold');
  doc.setFontSize(12);
  doc.text(mascota.nombre || '', frenteX + 6, cardY + 44);

  doc.setFont('RobotoCondensed');
  doc.setFontSize(10);
  doc.text(mascota.primerApellido || '', frenteX + 6, cardY + 48);
  doc.text(mascota.segundoApellido || '', frenteX + 6, cardY + 52);

  const datosMascota = [
    { label: 'ESPECIE:', value: mascota.especie },
    { label: 'SEXO:', value: mascota.sexo },
    { label: 'F. NAC.:', value: this.formatearFecha(mascota.fechaNacimiento) },
    { label: 'F. ADOP.:', value: this.formatearFecha(mascota.fechaAdopcion) },
    { label: 'CRDM:', value: mascota.claveRegistro }
  ];

  let yDatos = cardY + 14;
  const xIzq = frenteX + 30;
  const xDer = frenteX + 55;

  datosMascota.forEach(d => {
    doc.setFont('RobotoCondensed');
    doc.setFontSize(8);
    doc.text(d.label, xIzq, yDatos);
    doc.setFont('RobotoBold');
    doc.setFontSize(11);
    doc.text(d.value || '', xIzq, yDatos + 4);
    yDatos += 8;
  });

  doc.setFont('RobotoCondensed');
  doc.setFontSize(8);
  doc.text('RAZA:', xDer, cardY + 14);
  doc.setFont('RobotoBold');
  doc.setFontSize(11);
  doc.text(mascota.raza || '', xDer, cardY + 18);

  doc.addImage(fondoReverso, 'JPG', reversoX, cardY, cardWidth, cardHeight);

  doc.setFont('RobotoBold');
  doc.setFontSize(11);
  doc.text('Datos del Responsable', reversoX + cardWidth / 2, cardY + 14, { align: 'center' });

  const responsable = mascota.responsable || {};
  const emergencia = mascota.emergencia || {};

  let yRev = cardY + 20;
  const margenX = reversoX + 6;
  const espacioLabelValor = 3.5;
  const espacioEntreCampos = 8;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(7);
  doc.text('NOMBRE:', margenX, yRev);
  doc.setFont('RobotoBold');
  doc.setFontSize(9);
  doc.text(`${responsable.nombre || ''} ${responsable.primerApellido || ''} ${responsable.segundoApellido || ''}`, margenX, yRev + espacioLabelValor);

  yRev += espacioEntreCampos;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(7);
  doc.text('DIRECCIÓN:', margenX, yRev);
  doc.setFont('RobotoBold');
  doc.setFontSize(9);
  const maxWidth = cardWidth - 12;
  const direccionLines = doc.splitTextToSize(emergencia.domicilio || '', maxWidth);
  const direccionLimitada = direccionLines.slice(0, 2);
  doc.text(direccionLimitada, margenX, yRev + espacioLabelValor);

  yRev += espacioEntreCampos + (direccionLimitada.length > 1 ? 4 : 0);

  doc.setFont('RobotoCondensed');
  doc.setFontSize(7);
  doc.text('TELÉFONO:', margenX, yRev);
  doc.setFont('RobotoBold');
  doc.setFontSize(9);
  doc.text(emergencia.telefono || '', margenX, yRev + espacioLabelValor);

  yRev += espacioEntreCampos;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(7);
  doc.text('EMAIL:', margenX, yRev);
  doc.setFont('RobotoBold');
  doc.setFontSize(9);
  doc.text(emergencia.email || '', margenX, yRev + espacioLabelValor);

  const miniWidthCm = 4.5;
  const miniHeightCm = 2.5;

  const miniWidth = miniWidthCm * 10; 
  const miniHeight = miniHeightCm * 10; 

  const miniXFrente = frenteX;
  const miniXReverso = reversoX;
  const miniY = cardY + cardHeight + 10; 

  const fondoMini = await this.loadImageBase64('assets/imgs/credencialMini.jpg');

  doc.addImage(fondoMini, 'JPG', miniXFrente, miniY, miniWidth, miniHeight);


  const fotoMiniSize = 15;
  if (mascota.foto) {
    doc.addImage(mascota.foto, 'JPEG', miniXFrente + 2, miniY + 9, fotoMiniSize, fotoMiniSize);
  }

  const textoX = miniXFrente + 2 + fotoMiniSize + 2;
  let textoY = miniY + 11;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('NOMBRE:', textoX, textoY);

  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  doc.text(`${mascota.nombre || ''} ${mascota.primerApellido || ''}`, textoX, textoY + 2);

  textoY += 5;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('CRDM:', textoX, textoY);
  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  doc.text(mascota.claveRegistro || '', textoX, textoY + 2);

  textoY +=5;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('SEXO:', textoX, textoY);
  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  doc.text(mascota.sexo || '', textoX, textoY + 2);

  doc.addImage(fondoMini, 'JPG', miniXReverso, miniY, miniWidth, miniHeight);

  const responsableMini = mascota.responsable || {};
  const emergenciaMini = mascota.emergencia || {};

  let yMiniRev = miniY + 10;
  const centroMiniX = miniXReverso + miniWidth / 2;
  const espacioMini = 5;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('RESPONSABLE:', centroMiniX, yMiniRev, { align: 'center' });
  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  doc.text(`${responsableMini.nombre || ''} ${responsableMini.primerApellido || ''}`, centroMiniX, yMiniRev + 2, { align: 'center' });

  yMiniRev += espacioMini;

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('DIRECCIÓN:', centroMiniX, yMiniRev, { align: 'center' });
  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  const maxMiniWidth = miniWidth - 6;
  const dirLinesMini = doc.splitTextToSize(emergenciaMini.domicilio || '', maxMiniWidth);
  const dirLimitMini = dirLinesMini.slice(0, 2);
  doc.text(dirLimitMini, centroMiniX, yMiniRev + 2, { align: 'center' });

  yMiniRev += espacioMini + (dirLimitMini.length > 1 ? 2 : 0);

  doc.setFont('RobotoCondensed');
  doc.setFontSize(4);
  doc.text('TELÉFONO:', centroMiniX, yMiniRev, { align: 'center' });
  doc.setFont('RobotoBold');
  doc.setFontSize(6);
  doc.text(emergenciaMini.telefono || '', centroMiniX, yMiniRev + 2, { align: 'center' });

await this.guardarODescargarPDF(doc, `credencial-${mascota.nombre}`);
}

}
