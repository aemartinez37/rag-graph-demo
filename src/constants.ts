export const GRAPH_SCHEMA = `
Node Types:
- Move

Node Properties:
- Move:
  - name: STRING

Relationship Types:
- DEFEATS
  Properties:
    - action: STRING
- LOSES_TO
- TIES

Relationship Patterns:
- (:Move)-[:DEFEATS]->(:Move)
- (:Move)-[:LOSES_TO]->(:Move)
- (:Move)-[:TIES]->(:Move)
`;
