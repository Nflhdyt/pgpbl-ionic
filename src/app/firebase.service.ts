import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, remove, update } from 'firebase/database';
import { environment } from '../environments/environment';
const app = initializeApp(environment.firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  async getPoints(): Promise<any[]> {
    const dbRef = ref(database, 'points');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  }

  async deletePoint(id: string): Promise<void> {
    const pointRef = ref(database, `points/${id}`);
    await remove(pointRef);
  }

  async updatePoint(id: string, data: any): Promise<void> {
    const pointRef = ref(database, `points/${id}`);
    await update(pointRef, data);
  }
}
