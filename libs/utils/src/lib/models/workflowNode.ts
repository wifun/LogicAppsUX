export type WorkflowNodeType = 'GRAPH_NODE' | 'SUBGRAPH_NODE' | 'OPERATION_NODE' | 'SCOPE_CARD_NODE' | 'SUBGRAPH_CARD_NODE' | 'HIDDEN_NODE';
export const WORKFLOW_NODE_TYPES: Record<string, WorkflowNodeType> = {
  GRAPH_NODE: 'GRAPH_NODE',
  SUBGRAPH_NODE: 'SUBGRAPH_NODE',
  OPERATION_NODE: 'OPERATION_NODE',
  SCOPE_CARD_NODE: 'SCOPE_CARD_NODE',
  SUBGRAPH_CARD_NODE: 'SUBGRAPH_CARD_NODE',
  HIDDEN_NODE: 'HIDDEN_NODE',
};

export type WorkflowEdgeType = 'BUTTON_EDGE' | 'HEADING_EDGE' | 'ONLY_EDGE' | 'HIDDEN_EDGE';
export const WORKFLOW_EDGE_TYPES: Record<string, WorkflowEdgeType> = {
  BUTTON_EDGE: 'BUTTON_EDGE',
  HEADING_EDGE: 'HEADING_EDGE',
  ONLY_EDGE: 'ONLY_EDGE',
  HIDDEN_EDGE: 'HIDDEN_EDGE',
};
