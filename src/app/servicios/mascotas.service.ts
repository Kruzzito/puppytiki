import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Mascota } from '../models/mascota.model';

@Injectable({
  providedIn: 'root',
})
export class MascotasService {
  private _mascotas = signal<Mascota[]>([]); 

  mascotas = this._mascotas.asReadonly();

  constructor(private storageService: StorageService) {
    this.loadMascotas();
  }

  async loadMascotas() {
    const stored = await this.storageService.get<Mascota[]>('mascotas');
    this._mascotas.set(stored || []);
  }

  async addOrUpdateMascota(mascota: Mascota) {
    const current = this._mascotas();
    const index = current.findIndex(m => m.id === mascota.id); 

    if (index >= 0) {
      current[index] = mascota; 
    } else {
      current.push(mascota); 
    }

    this._mascotas.set([...current]);
    await this.storageService.set('mascotas', this._mascotas());
  }

  async removeMascota(id: string) {
    const filtered = this._mascotas().filter(m => m.id !== id);
    this._mascotas.set(filtered);
    await this.storageService.set('mascotas', filtered);
  }

  getMascotaById(id: string): Mascota | undefined {
    return this._mascotas().find(m => m.id === id);
  }
}
