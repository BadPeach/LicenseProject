import { Component } from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-circuit-analyzer',
  standalone: false,
  templateUrl: './circuit-analyzer.component.html',
  styleUrl: './circuit-analyzer.component.css',

})
export class CircuitAnalyzerComponent {
  backend_url: string = 'http://localhost:5283/api/CircuitAnalysis/processVerilogFile';
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  parserResponse: {};

  constructor (private clipboard: Clipboard) {
    this.uploader = new FileUploader({
      url: this.backend_url,
      disableMultipart: false,
      autoUpload: false,
    });

    this.uploader.onAfterAddingFile = f => {
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0])
      }
    };

    this.hasBaseDropZoneOver = false;
    this.uploader.response.subscribe( res => this.parserResponse = JSON.parse(res) );
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click();
    this.clearCircuitData();
  }

  clearCircuitData() {
    this.uploader.clearQueue();
    this.parserResponse = null;
  }

  isCollapsed = true; // implicit collapsed
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  copyJson(): void {
    const jsonString = JSON.stringify(this.parserResponse, null, 2);
    this.clipboard.copy(jsonString);
    console.log('JSON copied to clipboard!');
  }
}
