import { Component, Renderer2 } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, create, trash, close, save, camera, menu, calendarNumber,
  arrowBack, caretBackOutline, caretForwardOutline,
  chevronUp, chevronDown, heart, heartOutline
} from 'ionicons/icons';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AdmobService } from './servicios/admob.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private statusBarOverlay!: HTMLElement;

  constructor(
    private renderer: Renderer2,
    private admob: AdmobService
  ) {
    addIcons({
      add, create, trash, heart, heartOutline,
      close, save, camera, menu, calendarNumber,
      arrowBack, caretBackOutline, caretForwardOutline,
      chevronUp, chevronDown
    });

    this.bootstrap();
  }

  private async bootstrap() {
    await this.configureStatusBarOverlay();
    this.createStatusBarOverlayDiv();

    await this.admob.init();
    await this.admob.prepareAll();
  }

  private async configureStatusBarOverlay() {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: '#00000000' });
    await StatusBar.setStyle({ style: Style.Light });
  }

  private createStatusBarOverlayDiv() {
    this.statusBarOverlay = this.renderer.createElement('div');
    this.renderer.setStyle(this.statusBarOverlay, 'position', 'fixed');
    this.renderer.setStyle(this.statusBarOverlay, 'top', '0');
    this.renderer.setStyle(this.statusBarOverlay, 'left', '0');
    this.renderer.setStyle(this.statusBarOverlay, 'width', '100%');
    this.renderer.setStyle(this.statusBarOverlay, 'height', 'var(--ion-safe-area-top, 24px)');
    this.renderer.setStyle(this.statusBarOverlay, 'z-index', '9999');
    this.renderer.setStyle(this.statusBarOverlay, 'pointer-events', 'none');
    this.renderer.setStyle(this.statusBarOverlay, 'transition', 'background-color 350ms ease');
    this.renderer.setStyle(this.statusBarOverlay, 'background-color', 'transparent');

    document.body.appendChild(this.statusBarOverlay);
  }
}
