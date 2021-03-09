import { Injectable } from '@angular/core';
import {
  Plugins, CameraResultType, Capacitor, FilesystemDirectory,
  CameraPhoto, CameraSource, CameraOptions
} from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

export interface Photo {
  filepath: string;
  webviewPath: string;
}


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  constructor() { }

  public async takePictureDataUrl(): Promise<CameraPhoto> {
    return Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
      /*height: 1920,
      width: 1080*/
    });
  }

  public async takePicture(): Promise<CameraPhoto>{
    return  Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
      height: 1920,
      width: 1080
    });
  }
}
