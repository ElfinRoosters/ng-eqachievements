import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTaskComponent } from './client-task.component';

describe('ClientTaskComponent', () => {
  let component: ClientTaskComponent;
  let fixture: ComponentFixture<ClientTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
