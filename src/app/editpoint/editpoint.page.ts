import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { ToastController, LoadingController } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditPointPage implements OnInit {
  point: any = {};
  id: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadPoint();
  }

  async loadPoint() {
    this.loading = true;
    const points = await this.firebaseService.getPoints();
    this.point = points.find(p => p.id === this.id) || {};
    this.loading = false;
  }

  async save() {
    const loading = await this.loadingCtrl.create({ message: 'Menyimpan...' });
    await loading.present();
    await this.firebaseService.updatePoint(this.id, this.point);
    await loading.dismiss();
    this.showToast('Titik berhasil diupdate');
    this.router.navigate(['/point-list']);
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }
}
