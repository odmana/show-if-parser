import { Any, All, Node, Ignore, Star, Rule, Y, Stack } from "./rd-parser";

// Library: https://github.com/dmaevsky/rd-parse
// Based on: https://github.com/dmaevsky/rd-parse-jsexpr/blob/master/src/grammar.js
export const ignoreWhitespace = (rule: Rule) => Ignore(/^\s+/, rule);

const srcMap = (obj: object, $: Partial<Stack>, $next: Partial<Stack>) =>
  Object.defineProperties(obj, {
    pos: { writable: true, configurable: true, value: $.pos },
    text: {
      writable: true,
      configurable: true,
      value: ($.text || $next.text!).slice($.pos, $next.pos),
    },
  });

const leftToRight = (parts: any[], $: Stack) => {
  let left = parts[0];

  for (let i = 1; i < parts.length; i += 2) {
    const [operator, right] = [parts[i].operator, parts[i + 1]];

    left = srcMap(
      {
        type: "binaryExpression",
        operator,
        left,
        right,
      },
      $,
      { pos: right.pos + right.text.length }
    );
  }
  return left;
};

const baseExpression = Y((expression) => {
  const StringToken = Any(
    /^('[^'\\]*(?:\\.[^'\\]*)*')/, // single-quoted
    /^("[^"\\]*(?:\\.[^"\\]*)*")/ // double-quoted
  );
  const NumericToken = /^([-+]?[0-9]*\.?[0-9]+)\b/; // decimal
  const BooleanToken = /^(true|false)\b/;
  const QuestionIdentifierToken = /^question\[(.*?)]/;
  const BinaryOperationsToken = /^(AND|OR)/;

  const stringLiteral = Node(StringToken, ([raw]) => ({
    type: "literal",
    value: eval(raw), // TODO: danger!!
    raw,
  }));

  const numericLiteral = Node(NumericToken, ([raw]) => ({
    type: "literal",
    value: parseFloat(raw),
    raw,
  }));

  const booleanLiteral = Node(BooleanToken, ([raw]) => ({
    type: "literal",
    value: raw === "true",
    raw,
  }));

  const literal = Any(stringLiteral, numericLiteral, booleanLiteral);

  const arrayLiteral = Node(
    All("[", Any(All("]"), All(literal, Star(All(",", literal)), "]"))),
    (elements) => ({ type: "arrayLiteral", elements })
  );

  const equalsExpression = Node(All("EQ", literal), ([value]) => ({
    type: "values",
    values: [value.value],
  }));

  const inExpression = Node(All("IN", arrayLiteral), ([array]) => ({
    type: "values",
    values: array.elements.map((v: { value: any }) => v.value),
  }));

  const rule = Node(
    All(QuestionIdentifierToken, Any(equalsExpression, inExpression)),
    ([question, values], $, $next) =>
      srcMap(
        {
          type: "rule",
          question,
          values: values.values,
        },
        $,
        $next
      )
  );

  const binaryOperator = (rule: Rule) =>
    Node(rule, (_, $, $next) => ({
      $,
      operator: $.text.substring($.pos, $next.pos),
    }));

  const expressionConstructor = (expr: Rule, operator: Rule) =>
    Node(All(expr, Star(All(binaryOperator(operator), expr))), leftToRight);

  const primaryExpression = Node(
    Any(rule, All("(", expression, ")")),
    ([expr], ...$$) => srcMap(expr, ...$$)
  );

  return expressionConstructor(primaryExpression, BinaryOperationsToken);
});

export const showIfExpression = ignoreWhitespace(baseExpression);
