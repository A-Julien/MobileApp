import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {CropperComponent, ImageCropperResult} from 'angular-cropperjs';

@Component({
  selector: 'app-crop-img',
  templateUrl: './crop-img.component.html',
  styleUrls: ['./crop-img.component.scss'],
})
export class CropImgComponent implements OnInit {
  cropperOptions: any;
  @Input() imageToCrop: string;
  @ViewChild('angularCropper') public angularCropper: CropperComponent;

  constructor(
      private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.cropperOptions = {
      dragMode: 'crop',
      autoCrop: true,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8
    };
  }

  async finishCrop() {
    await this.modalController.dismiss(this.angularCropper.cropper.getCroppedCanvas().toDataURL('image/jpeg'));
  }

}
