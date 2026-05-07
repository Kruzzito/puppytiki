// admob.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AdMob, InterstitialAdPluginEvents, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class AdmobService {
  private isInitialized = false;
  private interstitialAdId: string;
  private rewardedAdId: string;

  constructor(private platform: Platform) {
    this.interstitialAdId = environment.admob.interstitial;
    this.rewardedAdId = environment.admob.rewarded;
  }

  async init() {
    if (this.isInitialized) return;
    await this.platform.ready();
    try {
      await AdMob.initialize();
      this.isInitialized = true;

      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('Interstitial preparado');
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('Recompensa recibida:', reward);
      });

      console.log('AdMob inicializado correctamente con anuncios reales');
    } catch (err) {
      console.error('Error inicializando AdMob', err);
    }
  }

  async prepareInterstitial(): Promise<boolean> {
    if (!this.isInitialized) return false;
    try {
      await AdMob.prepareInterstitial({ adId: this.interstitialAdId });
      return true;
    } catch (err) {
      console.error('Error preparando interstitial', err);
      return false;
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.isInitialized) return false;
    try {
      await AdMob.showInterstitial();
      await this.prepareInterstitial();
      return true;
    } catch (err) {
      console.warn('Interstitial no disponible', err);
      return false;
    }
  }

  async prepareRewarded(): Promise<boolean> {
    if (!this.isInitialized) return false;
    try {
      await AdMob.prepareRewardVideoAd({ adId: this.rewardedAdId });
      return true;
    } catch (err) {
      console.error('Error preparando rewarded', err);
      return false;
    }
  }

  async showRewarded(): Promise<boolean> {
    if (!this.isInitialized) return false;
    try {
      await AdMob.showRewardVideoAd();
      await this.prepareRewarded();
      return true;
    } catch (err) {
      console.warn('Rewarded no disponible', err);
      return false;
    }
  }

  async prepareAll() {
    await this.prepareInterstitial();
    await this.prepareRewarded();
  }
}
