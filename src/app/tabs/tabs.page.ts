import { Component, EnvironmentInjector, inject, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { paw, storefront, newspaper } from 'ionicons/icons';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  @ViewChild(IonTabs) tabs!: IonTabs;
  private backButtonSub?: Subscription;

  constructor(private platform: Platform, private router: Router) {
    addIcons({ paw, storefront, newspaper });
  }

  async onTabChange() {
    const selected = await this.tabs.getSelected();

    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) {
      tabBar.classList.remove('tab-mascotas', 'tab-tienda', 'tab-noticias');
      tabBar.classList.add(`tab-${selected}`);
    }
  }

  ngOnInit() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;
      if (!currentUrl.includes('/tabs/')) {
        await this.router.navigate(['/tabs/']);
        return;
      }
      App.exitApp();
    });
  }

  ngOnDestroy() {
    this.backButtonSub?.unsubscribe();
  }
}
