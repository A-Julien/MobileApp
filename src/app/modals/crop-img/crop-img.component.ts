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
      /*viewMode: 0,
      dragMode: 'move',
      autoCropArea: 1,
      minContainerWidth: 300,
      minContainerHeight: 300*/
      dragMode : 'move',
      background : true,
      movable: true,
      rotatable : true,
      scalable: true,
      zoomable: true,
      viewMode: 1,
      checkImageOrigin : true,
      checkCrossOrigin: true
    };
  }

  async finishCrop() {
    /*this.angularCropper.cropper.getCroppedCanvas().toBlob( blob => {
      const formData = new FormData();

      // Pass the image file name as the third parameter if necessary.
      formData.append('croppedImage', blob/*, 'example.png' );
      this.modalController.dismiss(formData);
    });
     await this.modalController.dismiss(this.angularCropper.cropper.getCroppedCanvas({
       width: 160,
       height: 90,
       minWidth: 256,
       minHeight: 256,
       maxWidth: 4096,
       maxHeight: 4096,
       fillColor: '#fff',
       imageSmoothingEnabled: false,
       imageSmoothingQuality: 'high',
     }).toDataURL('image/jpeg', 100));*/
    this.modalController.dismiss(this.angularCropper.cropper.getCroppedCanvas().toDataURL('image/jpeg'));
  }

}
