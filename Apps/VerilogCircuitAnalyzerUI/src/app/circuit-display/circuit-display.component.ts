import {Component, ViewChild} from '@angular/core';
import {
  ConnectorBridging,
  ConnectorModel,
  DecoratorModel,
  Diagram,
  DiagramComponent,
  NodeModel,
  PathAnnotationModel,
  PointModel,
  PointPortModel,
  SnapConstraints,
  Snapping,
  SnapSettingsModel,
  UndoRedo
} from '@syncfusion/ej2-angular-diagrams';

Diagram.Inject(UndoRedo, ConnectorBridging, Snapping);

@Component({
  selector: 'app-circuit-display',
  standalone: false,
  templateUrl: './circuit-display.component.html',
  styleUrl: './circuit-display.component.css'
})
export class CircuitDisplayComponent {
  // Diagram Properties
  @ViewChild('diagram')
  public diagram: DiagramComponent;
  /* tslint:disable */
  public nodeY: number = 30;
  public orData: string = 'M21.7,76.5L21.7,76.5c6.4-18.1,6.4-37.8,0-55.9l0-0.1h1.6c21.5,0,41.7,10.4,54.2,28l0,0l0,0  c-12.5,17.6-32.7,28-54.2,28H21.7z M99.5,48.5l-22,0 M0,31.5h25 M0,65.5h25';
  public andData: string = 'M21.5,20.5h28a28,28,0,0,1,28,28v0a28,28,0,0,1-28,28h-28a0,0,0,0,1,0,0v-56a0,0,0,0,1,0,0Z M78,48.5 L 100,48.5Z M0,32.5 L 21.4,32.5Z M0,65.5 L 21.4,65.5Z';
  public notData: string = 'M75.5,50.5l-52,28v-56L75.5,50.5z M81.5,50.5h18 M1.5,50.5h22 M78.5,47.5c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3  S80.2,47.5,78.5,47.5z';


