import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CircuitAnalysisApiService {
  public circuitAnalysisAPI = 'http://localhost:5283/api/CircuitAnalysis';

  constructor(private http: HttpClient) { }

  analyzeCircuit(circuitData: any): Observable<any> {
    return this.http.post(`${this.circuitAnalysisAPI}/analyzeCircuit`, circuitData);
  }
}
