import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCollectsComponent } from './client-collects.component';

describe('ClientCollectsComponent', () => {
  let component: ClientCollectsComponent;
  let fixture: ComponentFixture<ClientCollectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCollectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientCollectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
