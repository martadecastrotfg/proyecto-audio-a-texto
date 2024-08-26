import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionesusuarioComponent } from './sesionesusuario.component';

describe('SesionesusuarioComponent', () => {
  let component: SesionesusuarioComponent;
  let fixture: ComponentFixture<SesionesusuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SesionesusuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionesusuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
