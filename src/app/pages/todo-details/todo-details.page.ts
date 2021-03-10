import {Component, OnInit} from '@angular/core';
import {Todo} from '../../models/todo';
import {ActivatedRoute} from '@angular/router';
import {ListService} from '../../services/list.service';
import {CropImgComponent} from '../../modals/crop-img/crop-img.component';
import {Network} from '@capacitor/core';
import {PhotoService} from '../../services/photo.service';
import {OcrProviderService} from '../../services/ocr-provider.service';
import {PopupService} from '../../services/popup.service';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {

  public todo: Todo;
  private listId: string;
  private todoId: string;
  public todoContent;

  constructor(
      private route: ActivatedRoute,
      private listService: ListService,
      private photoService: PhotoService,
      public modalController: ModalController,
      private ocrService: OcrProviderService,
      private popUpService: PopupService) {
    this.todo = new Todo('', '');
  }

  ngOnInit() {
    this.todoId = this.route.snapshot.paramMap.get('todoId');
    this.listId = this.route.snapshot.paramMap.get('listId');

    /*this.todo = this.listService.getOneDB(listId).pipe(
        map( data => {
          return data.todos.find(todo => todo.id === todoId);
        })
    );*/
    this.listService.getOneTodo(this.listId, this.todoId).subscribe( (t) => {
      this.todo = t;
    });
    // this.todo.subscribe(m => {console.log('INTODO', m); });
    /*this.todo = this.listService.getOneDB(listId).pipe(
      map(list => {
            return list.todos.find( todo => todo.id === todoId);
          }
      )
    );*/
  }

  save() {
    this.todo.id = this.todoId;
    this.listService.updateTodo(this.todo, this.listId);
  }

  async OcrDigital(type: string) {

    // const picture = await  this.photoService.takePicture();
    const picture = await  this.photoService.takePictureDataUrl();
    const loader = await this.popUpService.presentLoading('Processing...');
    const modal = await this.modalController.create({
      component: CropImgComponent,
      cssClass: ['crop-modal'],
      componentProps: {
        imageToCrop: picture?.dataUrl
      }
    });

    await modal.present().then(() => loader.dismiss());
    const { data } = await modal.onWillDismiss();

    const status = await Network.getStatus();
    let TextOcr = '';
    if (status.connected){
      if (type === 'document'){
        const obRes = await this.ocrService.OnLineOcrGoogleVisio(data.substring(23), this.ocrService.DOCUMENT_TEXT_TYPE);
        const response = await obRes.toPromise();
        // @ts-ignore
        TextOcr = response.responses[0].fullTextAnnotation.text;
      }
      if (type === 'handWriter'){
        const obRes = await this.ocrService.OnLineOcrGoogleVisio(data.substring(23), this.ocrService.DOCUMENT_HAND_TYPE);
        const response = await obRes.toPromise();
        // @ts-ignore
        TextOcr = response.responses[0].fullTextAnnotation.text;
      }
      // firebas-tools
      //ng add @angular/pwa
      // this.listService.creatTodo(new Todo('testOCR', TextOcr), this.listId);
      this.todo.content = this.todo.content + '\n' + TextOcr;
      return;
    }

    TextOcr = await this.ocrService.offLineOcrTesseract(data);
    this.todo.content = this.todo.content + '\n' + TextOcr;
    // this.listService.creatTodo(new Todo('testOCR', TextOcr), this.listId);
  }
}
