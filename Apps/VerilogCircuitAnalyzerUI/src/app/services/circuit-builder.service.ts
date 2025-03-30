import { Injectable } from '@angular/core';
import { ConnectorModel, NodeModel } from '@syncfusion/ej2-angular-diagrams';

// Union type for expressions
export type Expression =
  | string
  | { not?: Expression }
  | { and?: Expression[] }
  | { or?: Expression[] }
  | { xor?: Expression[] }
  | { nand?: Expression[] }
  | { nor?: Expression[] };

export interface CircuitDefinition {
  inputs: string[];
  outputs: string[];
  gates: any[];
  expression_tree: Expression;
}

@Injectable({ providedIn: 'root' })
export class CircuitBuilderService {
  private nodes: NodeModel[] = [];
  private connectors: ConnectorModel[] = [];

  // Horizontal offsets
  private baseX = 100;      // leftmost offset
  private deltaX = 150;     // spacing between depths

  // We'll measure "height" in abstract "slots"
  private slotHeight = 70;  // each slot is 70px

  private maxDepth = 0;     // highest nesting depth
  private andCount = 0;
  private orCount = 0;
  private notCount = 0;
  private norCount = 0;
  private nandCount = 0;
  private xorCount = 0;
  private varCount = 0;

  // For caching measureHeight results
  private sizeMap = new WeakMap<object, number>();

  constructor() {}

  /**
   * Builds the circuit layout (nodes/connectors) from the given definition.
   * Returns { nodes, connectors } for the Syncfusion Diagram.
   */
  public buildCircuit(def: CircuitDefinition) {
    // Reset
    this.nodes = [];
    this.connectors = [];
    this.andCount = 0;
    this.orCount = 0;
    this.notCount = 0;
    this.varCount = 0;
    this.sizeMap = new WeakMap<object, number>();

    // 1) measure max depth so we can "flip" horizontally
    console.log(def.expression_tree)
    this.maxDepth = this.measureMaxDepth(def.expression_tree, 0);

    // 2) measure how many "slots" the root subtree needs
    const totalSlots = this.measureHeight(def.expression_tree);

    // 3) parse & place nodes into [top=0 .. height=totalSlots]
    this.parseExpr(def.expression_tree, 0, 0, totalSlots);

    return {
      nodes: this.nodes,
      connectors: this.connectors
    };
  }

  // ------------------------------------------------------------------------
  //  1) measureHeight
  //
  //  Returns how many "slots" the subtree uses vertically:
  //    - string => 1
  //    - not => same as child
  //    - and/or => sum of children
  // ------------------------------------------------------------------------
  private measureHeight(expr: Expression): number {
    // If it's a string => 1 slot
    if (typeof expr === 'string') {
      return 1;
    }
    // If we've cached it already, return the cached value
    const maybeCached = this.sizeMap.get(expr);
    if (maybeCached !== undefined) {
      return maybeCached;
    }

    let size = 1; // fallback

    if ('not' in expr) {
      if (!expr.not) { // guard, though rarely needed
        throw new Error('Invalid NOT expression');
      }
      size = this.measureHeight(expr.not);
    } else if ('nand' in expr) {
      if (!expr.nand) {
        throw new Error('Invalid NAND expression');
      }
      size = expr.nand.reduce((sum, child) => sum + this.measureHeight(child), 0);
    } else if ('nor' in expr) {
      if (!expr.nor) {
        throw new Error('Invalid NOR expression');
      }
      size = expr.nor.reduce((sum, child) => sum + this.measureHeight(child), 0);
    } else if ('xor' in expr) {
      if (!expr.xor) {
        throw new Error('Invalid XOR expression');
      }
      size = expr.xor.reduce((sum, child) => sum + this.measureHeight(child), 0);
    } else if ('and' in expr) {
      if (!expr.and) {
        throw new Error('Invalid AND expression');
      }
      size = expr.and.reduce((sum, child) => sum + this.measureHeight(child), 0);
    } else if ('or' in expr) {
      if (!expr.or) {
        throw new Error('Invalid OR expression');
      }
      size = expr.or.reduce((sum, child) => sum + this.measureHeight(child), 0);
    } else {
      console.log(expr)
      throw new Error('Invalid expression: ' + JSON.stringify(expr));
    }

    // Cache & return
    this.sizeMap.set(expr, size);
    return size;
  }

