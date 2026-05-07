import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuTiendaComponent } from './tienda-components/menu-tienda/menu-tienda.component';
import { BuscadorComponent } from '../components/buscador/buscador.component';
import { SliderProductosComponent } from './tienda-components/slider-productos/slider-productos.component';
import { ProductoComponent } from './tienda-components/producto/producto.component';
import { IonContent, IonTitle, IonButton, IonButtons, IonToolbar, IonHeader, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';

import { ProductosService, Producto } from './tienda-services/productos.service';
import { FavoritosService } from './tienda-services/favoritos.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule,
    MenuTiendaComponent,
    SliderProductosComponent,
    BuscadorComponent,
    ProductoComponent,
    IonContent,
    IonTitle,
    IonIcon,
    IonButton,
    IonButtons,
    IonToolbar,
    IonHeader,
  ],
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss']
})
export class TiendaPage implements OnInit {
  mostrarMenu = false;
  categoriaSeleccionada: string = 'ropa';
  favoritosKey = 'favoritos';

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  categorias = ['ropa', 'juguetes', 'comida', 'accesorios', 'otros'];

  constructor(
    private productosService: ProductosService,
    private favoritosService: FavoritosService
  ) {
    addIcons({ 'menu-outline': menuOutline });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  cerrarMenu() {
    this.mostrarMenu = false;
  }

  onCategoriaChange(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.cerrarMenu();
    this.cargarProductos();
  }

  cargarProductos() {
    if (this.categoriaSeleccionada === this.favoritosKey) {
      this.productos = this.favoritosService.getFavoritos();
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosService.getProductosPorCategoria(this.categoriaSeleccionada)
        .subscribe(data => {
          this.productos = data;
          this.productosFiltrados = [...data];
        });
    }
  }

  filtrar(term: string) {
    const t = term.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.producto.toLowerCase().includes(t)
    );
  }

  toggleFavorito(producto: Producto) {
    // Ya se actualizó en el servicio desde el componente hijo
    if (this.categoriaSeleccionada === this.favoritosKey) {
      // Actualizamos la lista filtrada al instante
      this.productosFiltrados = this.favoritosService.getFavoritos();
    }
  }
}
