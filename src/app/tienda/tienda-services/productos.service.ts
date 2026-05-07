import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

export interface Producto {
  id?: string; 
  producto: string;
  categoria: string;
  precio: number;
  enlaceAfiliado?: string;
  enlaceProducto?: string;
  imagenUrl: string;
  plataforma: string;
  descripcion: string;
  stock: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private coleccionProductos = 'productos'; 

  constructor(private firestore: Firestore) {}

  getProductos(): Observable<Producto[]> {
    const productosRef = collection(this.firestore, this.coleccionProductos);
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }

  getProductosPorCategoria(categoria: string): Observable<Producto[]> {
    return this.getProductos().pipe(
      map(productos => productos.filter(p => p.categoria === categoria))
    );
  }
}
