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
- DRAWS:
  - action: STRING

Relationship Patterns:
- (:Symbol)-[:DEFEATS]->(:Symbol)
- (:Symbol)-[:DRAWS]->(:Symbol)
`;
