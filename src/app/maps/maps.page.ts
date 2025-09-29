import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { FirebaseService } from '../firebase.service';
import { AlertController } from '@ionic/angular';

const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
const iconUrl = 'assets/icon/marker-icon.png';
const shadowUrl = 'assets/icon/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  map!: L.Map;

  private dataService = inject(DataService);
  private firebaseService = inject(FirebaseService);
  private alertCtrl = inject(AlertController);

  constructor() {}

  async loadPoints() {
    const points: any = await this.firebaseService.getPoints();
    points.forEach((point: any) => {
      const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
      const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
      marker.on('click', () => {
        this.openPointPopup(marker, point);
      });
    });
  }

  openPointPopup(marker: L.Marker, point: any) {
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
        <div style="padding:12px; min-width:200px; border-radius:12px; background:#fff; box-shadow:0 2px 8px rgba(56,128,255,0.08); border:1.5px solid #3880ff;">
          <div style='font-weight:600; color:#3880ff; font-size:1.1em; margin-bottom:2px;'>${point.name}</div>
          <div style='color:#222; font-size:0.95em; margin-bottom:8px;'>Koordinat: <span style='color:#666;'>${point.coordinates}</span></div>
          <div style="display:flex; gap:8px; margin-bottom:8px;">
            <button id="editBtn" style="flex:1; background:#3880ff; color:#fff; border:none; border-radius:6px; padding:6px 0; font-weight:500; cursor:pointer; transition:background 0.2s;">
              <span style='font-size:1.1em; vertical-align:middle;'>✏️</span> Edit
            </button>
            <button id="deleteBtn" style="flex:1; background:#ff4b5c; color:#fff; border:none; border-radius:6px; padding:6px 0; font-weight:500; cursor:pointer; transition:background 0.2s;">
              <span style='font-size:1.1em; vertical-align:middle;'>🗑️</span> Hapus
            </button>
          </div>
          <div id="editForm" style="display:none; margin-top:8px;">
            <input id="editName" type="text" value="${point.name}" placeholder="Nama Titik" style="width:100%;margin-bottom:6px;padding:6px;border-radius:5px;border:1px solid #ccc;"/><br>
            <input id="editCoord" type="text" value="${point.coordinates}" placeholder="Koordinat" style="width:100%;margin-bottom:6px;padding:6px;border-radius:5px;border:1px solid #ccc;"/><br>
            <div style="display:flex; gap:8px;">
              <button id="saveEditBtn" style="flex:1; background:#3880ff; color:#fff; border:none; border-radius:6px; padding:6px 0; font-weight:500; cursor:pointer;">Simpan</button>
              <button id="cancelEditBtn" style="flex:1; background:#e0e0e0; color:#222; border:none; border-radius:6px; padding:6px 0; font-weight:500; cursor:pointer;">Batal</button>
            </div>
          </div>
        </div>
      `;
  marker.bindPopup(popupContent);
  setTimeout(() => marker.openPopup(), 0);

    setTimeout(() => {
      const editBtn = popupContent.querySelector('#editBtn') as HTMLButtonElement;
      const deleteBtn = popupContent.querySelector('#deleteBtn') as HTMLButtonElement;
      const editForm = popupContent.querySelector('#editForm') as HTMLDivElement;
      const saveEditBtn = popupContent.querySelector('#saveEditBtn') as HTMLButtonElement;
      const cancelEditBtn = popupContent.querySelector('#cancelEditBtn') as HTMLButtonElement;

      editBtn.onclick = () => {
        editForm.style.display = 'block';
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
      };

      cancelEditBtn.onclick = () => {
        editForm.style.display = 'none';
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
      };

      saveEditBtn.onclick = async () => {
        const newName = (popupContent.querySelector('#editName') as HTMLInputElement).value;
        const newCoord = (popupContent.querySelector('#editCoord') as HTMLInputElement).value;
        await this.firebaseService.updatePoint(point.id, { name: newName, coordinates: newCoord });
        marker.closePopup();
        this.map.removeLayer(marker);
        // Tambah marker baru dengan data baru
        const newMarker = L.marker(newCoord.split(',').map((c: string) => parseFloat(c)) as L.LatLngExpression).addTo(this.map);
        this.openPointPopup(newMarker, { ...point, name: newName, coordinates: newCoord });
      };

      deleteBtn.onclick = async () => {
        const alert = await this.alertCtrl.create({
          header: 'Hapus Titik',
          message: `Yakin ingin menghapus titik <b>${point.name}</b>?`,
          buttons: [
            { text: 'Batal', role: 'cancel' },
            { text: 'Hapus', role: 'destructive', handler: async () => {
              await this.firebaseService.deletePoint(point.id);
              marker.closePopup();
              this.map.removeLayer(marker);
            }}
          ]
        });
        await alert.present();
      };
    }, 100);
  }

  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([-7.7956, 110.3695], 13);

        var osm = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors',
          }
        );

        osm.addTo(this.map)
      });
      // load points from Firebase
      this.loadPoints();
    }
  }

}
