import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLarga'
})
export class FechaLargaPipe implements PipeTransform {
  transform(valor: string | Date): string {
    if (!valor) return '';

    let fecha: Date;

    if (valor instanceof Date) {
      fecha = valor;
    } else {
      const stringOriginal = valor.trim();

      if (stringOriginal.match(/T.*Z$/)) {
        fecha = new Date(stringOriginal);
      }
      else if (stringOriginal.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fecha = new Date(stringOriginal + 'T00:00:00');
      }
      else {
        fecha = new Date(stringOriginal);
      }
    }

    if (isNaN(fecha.getTime())) {
      console.warn('🚨 Fecha inválida en fechaLargaPipe:', valor);
      return 'Fecha inválida';
    }

    const fechaFormateada = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }
}
