import { Token } from "./tokenizer";
import {
  AstNode,
  Identifier,
  Operator,
  PhysicalUnit,
  MeasuredNumber,
  Assignment,
  Statement,
  PrimitiveExpr,
  PhysicalUnitEnum,
  Distance,
  Time,
  Multiplicative,
  Additive,
  GroupExpr,
  Expr,
  Mass,
  Velocity,
} from "./types";

export function parseProgram(tokens: Token[]): AstNode[] {
  let currentPosition = -1;

  let AstNodes: AstNode[] = [];

  while (currentPosition < tokens.length - 1) {
    AstNodes.push(Statement());
  }

  return AstNodes;

  function getCurrentToken() {
    // 1. Return the element of array `tokens` at the current position.
    return tokens[currentPosition];
  }

  function advance(): void {
    // 1. Increment the value of `currentPosition` by 1.
    currentPosition++;
  }

  function peek() {
    // 1. Return the element of array `tokens` at a position immediately after the current position.
    return tokens[currentPosition + 1];
  }

  function error() {
    return new Error(
      "Parsing failed at position: " +
        currentPosition +
        ". The erroneous input token is: " +
        getCurrentToken().value
    );
  }

  
  
  /*** functions for terminal symbols of the grammar ***/

  
  
  function KeywordLet(): void {
    // 1. Peek the next input token.
    // 1.1. If it is the keyword `let`, then:
    if (peek().kind === "KeywordLet") {
      // 1.1.1. Advance the position of the parser.
      advance();
    }
    // 1.2. Otherwise, i.e., if it is not a keyword `let`, report an error.
    else throw error();
  }
  
  function Equals(): void {
    // 1. Peek the next input token.
    // 1.1. If it is an equality symbol `=`, then:
    // 1.1.1. Advance the position of the parser.
    // 1.2. Otherwise, i.e., if it is not an equality sign, report an error. 

    if (peek().kind === "Equals") {
      advance();
    }
    else throw error();
  }

  function Semicolon(): void {
    if (peek().kind === "Separator") {
      advance();
    }
    else throw error();
  }

  function OpeningBracket(): void {
    if (peek().kind === "OpeningBracket") {
      advance();
    }
    else throw error();
  }

  function ClosingBracket(): void {
    if (peek().kind === "ClosingBracket") {
      advance();
    }
    else throw error();
  }


  
  /*** functions for "special" terminal symbols that also have a value (these special terminals are: `NumericalLiteral`, `Identifier` and `PhysicalUnit`) ***/


  
  function NumericalLiteral(): number {
    // 1. Peek the next input token.
    // 1.1. If it is a numeric literal, then:
    // 1.1.1. Advance the position of the parser.
    // 1.2. Otherwise, i.e., if it is not a numeric literal, report an error.
    if (peek().kind === "Number") {
      advance();
    }
    else throw error();
    
    // 2. Return the numerical value of the token.
    return parseInt(peek().value, 10);
  }
  
  function Identifier(): Identifier {
    // 1. Peek the next input token.
    // 2. If its kind is `Identifier`, then:
    if (peek().kind === "Identifier") {
      // 2.1. Advance the position of the parser.
      advance();
      // 2.2. Return an object with two properties: `name` and `nodeType`.
      return {
        // 2.2.1. The property `name` should be the value of the current token.
        name: getCurrentToken().value,
        // 2.2.2. The property `nodeType` should be `Identifier`.
        nodeType: "Identifier"
      };
    }
    // 3. Throw an error otherwise (i.e., if the kind of the peek'ed token is not `Identifier`.
    throw error();
  }

  function PhysicalUnit(): PhysicalUnit {
    // 1. Advance the position of the parser.
    advance();
    // 2. Get the current token and store it in some variable.
    let unit = getCurrentToken();
    // 3. Check the kind of that token.
    // 3.1. If it is `PhysicalUnit`, then:
    if (unit.kind === "PhysicalUnit") {
      // 3.1.1. Store the value of the token in some variable.
      let unitValue = unit.value;
      // 3.1.2. If that value is one of the time units, then:
      if (["min", "s", "h"].includes(unitValue)) {
        // 3.1.2.1. Return an object with the following properties:
        return {
          // 3.1.2.1.1. Property `value` should be the value of the token, casted to type `Time`
          value: unitValue as Time,
          // 3.1.2.1.2. Property `kind` should be `PhysicalUnitEnum.Time`
          kind: PhysicalUnitEnum.Time,
          // 3.1.2.1.3. Property `nodeType` should be `PhysicalUnit`
          nodeType: "PhysicalUnit"
        };
      // 3.1.3. Otherwise, if that value is one of the mass units, then:
      } else if (["kg", "g", "mg"].includes(unitValue)) {
        // 3.1.3.1. Return an object with the following properties:
        // 3.1.3.1.1. Property `value` should be the value of the token, casted to type `Mass`
        // 3.1.3.1.2. Property `kind` should be `PhysicalUnitEnum.Mass`
        // 3.1.3.1.3. Property `nodeType` should be `PhysicalUnit`
        return {
          value: unitValue as Mass,
          kind: PhysicalUnitEnum.Mass,
          nodeType: "PhysicalUnit"
        };
        
      // 3.1.4. Otherwise, if that value is one of the (???what???) units, then:
      } else if (["m", "km"].includes(unitValue)) {
        return {
          value: unitValue as Distance,
          kind: PhysicalUnitEnum.Distance,
          nodeType: "PhysicalUnit"
        };
      } 
      // 3.1.5. Otherwise, if that value is one of the (???what???) units, then:
      else if(["km/h", "km/s" , "km/min" , "m/h" , "m/s" , "m/min"].includes(unitValue)){
        return {
          value: unitValue as Velocity,
          kind: PhysicalUnitEnum.Velocity,
          nodeType: "PhysicalUnit"
        };
      }
    }
    // 3.2. Otherwise, i.e., if the kind of the token is not `PhysicalUnit`, throw an error.
    throw error();
  }



  /*** functions for non-terminal symbols of the grammar ***/


  
  function Statement(): Statement {
    // 1.1. A statement is an assignment statement.
    // 1.2. Return a corresponding AST node.
    return AssignStatement();
  }

  function AssignStatement(): Assignment {
    // 1. Expect (i.e., consume) keyword `let`.
    KeywordLet();
    // 2. Expect an identifier, and store it in a variable.
    let assignee = Identifier();
    // 3. Expect an equality symbol `=`.
    Equals();
    // 4. Expect an expression, and store it in a variable.
    let expr = Expr();
    // 5. Expect a semicolon.
    Semicolon();
    // 6. Return an AST node that represents an assignment statement -- it is an object with:
    return {
      // 6.1. A property that represents the assignee (i.e., the variable that has been assigned to).
      assignee,
      // 6.2. A property that represents the expression on the right-hand side of the assignment statement.
      expr,
      // 6.3. A property `nodeType` which is (???what???).
      nodeType: expr.nodeType /* TODO: YOUR CODE HERE */
    };
  }

  function Expr(): Expr {
    switch (peek().kind) {
      case "OpAddSub":
        return Additive();
      case "OpMulDiv":
        return Multiplicative();
      case "Separator":
        return PrimitiveExpr();
      default:
        throw error();
    }
  }

  function GroupExpr(): GroupExpr {
    OpeningBracket();
    let subExpr = Expr();
    ClosingBracket();
    return {
      subExpr,
      nodeType: "GroupExpr"
    };
  }

  function PrimitiveExpr(): PrimitiveExpr {
    // 1. Peek the next input token.
    // 2. Depending on what this token is:
    switch (peek().kind) {
      // 2.1. If it is an identifier: 
      case "Identifier":
        // 2.1.1. Expect an identifier.
        // 2.1.2. Return an AST node that represents it.
        return Identifier();
      // 2.2. If it is a number:
      case "Number":
        // 2.2.1. Expect a measured number.
        // 2.2.2. Return an AST node that represents it.
        return MeasuredNumber();
      // 2.3. If it is a (???what???):
      case "OpeningBracket":
        return GroupExpr();
      // 2.4. Otherwise, if it is none of the above:
      default:
        // 2.4.1. Throw an error.
        throw error();
    }
  }

  function MeasuredNumber(): MeasuredNumber {
    let numericalValue = NumericalLiteral();
    let unit = PhysicalUnit();
    return {
      numericalValue,
      unit,
      nodeType: "MeasuredNumber"
    };
  }

  function OpAddSub(): Operator {
    // 1. Peek the next input token.
    // 1.1. If it is either `+` or `-`, then:
    if (peek().kind == "OpAddSub") {
      // 1.1.1. Advance the position of the parser.
      advance();
    }
    // 1.2. Otherwise, i.e., if it is not `+` or `-`, report an error.
    else throw error();
    // 2. Depending on the value of the token:
    switch (getCurrentToken().value) {
      // 2.1. If it is `+`, then:
      case "+":
        // 2.1.1. Return an AST node that represents an addition-like operator -- it is an object with:
        return {
          // 2.1.1.1. A property `value` which is `+`.
          value: "+",
          // 2.1.1.2. A property `nodeType` which is `OpAddSub`.
          nodeType: "OpAddSub"
        };
      // 2.2. If it is `-`, then:
      case "-":
        return{
          value: "-",
          nodeType: "OpAddSub"
        }
      // 2.3. Otherwise, i.e., if it is neither `+` nor `-`:
      default:
        // 2.3.1. Throw an error.
        throw error();
    }
  }

  function OpMulDiv(): Operator {
    if (peek().kind === "OpMulDiv") {
      advance();
    }
    switch (getCurrentToken().value) {
      case "*":
        return {
          value: "*",
          nodeType: "OpMulDiv"
        };
      case "/":
        return {
          value: "/",
          nodeType: "OpMulDiv"
        };
      default:
        throw error();
  }
}

  function Additive(): PrimitiveExpr | Multiplicative | Additive {
    // 1. Expect a multiplicative expression, and store it in a variable.
    let left: PrimitiveExpr | Multiplicative | Additive = Multiplicative();
    // 2. Emulate repetition in the grammar `{ ... }*` by peeking the next input token. See also item 2.2. below.
    // 2.1. Check whether that peek'ed token is `+` or `-`.
    while (peek().kind === "OpAddSub") {
      // 3. Expect (i.e., consume) that peek'ed token, and store it in a variable.
      let op = OpAddSub();
      // 4. Expect a multiplicative expression, and store it in a variable.
      let right = Multiplicative();
      // 5. Update the expression stored in item 1. to be an AST node that represents an additive expression -- it is an object with: 
      left = {
        // 5.1. A property that represents the left operand of the multiplicative expression.
        left,
        // 5.2. A property that represents the operator of the multiplicative expression.
        op,
        // 5.3. A property that represents the right operand of the multiplicative expression.
        right,
        // 5.4. A property `nodeType` which is (???what???).
        nodeType: "Additive",
      };
    // 2.2. Make an iteration of the loop to process the possible remaining part of the addition-like expression.
    }
    // 5.5. Return the AST node.
    return left;
  }

  function Multiplicative(): Multiplicative | PrimitiveExpr {
    let left: PrimitiveExpr | Multiplicative = PrimitiveExpr();
    while (peek().kind === "OpMulDiv") {
      let op = OpMulDiv();
      let right = PrimitiveExpr();
      left = {
        left,
        op,
        right,
        nodeType: "Multiplicative"
      };
    }
    return left;
  }

}
