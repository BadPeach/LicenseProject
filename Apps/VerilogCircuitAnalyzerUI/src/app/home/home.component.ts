import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedText: string = '';

  sampleFiles = [
    'example_0.v',
    'example_1.v',
    'example_2.v',
    'example_3.v',
    'example_4.v',
    'example_5.v',
    'example_6.v',
  ];

  constructor(private http: HttpClient) {}

  displayContent(filename: string): void {
    this.http.get(`samples/${filename}`, { responseType: 'text' })
      .subscribe(data => {
        this.selectedText = data;
      });
  }

  downloadFile(filename: string): void {
    const url = `samples/${filename}`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  }
}