  // ------------------------------------------------------------------------
  //  2) parseExpr
  //
  //  Recursively place this sub-expression in a vertical slice [top, top+height).
  //  depth => how deep we are in the tree
  //  We'll flip "depth" horizontally so final gate is on right.
  // ------------------------------------------------------------------------
  private parseExpr(
    expr: Expression,
    depth: number,
    top: number,
    height: number
  ): { nodeId: string; midSlot: number } {

    // X = left + "flipped" depth
    const effectiveDepth = this.maxDepth - depth;
    const offsetX = this.baseX + effectiveDepth * this.deltaX;

    // The "midSlot" is the vertical center of [top, top+height],
    // used so the parent's wires line up nicely
    const midSlot = top + height / 2;
    const offsetY = midSlot * this.slotHeight;

    // Branch by type
    if (typeof expr === 'string') {
      // It's a variable
      const nodeId = `var_${expr}_${this.varCount++}`;
      this.nodes.push({
        id: nodeId,
        offsetX,
        offsetY,
        width: 40,
        height: 40,
        annotations: [{ content: expr }],
        shape: { type: 'Basic', shape: 'Rectangle' }
      });
      return { nodeId, midSlot };
    }
    else if ('not' in expr) {
      if (!expr.not) {
        throw new Error('Invalid NOT expression');
      }
      // same vertical slice for the single child
      const childSize = this.measureHeight(expr.not);
      const childInfo = this.parseExpr(expr.not, depth + 1, top, childSize);
      return this.createGateNode('NOT', [childInfo], offsetX, offsetY);
    }
    else if ('and' in expr) {
      if (!expr.and) {
        throw new Error('Invalid AND expression');
      }
      // Subdivide the vertical region among child subexprs
      let childTop = top;
      const childrenInfo: Array<{ nodeId: string; midSlot: number }> = [];
      for (const child of expr.and) {
        const csize = this.measureHeight(child);
        const info = this.parseExpr(child, depth+1, childTop, csize);
        childrenInfo.push(info);
        childTop += csize;
      }
      return this.createGateNode('AND', childrenInfo, offsetX, offsetY);
    }
    else if ('or' in expr) {
      if (!expr.or) {
        throw new Error('Invalid OR expression');
      }
      // Subdivide among or-children
      let childTop = top;
      const childrenInfo: Array<{ nodeId: string; midSlot: number }> = [];
      for (const child of expr.or) {
        const csize = this.measureHeight(child);
        const info = this.parseExpr(child, depth+1, childTop, csize);
        childrenInfo.push(info);
        childTop += csize;
      }
      return this.createGateNode('OR', childrenInfo, offsetX, offsetY);
    }
    else if ('xor' in expr) {
      if (!expr.xor) {
        throw new Error('Invalid XOR expression');
      }
      // Subdivide among XOR children
      let childTop = top;
      const childrenInfo: Array<{ nodeId: string; midSlot: number }> = [];
      for (const child of expr.xor) {
        const csize = this.measureHeight(child);
        const info = this.parseExpr(child, depth + 1, childTop, csize);
        childrenInfo.push(info);
        childTop += csize;
      }
      return this.createGateNode('XOR', childrenInfo, offsetX, offsetY);
    } else if ('nand' in expr) {
      if (!expr.nand) {
        throw new Error('Invalid NAND expression');
      }
      // Subdivide among NAND children
      let childTop = top;
      const childrenInfo: Array<{ nodeId: string; midSlot: number }> = [];
      for (const child of expr.nand) {
        const csize = this.measureHeight(child);
        const info = this.parseExpr(child, depth + 1, childTop, csize);
        childrenInfo.push(info);
        childTop += csize;
      }
      return this.createGateNode('NAND', childrenInfo, offsetX, offsetY);
    } else if ('nor' in expr) {
      if (!expr.nor) {
        throw new Error('Invalid NOR expression');
      }
      // Subdivide among NOR children
      let childTop = top;
      const childrenInfo: Array<{ nodeId: string; midSlot: number }> = [];
      for (const child of expr.nor) {
        const csize = this.measureHeight(child);
        const info = this.parseExpr(child, depth + 1, childTop, csize);
        childrenInfo.push(info);
        childTop += csize;
      }
      return this.createGateNode('NOR', childrenInfo, offsetX, offsetY);
    }

    else {
      throw new Error('Invalid expression: ' + JSON.stringify(expr));
    }
  }


  public orData: string = `
  M 0,0
  C 10,0  60,40  0,80
  C 10,60  10,20  0,0
  Z
`;
  public andData: string = `
  M21.5,20.5
  h80
  a28,28,0,0,1,28,28
  v0
  a28,28,0,0,1,-28,28
  h-80
  v-56
  Z
  M129.5,48.5 L 130,48.5Z
`;


