import {
  Component,
  ElementRef,
  HostListener,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EventoAgenda } from 'src/app/servicios/eventos.service';

interface DiaCalendario {
  dia: number | null;
  fecha?: string;
}

type RitmoVibracion = 'vibrar-rapido' | 'vibrar-medio' | 'vibrar-lento';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent implements OnInit {
  @Input() eventos: EventoAgenda[] = [];
  @Input() modo: 'mascota' | 'completo' = 'completo';
  @Output() fechaSeleccionada = new EventEmitter<string>();

  today = new Date();
  currentYear = this.today.getFullYear();
  currentMonth = this.today.getMonth();
  selectedDate: string | null = null;

  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  dias: DiaCalendario[] = [];

  emojiExpandida: string | null = null;

  private ritmos: RitmoVibracion[] = ['vibrar-rapido', 'vibrar-medio', 'vibrar-lento'];

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.selectedDate = this.formatDateLocalISO(this.today);
    this.generarDiasCalendario();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.emojiExpandida = null;
    }
  }

  get monthYearLabel() {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }

  get daysInMonth() {
    return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  }

  get firstDayIndex() {
    let day = new Date(this.currentYear, this.currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  generarDiasCalendario() {
    const diasArray: DiaCalendario[] = [];

    for (let i = 0; i < this.firstDayIndex; i++) {
      diasArray.push({ dia: null });
    }

    for (let d = 1; d <= this.daysInMonth; d++) {
      const mesStr = String(this.currentMonth + 1).padStart(2, '0');
      const diaStr = String(d).padStart(2, '0');
      const fecha = `${this.currentYear}-${mesStr}-${diaStr}`;
      diasArray.push({ dia: d, fecha });
    }

    this.dias = diasArray;

    if (!this.dias.find((d) => d.fecha === this.selectedDate)) {
      const primerDia = this.dias.find((d) => d.dia !== null);
      this.selectedDate = primerDia?.fecha || null;
    }
  }

seleccionarDia(dia: number | null) {
  if (!dia) return;

  const mes = String(this.currentMonth + 1).padStart(2, '0');
  const diaStr = String(dia).padStart(2, '0');
  const fechaISO = `${this.currentYear}-${mes}-${diaStr}`;

  this.selectedDate = fechaISO;
  this.fechaSeleccionada.emit(fechaISO);

  // Toggle: si ya está expandido, lo cerramos
  this.emojiExpandida = this.emojiExpandida === fechaISO ? null : fechaISO;
}



  formatDateLocalISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFechaCompleta(fechaStr: string | null): string {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    return fecha
      .toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace(/\./g, '');
  }

  esHoy(dia: number | null): boolean {
    if (!dia) return false;
    const hoy = new Date();
    return (
      hoy.getDate() === dia &&
      hoy.getMonth() === this.currentMonth &&
      hoy.getFullYear() === this.currentYear
    );
  }

  estaEnProximas36Horas(fechaEvento: string, horaEvento?: string): boolean {
    const ahora = new Date();
    let fechaHoraEvento: Date;
    if (horaEvento) {
      fechaHoraEvento = new Date(`${fechaEvento}T${horaEvento}`);
    } else {
      fechaHoraEvento = new Date(fechaEvento + 'T00:00:00');
    }
    const diffMs = fechaHoraEvento.getTime() - ahora.getTime();
    return diffMs > 0 && diffMs <= 36 * 60 * 60 * 1000;
  }

obtenerEmojisParaFecha(
  fecha: string
): { emoji: string; vibrar: boolean; ritmo?: RitmoVibracion }[] {
  if (!fecha) return [];
  const fechaNorm = new Date(fecha).toDateString();

  const eventosDelDia = this.eventos.filter((ev) => {
    const evFechaNorm = new Date(ev.fecha).toDateString();
    return evFechaNorm === fechaNorm;
  });

  const mapaMascotas = new Map<
    string,
    { emoji: string; vibrar: boolean }
  >();

  let hayEventoProximo = false;

  eventosDelDia.forEach((ev) => {
    const eventoVibra = this.estaEnProximas36Horas(ev.fecha, ev.hora);
    if (eventoVibra) hayEventoProximo = true;

    if (!mapaMascotas.has(ev.idMascota)) {
      mapaMascotas.set(ev.idMascota, {
        emoji: ev.iconoEmoji,
        vibrar: eventoVibra,
      });
    } else {
      if (eventoVibra && !mapaMascotas.get(ev.idMascota)!.vibrar) {
        mapaMascotas.get(ev.idMascota)!.vibrar = true;
      }
    }
  });

  const emojisArray = Array.from(mapaMascotas.values()).map((item, index) => ({
    emoji: item.emoji,
    vibrar: item.vibrar,
    ritmo: this.ritmos[index % this.ritmos.length],
  }));

  if (this.modo === 'mascota') {
    return emojisArray.slice(0, 1);
  }

  const mostrarTodos = this.emojiExpandida === fecha;

  if (emojisArray.length <= 3 || mostrarTodos) {
    return emojisArray;
  }

  return [{ emoji: '➕', vibrar: hayEventoProximo, ritmo: 'vibrar-medio' }];
}



toggleExpandirEmojis(event: MouseEvent, fecha: string) {
  event.stopPropagation();

  if (this.emojiExpandida === fecha) {
    this.emojiExpandida = null;
  } else {
    this.selectedDate = fecha;
    this.fechaSeleccionada.emit(fecha);
    this.emojiExpandida = fecha;
  }
}



  cambiarDia(offset: number) {
    if (!this.selectedDate) {
      const hoy = new Date();
      this.selectedDate = this.formatDateLocalISO(hoy);
      this.currentYear = hoy.getFullYear();
      this.currentMonth = hoy.getMonth();
      this.generarDiasCalendario();
      return;
    }

    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const fechaActual = new Date(year, month - 1, day);
    fechaActual.setDate(fechaActual.getDate() + offset);

    if (
      fechaActual.getFullYear() !== this.currentYear ||
      fechaActual.getMonth() !== this.currentMonth
    ) {
      this.currentYear = fechaActual.getFullYear();
      this.currentMonth = fechaActual.getMonth();
      this.generarDiasCalendario();
    }

    this.selectedDate = this.formatDateLocalISO(fechaActual);
    this.fechaSeleccionada.emit(this.selectedDate);
    this.emojiExpandida = this.selectedDate;
  }

  mesAnterior() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.selectedDate = this.formatDateLocalISO(
      new Date(this.currentYear, this.currentMonth, 1)
    );
    this.generarDiasCalendario();
    this.emojiExpandida = this.selectedDate;
  }

  mesSiguiente() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.selectedDate = this.formatDateLocalISO(
      new Date(this.currentYear, this.currentMonth, 1)
    );
    this.generarDiasCalendario();
    this.emojiExpandida = this.selectedDate;
  }
}
