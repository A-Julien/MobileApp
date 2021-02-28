import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowHidePasswordPage } from './show-hide-password.page';

describe('ShowHidePasswordPage', () => {
  let component: ShowHidePasswordPage;
  let fixture: ComponentFixture<ShowHidePasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowHidePasswordPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowHidePasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
