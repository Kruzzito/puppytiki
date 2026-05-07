import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
    this.storageReady = true;
  }

  async set(key: string, value: any): Promise<void> {
    if (!this.storageReady) await this.init();
    await this.storage.set(key, value);
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.storageReady) await this.init();
    return this.storage.get(key);
  }

  async remove(key: string): Promise<void> {
    if (!this.storageReady) await this.init();
    await this.storage.remove(key);
  }

  async clear(): Promise<void> {
    if (!this.storageReady) await this.init();
    await this.storage.clear();
  }

  async keys(): Promise<string[]> {
    if (!this.storageReady) await this.init();
    return this.storage.keys();
  }
}
