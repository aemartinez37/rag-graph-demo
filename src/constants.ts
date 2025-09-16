export const GRAPH_SCHEMA = `
Node Types:
    - Symbol

    Node Properties:
    - Symbol:
      - name: STRING

    Relationship Types:
    - DEFEATS
    - DRAWS

    Relationship Properties:
    - DEFEATS:
      - action: STRING
      - condition: STRING
    - DRAWS:
      - condition: STRING

    Relationship Patterns:
    - (:Symbol)-[:DEFEATS]->(:Symbol)
    - (:Symbol)-[:DRAWS]->(:Symbol)

Notes:
- Each node of type Symbol has just one outgoing directed relationship of type DEFEATS to one other node, and also one directed self-loop of type DRAWS.
- The DEFEATS relationship form a cyclic intransitive relation among all Symbol nodes.
- Each relationship between two nodes is considered a "rule".
`;
