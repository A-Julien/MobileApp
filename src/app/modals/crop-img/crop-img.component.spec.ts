import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CropImgComponent } from './crop-img.component';

describe('CropImgComponent', () => {
  let component: CropImgComponent;
  let fixture: ComponentFixture<CropImgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropImgComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CropImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
