// slider-productos.component.ts
import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../tienda-services/productos.service';
import { ProductoComponent } from '../producto/producto.component';
import { FavoritosService } from '../../tienda-services/favoritos.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-slider-productos',
  standalone: true,
  imports: [CommonModule, ProductoComponent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon],
  templateUrl: './slider-productos.component.html',
  styleUrls: ['./slider-productos.component.scss']
})
export class SliderProductosComponent implements AfterViewInit, OnDestroy {

  @Input() productos: Producto[] = [];
  @ViewChild('sliderContainer', { static: true }) sliderContainer!: ElementRef;
  @Output() favoritoToggled = new EventEmitter<Producto>();

  currentIndex = 0;
  touchStartX = 0;
  touchEndX = 0;
  autoSlideInterval: any;

  constructor(private favoritosService: FavoritosService) {}

  ngAfterViewInit() {
    this.updateTransform();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.productos.length;
      this.updateTransform();
    }, 3000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  onTouchStart(event: TouchEvent) {
    this.stopAutoSlide();
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
    this.startAutoSlide();
  }

  handleSwipe() {
    const delta = this.touchEndX - this.touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && this.currentIndex < this.productos.length - 1) {
        this.currentIndex++;
      } else if (delta > 0 && this.currentIndex > 0) {
        this.currentIndex--;
      }
      this.updateTransform();
    }
  }

  updateTransform() {
    const offset = -this.currentIndex * 100;
    this.sliderContainer.nativeElement.style.transform = `translateX(${offset}%)`;
  }

  abrirProducto(p: Producto) {
    const url = p.enlaceAfiliado || p.enlaceProducto;
    if (url) window.open(url, '_blank');
  }

  esFavorito(p: Producto) {
    return this.favoritosService.isFavorito(p);
  }

  toggleFavorito(p: Producto, event: Event) {
    event.stopPropagation();
    this.favoritosService.toggleFavorito(p);
    this.favoritoToggled.emit(p);
  }
}
