import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { EditorView, basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export interface CodeViewConfig {
  content: string;
  language: 'sql' | 'javascript' | 'json' | 'html';
}

@Component({
  selector: 'app-code-view',
  templateUrl: './code-view.component.html',
  styleUrls: ['./code-view.component.css'],
  standalone: true
})
export class CodeViewComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  // Mock configuration that will be replaced by a real config pipe later
  mockConfig: CodeViewConfig = {
    content: 'SELECT * FROM users\nWHERE active = 1;',
    language: 'sql'
  };

  private editorView?: EditorView;

  ngOnInit() {
    this.initializeEditor();
  }

  ngOnDestroy() {
    this.editorView?.destroy();
  }

  private initializeEditor() {
    const extensions = [basicSetup];

    // Add syntax highlighting extension based on the mock config language
    switch (this.mockConfig.language) {
      case 'sql':
        extensions.push(sql());
        break;
      case 'javascript':
        extensions.push(javascript());
        break;
      case 'json':
        extensions.push(json());
        break;
      case 'html':
        extensions.push(html());
        break;
    }

    this.editorView = new EditorView({
      doc: this.mockConfig.content,
      extensions: extensions,
      parent: this.editorContainer.nativeElement
    });
  }
}