  public notData: string = 'M75.5,50.5l-52,28v-56L75.5,50.5z M81.5,50.5h18 M1.5,50.5h22 M78.5,47.5c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3  S80.2,47.5,78.5,47.5z';


  // ------------------------------------------------------------------------
  //  createGateNode
  //
  //  Place an AND/OR/NOT node at (offsetX, offsetY).
  //  Connect each child -> this gate.
  //  Return { nodeId, midSlot } so parents can center above their children.
  // ------------------------------------------------------------------------
  private createGateNode(
    gateType: 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR',
    children: Array<{ nodeId: string; midSlot: number }>,
    offsetX: number,
    offsetY: number
  ): { nodeId: string; midSlot: number } {

    let nodeId = '';
    let pathData = '';
    switch (gateType) {
      case 'AND':
        nodeId = `and_${this.andCount++}`;
        pathData = this.andData;
        break;
      case 'OR':
        nodeId = `or_${this.orCount++}`;
        pathData = this.orData;
        break;
      case 'NOT':
        nodeId = `not_${this.notCount++}`;
        pathData = 'M0,0 L40,20 L0,40 Z';
        break;
      case 'XOR':
        nodeId = `xor_${this.xorCount++}`;
        // The XOR shape is similar to OR but with an extra offset curve on the left.
        pathData = 'M5,0 C30,0 30,40 5,40 C0,30 0,10 5,0 Z';
        break;
      case 'NAND':
        nodeId = `nand_${this.nandCount++}`;
        // NAND is like an AND gate with a small inversion circle at the output.
        pathData = 'M0,0 L40,0 L40,40 Q20,40 0,40 Z M45,20 A5,5 0 1,1 44.9,20 Z';
        break;
      case 'NOR':
        nodeId = `nor_${this.norCount++}`;
        // NOR is like an OR gate with a small inversion circle.
        pathData = 'M0,0 C25,0 25,40 0,40 Z M30,20 A5,5 0 1,1 29.9,20 Z';
        break;
    }


    // Create the node
    this.nodes.push({
      id: nodeId,
      offsetX,
      offsetY,
      width: 40,
      height: 40,
      shape: { type: 'Path', data: pathData },
      annotations: [{ content: gateType }]
    });

    // Wire up children
    for (const c of children) {
      const connId = `conn_${c.nodeId}_to_${nodeId}`;
      this.connectors.push({
        id: connId,
        sourceID: c.nodeId,
        targetID: nodeId,
        type: 'Orthogonal'
      });
    }

    // The parent's "midSlot" is the average of the children's midSlots
    const parentMid =
      children.length > 0
        ? children.reduce((sum, c) => sum + c.midSlot, 0) / children.length
        : 0; // if no children, just 0

    return { nodeId, midSlot: parentMid };
  }

  // ------------------------------------------------------------------------
  //  measureMaxDepth
  //
  //  Just used to figure out how far right the root goes.
  //  Depth increments per child, final answer is the max depth found.
  // ------------------------------------------------------------------------
  private measureMaxDepth(expr: Expression, depth: number): number {
    let best = depth;

    if (typeof expr === 'string') {
      return depth;
    } else if ('not' in expr) {
      if (!expr.not) {
        throw new Error('Invalid NOT expression');
      }
      const d = this.measureMaxDepth(expr.not, depth + 1);
      if (d > best) best = d;
    } else if ('xor' in expr) {
      if (!expr.xor) {
        throw new Error('Invalid XOR expression');
      }
      for (const c of expr.xor) {
        const d = this.measureMaxDepth(c, depth + 1);
        if (d > best) best = d;
      }
    } else if ('nand' in expr) {
      if (!expr.nand) {
        throw new Error('Invalid NAND expression');
      }
      for (const c of expr.nand) {
        const d = this.measureMaxDepth(c, depth + 1);
        if (d > best) best = d;
      }
    } else if ('nor' in expr) {
      if (!expr.nor) {
        throw new Error('Invalid NOR expression');
      }
      for (const c of expr.nor) {
        const d = this.measureMaxDepth(c, depth + 1);
        if (d > best) best = d;
      }
    } else if ('and' in expr) {
      if (!expr.and) {
        throw new Error('Invalid AND expression');
      }
      for (const c of expr.and) {
        const d = this.measureMaxDepth(c, depth + 1);
        if (d > best) best = d;
      }
    } else if ('or' in expr) {
      if (!expr.or) {
        throw new Error('Invalid OR expression');
      }
      for (const c of expr.or) {
        const d = this.measureMaxDepth(c, depth + 1);
        if (d > best) best = d;
      }
    }
    else {
      throw new Error('Invalid expression: ' + JSON.stringify(expr));
    }
    return best;
  }
}
