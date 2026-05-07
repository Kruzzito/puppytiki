import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Noticia {
  id?: string;
  categoria: string;
  fechaHora: Date | null;  // siempre Date o null
  imagenUrl?: string;
  noticia: string;
  titulo: string;
  videoUrl?: string;
  autor?: string;
  autorOcupacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {

  constructor(private firestore: Firestore) {}

  private convertirFecha(valor: any): Date | null {
    if (!valor) return null;

    if (valor.toDate) return valor.toDate(); 
    if (valor.seconds) return new Date(valor.seconds * 1000); 
    if (typeof valor === 'string') return new Date(valor); 

    console.warn('fechaHora no reconocida:', valor);
    return null;
  }

  private mapNoticia(n: any): Noticia {
    return {
      id: n.id,
      categoria: n.categoria,
      fechaHora: this.convertirFecha(n.fechaHora),
      imagenUrl: n.imagenUrl,
      noticia: n.noticia,
      titulo: n.titulo,
      videoUrl: n.videoUrl,
      autor: n.autor,
      autorOcupacion: n.autorOcupacion
    };
  }

  private ordenarPorFecha(noticias: Noticia[]): Noticia[] {
    return noticias.sort((a, b) => {
      if (!a.fechaHora) return 1;
      if (!b.fechaHora) return -1;
      return b.fechaHora.getTime() - a.fechaHora.getTime();
    });
  }

  getNoticias(): Observable<Noticia[]> {
    const noticiasRef = collection(this.firestore, 'noticias');
    return collectionData(noticiasRef, { idField: 'id' }).pipe(
      map(noticias => this.ordenarPorFecha(noticias.map(n => this.mapNoticia(n))))
    );
  }

  getNoticiasPorCategoria(categoria: string): Observable<Noticia[]> {
    const noticiasRef = collection(this.firestore, 'noticias');
    const q = query(noticiasRef, where('categoria', '==', categoria));
    return collectionData(q, { idField: 'id' }).pipe(
      map(noticias => this.ordenarPorFecha(noticias.map(n => this.mapNoticia(n))))
    );
  }

  getCategorias(): Observable<string[]> {
    return this.getNoticias().pipe(
      map(noticias => ['todos', ...Array.from(new Set(noticias.map(n => n.categoria)))])
    );
  }
}
