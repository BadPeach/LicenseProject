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
import {CircuitBuilderService, Expression} from '../services/circuit-builder.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CircuitAnalysisApiService} from '../services/circuit-analysis-api.service';
import {firstValueFrom} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';

class CircuitInformationModel {
  totalDelay: number;
  output: number;
  satisfyTimeConstraint: boolean;
}

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

  constructor (private clipboard: Clipboard,
               private circuitBuilder: CircuitBuilderService,
               private fb: FormBuilder,
               private circuitAnalysisApiService: CircuitAnalysisApiService,
               private spinner: NgxSpinnerService) {
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
    this.originalCircuitInfo = null;
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

  isOptimizedByAggregationDiagramViewerCollapsed = true;
  toggleOptimizedByAggregationDiagramViewerCollapse(): void {
    this.isOptimizedByAggregationDiagramViewerCollapsed = !this.isOptimizedByAggregationDiagramViewerCollapsed;
  }

  isOptimizedByBalancingTreeDiagramViewerCollapsed = true;
  toggleOptimizedByBalancingTreeDiagramViewerCollapse(): void {
    this.isOptimizedByBalancingTreeDiagramViewerCollapsed = !this.isOptimizedByBalancingTreeDiagramViewerCollapsed;
  }

  isOptimizedBySympyCNFDiagramViewerCollapsed = true;
  toggleOptimizedBySympyCNFDiagramViewerCollapse(): void {
    this.isOptimizedBySympyCNFDiagramViewerCollapsed = !this.isOptimizedBySympyCNFDiagramViewerCollapsed;
  }

  isOptimizedBySympyDNFDiagramViewerCollapsed = true;
  toggleOptimizedBySympyDNFDiagramViewerCollapse(): void {
    this.isOptimizedBySympyDNFDiagramViewerCollapsed = !this.isOptimizedBySympyDNFDiagramViewerCollapsed;
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

  @ViewChild('diagramOptimizedByAggregation')
  public diagramOptimizedByAggregation: DiagramComponent;
  public nodesOptimizedByAggregation: NodeModel[] = [];
  public connectorsOptimizedByAggregation: ConnectorModel[] = [];
  public optimizedByAggregationCircuitInfo: CircuitInformationModel;

  @ViewChild('diagramOptimizedByBalancingTree')
  public diagramOptimizedByBalancingTree: DiagramComponent;
  public nodesOptimizedByBalancingTree: NodeModel[] = [];
  public connectorsOptimizedByBalancingTree: ConnectorModel[] = [];
  public optimizedByBalancingTreeCircuitInfo: CircuitInformationModel;

  @ViewChild('diagramOptimizedBySympyCNF')
  public diagramOptimizedBySympyCNF: DiagramComponent;
  public nodesOptimizedBySympyCNF: NodeModel[] = [];
  public connectorsOptimizedBySympyCNF: ConnectorModel[] = [];
  public optimizedBySympyCNFCircuitInfo: CircuitInformationModel;

  @ViewChild('diagramOptimizedBySympyDNF')
  public diagramOptimizedBySympyDNF: DiagramComponent;
  public nodesOptimizedBySympyDNF: NodeModel[] = [];
  public connectorsOptimizedBySympyDNF: ConnectorModel[] = [];
  public optimizedBySympyDNFCircuitInfo: CircuitInformationModel;

  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.All & ~SnapConstraints.ShowLines | SnapConstraints.SnapToLines
  };

  public layout: LayoutModel = {
    type: 'HierarchicalTree',
    orientation: 'LeftToRight',   // or "TopToBottom", etc.
    horizontalSpacing: 50,
    verticalSpacing: 30,
    enableAnimation: true
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

  public optimizedByAggregationDiagramCreate(args: Object): void {
    this.diagramOptimizedByAggregation.fitToPage();
  }

  public optimizedByBalancingTreeDiagramCreate(args: Object): void {
    this.diagramOptimizedByBalancingTree.fitToPage();
  }

  public optimizedBySympyCNFDiagramCreate(args: Object): void {
    this.diagramOptimizedBySympyCNF.fitToPage();
  }

  public optimizedBySympyDNFDiagramCreate(args: Object): void {
    this.diagramOptimizedBySympyDNF.fitToPage();
  }

  /* Form for circuit analysis  */

  gateForm: FormGroup;
  gates: string[];
  inputs: string[];
  originalCircuitInfo: CircuitInformationModel = undefined;

  initializeForm(): void {
    // Create the main form group with nested groups for gates and inputs
    this.gateForm = this.fb.group({
      Delays: this.fb.group({
        Model: ['logical_effort', Validators.required],
        Params: this.fb.group({
          Tau: [5.0, Validators.required],
          GateTableLogicalEffort: this.fb.group({})
        })
      }),
      Inputs: this.fb.group({}),
      TimeConstraint: ['', Validators.required]
    });

    const gateTable = (this.gateForm.get('Delays.Params.GateTableLogicalEffort') as FormGroup);
    this.gates.forEach(gate => {
      const gateGroup = this.fb.group({
        override: [false],
        g: [{value: '', disabled: true}, Validators.required],
        p: [{value: '', disabled: true}, Validators.required]
      });
      gateTable.addControl(gate, gateGroup);
    });

    // Create dynamic controls for each input value
    this.inputs.forEach(input => {
      const inputsGroup = this.gateForm.get('Inputs') as FormGroup;
      inputsGroup.addControl(`${input}`, this.fb.control(0, Validators.required));
    });
  }

  getGateGroup(gate: string) {
    return this.gateForm.get(['Delays','Params','GateTableLogicalEffort', gate])!;
  }

  getParamsGateGroup(param: string) {
    return this.gateForm.get(['Delays','Params', param])!;
  }

  // call this from the template (on checkbox change)
  onOverrideChange(gate: string) {
    const grp = this.getGateGroup(gate);
    const ov = grp.get('override')!.value;

    if (ov) {
      grp.get('g')!.enable();
      grp.get('p')!.enable();
    } else {
      grp.get('g')!.reset('', {emitEvent: false});
      grp.get('p')!.reset('', {emitEvent: false});
      grp.get('g')!.disable();
      grp.get('p')!.disable();
    }
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
    this.spinner.show();
    firstValueFrom(this.circuitAnalysisApiService.analyzeCircuit(analyzerRequest))
      .then((response: any) => {
        console.log('Response from server:', response);
        this.analyzerResponse = response;

        // @ts-ignore
        this.originalCircuitInfo = this.analyzerResponse["options"]["OriginalCircuit"]

        let circuitOptimizedByAggregationDefinition = {
          // @ts-ignore
          inputs: this.parserResponse["parserScriptResponse"]["inputs"],
          // @ts-ignore
          outputs: this.parserResponse["parserScriptResponse"]["outputs"],
          // @ts-ignore
          gates: this.parserResponse["parserScriptResponse"]["gates"],
          // @ts-ignore
          expression_tree: this.analyzerResponse["options"]["AggregatedTreeCircuit"]["expressionTree"],
        };
        const optimizedByAggregationResponse = this.circuitBuilder.buildCircuit(circuitOptimizedByAggregationDefinition);
        this.nodesOptimizedByAggregation = optimizedByAggregationResponse.nodes;
        this.connectorsOptimizedByAggregation = optimizedByAggregationResponse.connectors;
        // @ts-ignore
        this.optimizedByAggregationCircuitInfo = this.analyzerResponse["options"]["AggregatedTreeCircuit"];

        let circuitOptimizedByBalancingTreeDefinition = {
          // @ts-ignore
          inputs: this.parserResponse["parserScriptResponse"]["inputs"],
          // @ts-ignore
          outputs: this.parserResponse["parserScriptResponse"]["outputs"],
          // @ts-ignore
          gates: this.parserResponse["parserScriptResponse"]["gates"],
          // @ts-ignore
          expression_tree: this.analyzerResponse["options"]["BalancedTreeCircuit"]["expressionTree"],
        };
        const optimizedByBalancingTreeResponse = this.circuitBuilder.buildCircuit(circuitOptimizedByBalancingTreeDefinition);
        this.nodesOptimizedByBalancingTree = optimizedByBalancingTreeResponse.nodes;
        this.connectorsOptimizedByBalancingTree = optimizedByBalancingTreeResponse.connectors;
        // @ts-ignore
        this.optimizedByBalancingTreeCircuitInfo = this.analyzerResponse["options"]["BalancedTreeCircuit"];

        let circuitOptimizedBySympyCNFDefinition = {
          // @ts-ignore
          inputs: this.parserResponse["parserScriptResponse"]["inputs"],
          // @ts-ignore
          outputs: this.parserResponse["parserScriptResponse"]["outputs"],
          // @ts-ignore
          gates: this.parserResponse["parserScriptResponse"]["gates"],
          // @ts-ignore
            expression_tree: this.analyzerResponse["options"]["SympyCNFOptimizedCircuit"]["expressionTree"],
        };
        const optimizedBySympyCNFResponse = this.circuitBuilder.buildCircuit(circuitOptimizedBySympyCNFDefinition);
        this.nodesOptimizedBySympyCNF = optimizedBySympyCNFResponse.nodes;
        this.connectorsOptimizedBySympyCNF = optimizedBySympyCNFResponse.connectors;
        // @ts-ignore
        this.optimizedBySympyCNFCircuitInfo = this.analyzerResponse["options"]["SympyCNFOptimizedCircuit"];

        let circuitOptimizedBySympyDNFDefinition = {
          // @ts-ignore
          inputs: this.parserResponse["parserScriptResponse"]["inputs"],
          // @ts-ignore
          outputs: this.parserResponse["parserScriptResponse"]["outputs"],
          // @ts-ignore
          gates: this.parserResponse["parserScriptResponse"]["gates"],
          // @ts-ignore
          expression_tree: this.analyzerResponse["options"]["SympyDNFOptimizedCircuit"]["expressionTree"],
        };
        const optimizedBySympyDNFResponse = this.circuitBuilder.buildCircuit(circuitOptimizedBySympyDNFDefinition);
        this.nodesOptimizedBySympyDNF = optimizedBySympyDNFResponse.nodes;
        this.connectorsOptimizedBySympyDNF = optimizedBySympyDNFResponse.connectors;
        // @ts-ignore
        this.optimizedBySympyDNFCircuitInfo = this.analyzerResponse["options"]["SympyDNFOptimizedCircuit"];

      })
      .catch((error: any) => {
        console.error('Error occurred while analyzing the circuit:', error);
      })
      .finally(() => {
        this.spinner.hide();
      })
    ;
  }
}
