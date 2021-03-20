import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListDetailsTodoPage } from './list-details-todo.page';

describe('ListDetailsTodoPage', () => {
  let component: ListDetailsTodoPage;
  let fixture: ComponentFixture<ListDetailsTodoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDetailsTodoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailsTodoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
