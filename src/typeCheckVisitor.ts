import { AbstractVisitor } from "./abstractVisitor";
import { Environment } from "./environment";
import {
  Assignment,
  Additive,
  Identifier,
  Multiplicative,
  MeasuredNumber,
  AstNode,
  PhysicalUnitEnum,
  GroupExpr,
} from "./types";

export class TypeCheckVisitor implements AbstractVisitor {
  
  constructor(private env: Environment<PhysicalUnitEnum>) { }
  
  visit(node: AstNode): PhysicalUnitEnum {
    // 1. Depending on the type of the AST node:
    switch (node.nodeType) {

      // 1.1. If it is a measured number, then:
      case "MeasuredNumber":
        // 1.1.1. Cast the node to type `MeasuredNumber`.
        node = node as MeasuredNumber;
        // 1.1.2. Return the physical unit of the node.
        return node.unit.kind;

      // 1.2. If it is a (???what???), then:
      case "GroupExpr":
        node = node as GroupExpr;
        return this.visit(node.subExpr);


      // 1.3. If it is an assignment statement, then:
      case "AssignmentStatement":
        node = node as Assignment;
        let expr = this.visit(node.expr);
        this.env.env.set(node.assignee.name, expr);
        return expr;

      // 1.4. If it is an identifier, then:
      case "Identifier":
        // 1.4.1. Cast the node to type `Identifier`.
        node = node as Identifier;
        // 1.4.2. Lookup the type (i.e., its physical unit) of the variable in the environment.
        let fromEnv = this.env.lookup(node.name, this.env);
        // 1.4.3. If the looked up type is not undefined, then:
        if (fromEnv !== undefined) {
          // 1.4.3.1. Return the looked up type.
          return fromEnv;
        } else {
          // 1.4.4. Otherwise, i.e., if the looked up type is undefined, then report an error.
          throw new Error("Variable " + node.name + " is not defined");
        }

      // 1.5. If it is an addition-like expression, then:
      case "Additive": {
        node = node as Additive;
        let left = this.visit(node.left);
        let right = this.visit(node.right);
        if (node.op.value === "+") {
          if (left === right) {
            return left;
          } else {
            throw new Error(
              "Incompatible types, " +
                left +
                " cannot be added with " +
                right
            );
          }
        } else if (node.op.value === "-") {
          if (left === right) {
            return left;
          } else {
            throw new Error(
              "Incompatible types, " +
                left +
                " cannot be subtracted with " +
                right
            );
          }
        }
      }

      // 1.6. It it is a multiplication-like expression, then:
      case "Multiplicative": {        
        node = node as Multiplicative;
        let left = this.visit(node.left);
        let right = this.visit(node.right);
        
        // 1.6.4. Depending on the operation `op` of the node:
        // 1.6.4.1. If it is `*`, then:
        if (node.op.value === "*") {
          // 1.6.4.1.1. If the physical quantity of `left` is (???what???) and the physical quantity of `right` is (???what???), or vice versa, then:
          if (left === right) {
            // 1.6.4.1.1.1. Return the physical unit representing length.
            return left;
          } else {
            // 1.6.4.1.2. Otherwise, report an error.
            throw new Error(
              "Incompatible types, " +
                left +
                " cannot be multiplied with " +
                right
            );
          }
        // 1.6.4.2. Otherwise, if it is `/`, then:
        } else if (node.op.value === "/") {
          if (left === right) {
            return left;
          }
          else {
            throw new Error(
              "Incompatible types, " +
                left +
                " cannot be divided with " +
                right
            );
          }
        }
        // 1.6.4.3. Otherwise, if it any other operator, report an error.
        throw new Error("Failure!");
      }

      // 1.7. Otherwise:
      default:
        // 1.7.1. Report an error.
        throw new Error("System failure, How did you do this?");
    }
  }
}
