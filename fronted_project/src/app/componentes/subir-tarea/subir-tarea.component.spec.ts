import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirTareaComponent } from './subir-tarea.component';

describe('SubirTareaComponent', () => {
  let component: SubirTareaComponent;
  let fixture: ComponentFixture<SubirTareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubirTareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
