import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RmCatComponent } from './rm-cat.component';

describe('RmCatComponent', () => {
  let component: RmCatComponent;
  let fixture: ComponentFixture<RmCatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RmCatComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RmCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
