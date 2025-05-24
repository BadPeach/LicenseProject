import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CircuitAnalysisApiService {
  public circuitAnalysisAPI = environment.circuitAnalysisAPI;

  constructor(private http: HttpClient) { }

  analyzeCircuit(circuitData: any): Observable<any> {
    return this.http.post(`${this.circuitAnalysisAPI}/analyzeCircuit`, circuitData);
  }
}
