import { Injectable } from '@angular/core';
import { Producto } from './productos.service';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable ({ providedIn: 'root' })
export class FavoritosService {
  private favoritos: Producto[] = [];
  private storageReady = false;

  private favoritosSubject = new BehaviorSubject<Producto[]>([]);
  favoritos$ = this.favoritosSubject.asObservable();

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    await this.storage.create();
    this.favoritos = (await this.storage.get('favoritos')) || [];
    this.storageReady = true;
    this.favoritosSubject.next(this.favoritos);
  }

  private async guardarStorage() {
    if (!this.storageReady) return;
    await this.storage.set('favoritos', this.favoritos);
  }

  toggleFavorito(producto: Producto) {
    const index = this.favoritos.findIndex(p => p.id === producto.id);
    if (index > -1) {
      this.favoritos.splice(index, 1);
    } else {
      this.favoritos.push(producto);
    }
    this.guardarStorage();
    this.favoritosSubject.next(this.favoritos);
  }

  isFavorito(producto: Producto): boolean {
    return this.favoritos.some(p => p.id === producto.id);
  }

  getFavoritos(): Producto[] {
    return [...this.favoritos];
  }
}
