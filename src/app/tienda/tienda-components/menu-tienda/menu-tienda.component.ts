import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-tienda.component.html',
  styleUrls: ['./menu-tienda.component.scss']
})
export class MenuTiendaComponent {
  @Input() categoriaSeleccionada: string = 'favoritos';
  @Output() cerrar = new EventEmitter<void>();
  @Output() categoriaChange = new EventEmitter<string>();

  categorias: string[] = ['ropa', 'juguetes', 'comida', 'accesorios', 'otros'];

  favoritosKey = 'favoritos';
  cerrando = false;

  constructor() {
    this.categorias = this.categorias.filter(c => c !== this.favoritosKey);
  }

  cerrarMenu() {
    this.cerrando = true;
  }

  animacionTerminada() {
    if (this.cerrando) {
      this.cerrar.emit();
      this.cerrando = false;
    }
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.categoriaChange.emit(categoria);
    this.cerrarMenu();
  }
}
