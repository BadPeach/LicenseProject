import {Component, ViewChild} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Clipboard} from '@angular/cdk/clipboard';
import {HttpClient} from '@angular/common/http';
import {
  ConnectorModel,
  DiagramComponent, LayoutModel,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel
} from '@syncfusion/ej2-angular-diagrams';
import {CircuitBuilderService} from '../services/circuit-builder.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CircuitAnalysisApiService} from '../services/circuit-analysis-api.service';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-circuit-analyzer',
  standalone: false,
  templateUrl: './circuit-analyzer.component.html',
  styleUrl: './circuit-analyzer.component.css',

})
export class CircuitAnalyzerComponent {
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  parserResponse: {};
  analyzerResponse: {};
  private http: any;

  constructor (private clipboard: Clipboard,
               private circuitBuilder: CircuitBuilderService,
               private fb: FormBuilder,
               private circuitAnalysisApiService: CircuitAnalysisApiService) {
    this.uploader = new FileUploader({
      url: `${this.circuitAnalysisApiService.circuitAnalysisAPI}/processVerilogFile`,
      disableMultipart: false,
      autoUpload: false,
    });

    this.uploader.onAfterAddingFile = f => {
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0])
      }
    };

    this.hasBaseDropZoneOver = false;
    this.uploader.response.subscribe( res => {
      this.parserResponse = JSON.parse(res);
      // @ts-ignore
      let parserScriptResponse = this.parserResponse["parserScriptResponse"];
      const {nodes, connectors} = this.circuitBuilder.buildCircuit(parserScriptResponse);
      this.nodes = nodes;
      this.connectors = connectors;

      //initialize form data
      this.inputs = parserScriptResponse["inputs"];
      this.gates = Object.keys(parserScriptResponse["gates"]);
      this.initializeForm();
    } );


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
    this.analyzerResponse = null;
  }

  isParserResponseCollapsed = true; // implicit collapsed
  toggleParserResponseCollapse(): void {
    this.isParserResponseCollapsed = !this.isParserResponseCollapsed;
  }

  isDiagramViewerCollapsed = true;
  toggleDiagramViewerCollapse(): void {
    this.isDiagramViewerCollapsed = !this.isDiagramViewerCollapsed;
  }

  isAnalyzerResponseCollapsed = true;
  toggleAnalyzerResponseCollapse(): void {
    this.isAnalyzerResponseCollapsed = !this.isAnalyzerResponseCollapsed;
  }

  isOptimizedDiagramViewerCollapsed = true;
  toggleOptimizedDiagramViewerCollapse(): void {
    this.isOptimizedDiagramViewerCollapsed = !this.isOptimizedDiagramViewerCollapsed;
  }

  copyJson(targetObj: any): void {
    const jsonString = JSON.stringify(targetObj, null, 2);
    this.clipboard.copy(jsonString);
    console.log('JSON copied to clipboard!');
  }

  /***
   Circuit Analyzer
   */
  @ViewChild('diagramParsed')
  public diagram: DiagramComponent;

  public nodes: NodeModel[] = [];
  public connectors: ConnectorModel[] = [];

  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.All & ~SnapConstraints.ShowLines | SnapConstraints.SnapToLines
  };

  public layout: LayoutModel = {
    type: 'HierarchicalTree',
    orientation: 'LeftToRight',   // or "TopToBottom", etc.
    horizontalSpacing: 50,
    verticalSpacing: 30
  };

  public getNodeDefaults(node: NodeModel): NodeModel {
    node.style = { strokeColor: '#444' };
    return node;
  }

  public getConnectorDefaults(conn: ConnectorModel): ConnectorModel {
    conn.style = { strokeColor: '#444' };
    conn.targetDecorator = { shape: 'None' };
    return conn;
  }

  public diagramCreate(args: Object): void {
    this.diagram.fitToPage();
  }

  /* Form for circuit analysis  */

  gateForm: FormGroup;
  gates: string[];
  inputs: string[];

  initializeForm(): void {
    // Create the main form group with nested groups for gates and inputs
    this.gateForm = this.fb.group({
      GateDelays: this.fb.group({}),
      Inputs: this.fb.group({}),
      TimeConstraint: ['', Validators.required]
    });

    // Create a nested FormGroup for each gate
    const gatesGroup = this.gateForm.get('GateDelays') as FormGroup;
    this.gates.forEach(gate => {
      const gateGroup = this.fb.group({
        t0: ['', Validators.required],
        deltaT: [0.0, Validators.required]
      });
      gatesGroup.addControl(gate, gateGroup);
    });

    // Create dynamic controls for each input value
    this.inputs.forEach(input => {
      const inputsGroup = this.gateForm.get('Inputs') as FormGroup;
      inputsGroup.addControl(`${input}`, this.fb.control(0, Validators.required));
    });
  }

  onSubmitCircuitData(): void {
    if (this.gateForm.invalid) {
      this.gateForm.markAllAsTouched();
      return;
    }
    let analyzerRequest = this.gateForm.value;
    // @ts-ignore
    analyzerRequest["ASTCircuit"] = this.parserResponse["parserScriptResponse"]["expression_tree"]
    console.log('Request payload:', analyzerRequest);
    firstValueFrom(this.circuitAnalysisApiService.analyzeCircuit(analyzerRequest))
      .then((response: any) => {
        console.log('Response from server:', response);
        this.analyzerResponse = response;
      })
      .catch((error: any) => {
        console.error('Error occurred while analyzing the circuit:', error);
      });
  }
}