  // defines the shapes connection points
  public orPort: PointPortModel[] = [
    { id: 'Or_port1', offset: { x: 0.01, y: 0.1963 } }, { id: 'Or_port2', offset: { x: 0.26, y: 0.5 } },
    { id: 'Or_port3', offset: { x: 0.01, y: 0.805 } }, { id: 'Or_port4', offset: { x: 0.99, y: 0.5 } }
  ];
  public andPort: PointPortModel[] = [
    { id: 'And_port1', offset: { x: 0.01, y: 0.215 } }, { id: 'And_port2', offset: { x: 0.22, y: 0.5 } },
    { id: 'And_port3', offset: { x: 0.01, y: 0.805 } }, { id: 'And_port4', offset: { x: 0.99, y: 0.5 } }
  ];
  public notPort: PointPortModel[] = [
    { id: 'Not_port1', offset: { x: 0.01, y: 0.5 } }, { id: 'Not_port2', offset: { x: 0.99, y: 0.5 } }
  ];
  public decorator: DecoratorModel = {
    height: 12, width: 12, shape: 'Circle', style: { fill: 'white', strokeColor: '#444', strokeWidth: 1 }
  };
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.All & ~SnapConstraints.ShowLines | SnapConstraints.SnapToLines
  };

  public nodes: NodeModel[] = [
    this.createNode('OR1', 336, 161.5, 70, 80, this.orData, this.orPort),
    this.createNode('OR2', 336, 329, 70, 80, this.orData, this.orPort),
    this.createNode('OR3', 336, 470, 70, 80, this.orData, this.orPort),
    this.createNode('Not1', 157, 267, 58, 75, this.notData, this.notPort),
    this.createNode('Not2', 135, 329, 58, 75, this.notData, this.notPort),
    this.createNode('Not3', 157, 470, 58, 75, this.notData, this.notPort),
    this.createNode('And', 536, 329, 70, 80, this.andData, this.andPort)
  ];


  public connectors: ConnectorModel[] = [
    this.createConnector('line1', { x: 140, y: 130 }, null, null, 'OR1', null, 'Or_port1',this.decorator, null, { content: 'A', margin: { left: -20 } }, true),
    this.createConnector( 'line2', { x: 140, y: 161.5 }, null, null, 'OR1', null, 'Or_port2',this.decorator, null, { content: 'B', margin: { left: -20 } }, true ),
    this.createConnector('line3', { x: 140, y: 195 }, null, null, 'OR1', null, 'Or_port3',this.decorator, null, { content: 'C', margin: { left: -20 } }, true ),
    this.createConnector( 'line4', { x: 85, y: 267 }, null, null, 'Not1', null, 'Not_port1', this.decorator, null, { content: 'A', margin: { left: -20 } }),
    this.createConnector('line5', { x: 65, y: 329 }, null, null, 'Not2', null, 'Not_port1',this.decorator, null, { content: 'B', margin: { left: -20 } }),
    this.createConnector('line6', { x: 85, y: 470 }, null, null, 'Not3', null, 'Not_port1',this.decorator, null, { content: 'B', margin: { left: -20 } } ),
    this.createConnector('line7', null, null, 'Not1', 'OR2', 'Not_port2', 'Or_port1', null, null, { content: 'A\'', margin: { left: 0, top: -10 } }),
    this.createConnector('line8', null, null, 'Not2', 'OR2', 'Not_port2', 'Or_port2', null,null, { content: 'B\'', margin: { left: 0, top: -10 } }),
    this.createConnector('line9', { x: 140, y: 380 }, null, null, 'OR2', null, 'Or_port3',this.decorator, null, {content: 'C', margin: { left: -20 }}, true),
    this.createConnector('line10', { x: 140, y: 420 }, null, null, 'OR3',null, 'Or_port1', this.decorator, null, {content: 'A', margin: { left: -20 }}, true),
    this.createConnector('line11', null, null, 'Not3', 'OR3', 'Not_port2', 'Or_port2',null, null, { content: 'B\'', margin: { left: 0, top: -10 } }),
    this.createConnector('line12', { x: 140, y: 520 }, null, null, 'OR3', null, 'Or_port3',this.decorator, null, {content: 'C', margin: { left: -20 }}, true),
    this.createConnector('line13', null, null, 'OR1', 'And', 'Or_port4', 'And_port1',null, null, { content: '(A + B + C)', margin: { left: 0, top: -10 } }, true),
    this.createConnector('line14', null, null, 'OR2', 'And', 'Or_port4', 'And_port2',null, null, { content: '(A\' + B\' + C)', margin: { left: 0, top: -10 } }, true),
    this.createConnector('line15', null, null, 'OR3', 'And', 'Or_port4', 'And_port3',null, null, { content: '(A + B\' + C)', margin: { left: 0, top: -10 } }, true),
    this.createConnector('line16', null, { x: 600, y: 329 }, 'And', null, 'And_port4',null, null, this.decorator, { content: 'F =(A+B+C)*(A+B\'+C)*(A+B\'+C)', margin: { left: -80, top: 60 } }, true, true)
  ];


  public createNode(
    id: string, offsetX: number, offsetY: number, height: number, width: number,
    pathData: string, ports: PointPortModel[]): NodeModel {
    const node: NodeModel = {};
    node.id = id;
    node.offsetX = offsetX;
    node.offsetY = offsetY - this.nodeY;
    node.height = height;
    node.width = width;
    node.shape = { type: 'Path', data: pathData };
    node.ports = ports;
    return node;
  }
  public createConnector(
    id: string, sourcePoint: PointModel, targetPoint: PointModel,
    sourceID: string, targetID: string, sourcePortID: string, targetPortID: string,
    sourceDecorator: DecoratorModel, targetDecorator: DecoratorModel,
    annotation: PathAnnotationModel, segments?: boolean, isStraight?: boolean): ConnectorModel {
    // update connector properties
    const connector: ConnectorModel = {};
    connector.id = id;
    if (sourcePoint) {
      connector.sourcePoint = { x: sourcePoint.x, y: sourcePoint.y - this.nodeY };
    }
    if (targetPoint) {
      connector.targetPoint = { x: targetPoint.x, y: targetPoint.y - this.nodeY };
    }
    connector.sourceID = sourceID;
    connector.targetID = targetID;
    connector.type = isStraight ? 'Straight' : 'Orthogonal';
    connector.sourcePortID = sourcePortID;
    connector.targetPortID = targetPortID;
    // update connector annotation properties
    connector.annotations = [{
      content: annotation.content, offset: 0, margin: {
        left: (annotation.margin && annotation.margin.left) ? annotation.margin.left : 0,
        top: (annotation.margin && annotation.margin.top) ? annotation.margin.top : 0,
      },
      style: {
        fontFamily: 'Segoe UI',
        textWrapping: 'NoWrap', fontSize: 14,
      }
    }];
    // update connector decorators
    connector.sourceDecorator = sourceDecorator;
    connector.targetDecorator = targetDecorator;
    // update connector segments
    if (segments) {
      connector.segments = [{ length: 100, direction: 'Right', type: 'Orthogonal' }];
    }
    return connector;
  }

  // defines default node properties
  public getNodeDefaults(node: NodeModel): void {
    node.style.strokeWidth = 1;
    node.style.strokeColor = '#444';
  }
  // defines default connector properties
  public getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
    if (connector.id !== 'line16') {
      connector.targetDecorator.shape = 'None';
      connector.targetDecorator.style.strokeColor = '#444';
      connector.targetDecorator.style.fill = '#444';
    }
    connector.style = { strokeWidth: 1, strokeColor: '#444' };
    connector.cornerRadius = 5;
    return connector;
  }

  public diagramCreate(args: Object): void {
    this.diagram.fitToPage();
  }

}
