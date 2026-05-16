import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeViewComponent } from './code-view.component';

describe('CodeViewComponent', () => {
  let component: CodeViewComponent;
  let fixture: ComponentFixture<CodeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editor view on init', () => {
    expect(component['editorView']).toBeTruthy();
    const editorEl = fixture.nativeElement.querySelector('.cm-editor');
    expect(editorEl).toBeTruthy();
  });
});
