import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NoticiaComponent } from './noticias-components/noticia/noticia.component';
import { MenuNoticiasComponent } from './noticias-components/menu-noticias/menu-noticias.component';
import { BuscadorComponent } from '../components/buscador/buscador.component';
import { NoticiasService, Noticia } from './noticias-services/noticias.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, IonicModule, NoticiaComponent, MenuNoticiasComponent, BuscadorComponent],
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss']
})
export class NoticiasPage implements OnInit {
  noticias$!: Observable<Noticia[]>;
  categorias$!: Observable<string[]>;
  private categoriaSeleccionada$ = new BehaviorSubject<string>('todos');
  private term$ = new BehaviorSubject<string>('');
  menuAbierto: boolean = false;
  categoriaActual: string = 'todos';

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    this.categorias$ = this.noticiasService.getCategorias();

    this.noticias$ = combineLatest([
      this.categoriaSeleccionada$.pipe(startWith('todos')),
      this.term$.pipe(startWith(''))
    ]).pipe(
      switchMap(([categoria, term]) => {
        const fuente$ =
          categoria === 'todos'
            ? this.noticiasService.getNoticias()
            : this.noticiasService.getNoticiasPorCategoria(categoria);

        const lowerTerm = (term || '').toLowerCase();

        return fuente$.pipe(
          map(noticias =>
            noticias.filter(
              n =>
                n.titulo.toLowerCase().includes(lowerTerm) ||
                n.noticia.toLowerCase().includes(lowerTerm)
            )
          )
        );
      })
    );
  }

  abrirMenu() {
    this.menuAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarMenu() {
    this.menuAbierto = false;
    document.body.style.overflow = '';
  }

  categoriaCambiada(nuevaCategoria: string) {
    this.categoriaSeleccionada$.next(nuevaCategoria);
    this.categoriaActual = nuevaCategoria;
    this.cerrarMenu();
  }

  onSearchChange(term: string) {
    this.term$.next(term);
  }

  verNoticia(noticia: Noticia) {
    console.log('Noticia seleccionada:', noticia);
  }
}
