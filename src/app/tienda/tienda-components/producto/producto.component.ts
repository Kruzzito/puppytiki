import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../tienda-services/productos.service';
import { FavoritosService } from '../../tienda-services/favoritos.service';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent {
  @Input() producto!: Producto;
  @Output() favoritoToggled = new EventEmitter<Producto>();

  constructor(
    private favoritosService: FavoritosService,
    private platform: Platform
  ) {}

  toggleFavorito() {
    this.favoritosService.toggleFavorito(this.producto);

    this.favoritoToggled.emit(this.producto);
  }

  esFavorito(): boolean {
    return this.favoritosService.isFavorito(this.producto);
  }

  abrirEnlace() {
    const url = this.producto.enlaceAfiliado || this.producto.enlaceProducto;
    if (!url) return;

    if (this.platform.is('android')) {
      window.open(url, '_system');
    } else {
      window.open(url, '_blank');
    }
  }
}
