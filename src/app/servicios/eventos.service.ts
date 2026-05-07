import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { v4 as uuidv4 } from 'uuid';

// Modelo de evento
export interface EventoAgenda {
  id: string;
  idMascota: string;
  nombreMascota: string;
  iconoEmoji: string;
  evento: string;
  fecha: string; 
  hora: string;
  lugar: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private storageKey = 'eventos_agenda';
  private eventosSubject = new BehaviorSubject<EventoAgenda[]>([]);
  eventos$ = this.eventosSubject.asObservable();

  eventosProximosPorMascota$ = (idMascota: string) => this.eventos$.pipe(
    filter(eventos => eventos !== null && eventos !== undefined), 
    map(eventos => {
      const ahora = new Date();
      return eventos
        .filter(e => e.idMascota === idMascota && new Date(`${e.fecha}T${e.hora}`) >= ahora)
        .sort((a, b) =>
          new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
        )
        .slice(0, 3);
    })
  );

  private eventos: EventoAgenda[] = [];

  constructor(private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    const eventosGuardados = await this.storage.get(this.storageKey);
    this.eventos = eventosGuardados || [];
    this.eventosSubject.next([...this.eventos]);
  }

  async agregarEvento(evento: Omit<EventoAgenda, 'id'> | EventoAgenda) {
    const id = 'id' in evento ? evento.id : uuidv4();
    const nuevoEvento: EventoAgenda = { ...evento, id };

    this.eventos.push(nuevoEvento);
    await this.storage.set(this.storageKey, this.eventos);
    this.eventosSubject.next([...this.eventos]);
  }

  async actualizarEvento(eventoActualizado: EventoAgenda) {
    this.eventos = this.eventos.map(e =>
      e.id === eventoActualizado.id ? eventoActualizado : e
    );
    await this.storage.set(this.storageKey, this.eventos);
    this.eventosSubject.next([...this.eventos]);
  }

  obtenerTodosLosEventos(): EventoAgenda[] {
    return [...this.eventos];
  }

  obtenerEventosPorMascota(idMascota: string): EventoAgenda[] {
    return this.eventos.filter(e => e.idMascota === idMascota);
  }

  obtenerProximosEventos(idMascota: string, cantidad: number = 3): EventoAgenda[] {
    const ahora = new Date();
    return this.eventos
      .filter(e => e.idMascota === idMascota && new Date(`${e.fecha}T${e.hora}`) >= ahora)
      .sort((a, b) =>
        new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
      )
      .slice(0, cantidad);
  }

  async eliminarEvento(id: string) {
    this.eventos = this.eventos.filter(e => e.id !== id);
    await this.storage.set(this.storageKey, this.eventos);
    this.eventosSubject.next([...this.eventos]);
  }

  async limpiarEventos() {
    this.eventos = [];
    await this.storage.remove(this.storageKey);
    this.eventosSubject.next([]);
  }
}
