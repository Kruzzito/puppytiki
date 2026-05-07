import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _storage!: Storage;
  private STORAGE_KEY = 'legalAccepted';

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  async hasAcceptedLegal(): Promise<boolean> {
    const accepted = await this._storage.get(this.STORAGE_KEY);
    return accepted === true;
  }

  async acceptLegal(): Promise<void> {
    await this._storage.set(this.STORAGE_KEY, true);
  }

  async logout(): Promise<void> {
    await this._storage.remove(this.STORAGE_KEY);
  }
}
