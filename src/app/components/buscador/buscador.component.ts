import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.scss']
})
export class BuscadorComponent {

  @Input() placeholder: string = 'Buscar noticias...';
  @Output() searchChange = new EventEmitter<string>();

  term: string = '';

  onSearchChange() {
    this.searchChange.emit(this.term);
  }
}
