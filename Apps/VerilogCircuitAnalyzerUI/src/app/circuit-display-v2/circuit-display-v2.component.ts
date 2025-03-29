import {Component, OnInit, ViewChild} from '@angular/core';
import {
  ConnectorModel,
  DiagramComponent, LayoutModel,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel
} from '@syncfusion/ej2-angular-diagrams';
import {CircuitBuilderService} from '../services/circuit-builder.service';

@Component({
  selector: 'app-circuit-display-v2',
  standalone: false,
  templateUrl: './circuit-display-v2.component.html',
  styleUrl: './circuit-display-v2.component.css'
})
export class CircuitDisplayV2Component implements OnInit {
  @ViewChild('diagramV2')
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

  constructor(private circuitBuilder: CircuitBuilderService) {}

  ngOnInit() {
    // Example input
    const definition = {
      inputs: ["a", "b", "c"],
      expression_tree: {
        "or": [
          {
            "and": [{"not": "a"}, "b"]
          },
          {
            "and": [
              {"and": ["b", "c"]},
              {"or": ["b", "c"]}
            ]
          }
        ]
      }
    };
    const definition2={
      "inputs": ["a", "b", "c"],
      "outputs": ["y"],
      "gates": [{
        "and": 1, "or": 1, "not": 1
      }],
      "expression_tree": {
        "or": [
          {
            "and": [
              "a",
              { "not": "b" }
            ]
          },
          {
            "or": [
              "b",
              { "not": "c" }
            ]
          }
        ]
      }
    }

    const definition3={
      "inputs": ["a", "b", "c"],
      "outputs": ["y"],
      "gates": [{
        "and": 1, "or": 1, "not": 1
      }],
      "expression_tree": {
        "and": [
          {
            "and": [
              {
                "not": {
                  "and": [
                    "A",
                    "B"
                  ]
                }
              },
              {
                "or": [
                  "B",
                  "C"
                ]
              }
            ]
          },
          {
            "xor": [
              "A",
              "C"
            ]
          }
        ]
      }
    }


    const {nodes, connectors} = this.circuitBuilder.buildCircuit(definition3);
    this.nodes = nodes;
    this.connectors = connectors;
  }

  // You can still define defaults
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
}
