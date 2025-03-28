import { Component } from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {NgClass, NgFor, NgIf, NgStyle} from '@angular/common';

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
  response:string;

  constructor (){
    this.response = '';
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
    this.uploader.response.subscribe( res => this.response = JSON.parse(res) );
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
}
