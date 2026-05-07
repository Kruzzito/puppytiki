import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-noticias.component.html',
  styleUrls: ['./menu-noticias.component.scss']
})
export class MenuNoticiasComponent {
  @Input() categoriaSeleccionada: string = '';
  @Input() categorias: string[] = []; 
  @Output() cerrar = new EventEmitter<void>();
  @Output() categoriaChange = new EventEmitter<string>();

  cerrando = false;

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
