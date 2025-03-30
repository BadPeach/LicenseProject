import {Component, ViewChild} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Clipboard} from '@angular/cdk/clipboard';
import {
  ConnectorModel,
  DiagramComponent, LayoutModel,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel
} from '@syncfusion/ej2-angular-diagrams';
import {CircuitBuilderService} from '../services/circuit-builder.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
  analyzerResponse: {};



  constructor (private clipboard: Clipboard,
               private circuitBuilder: CircuitBuilderService,
               private fb: FormBuilder) {
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
      gates: this.fb.group({}),
      inputs: this.fb.group({}),
      total_time_constraint: ['', Validators.required]
    });

    // Create a nested FormGroup for each gate
    const gatesGroup = this.gateForm.get('gates') as FormGroup;
    this.gates.forEach(gate => {
      const gateGroup = this.fb.group({
        t: ['', Validators.required],
        delta_t: [0.0, Validators.required]
      });
      gatesGroup.addControl(gate, gateGroup);
    });

    // Create dynamic controls for each input value
    this.inputs.forEach(input => {
      const inputsGroup = this.gateForm.get('inputs') as FormGroup;
      inputsGroup.addControl(`input_${input}`, this.fb.control(0, Validators.required));
    });
  }

  onSubmitCircuitData(): void {
    if (this.gateForm.invalid) {
      this.gateForm.markAllAsTouched();
      return;
    }
    console.log(this.gateForm.value);
  }
}
