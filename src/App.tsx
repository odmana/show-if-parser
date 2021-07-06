import React from "react";
import { showIfExpression } from "./showIfParser";
import { Parser } from "./rd-parser";

// Examples: 
// question[q.survey.do.you.have.health.insurance] IN [true]
// question[q.survey.height] IN [123]
// question[q.survey.do.you.have.health.insurance] IN ["Yes"]
// question[q.survey.do.you.have.health.insurance] IN ["Yes", "No"]
// question[q.survey.do.you.have.health.insurance] EQ "Yes"
// question[q.survey.do.you.have.health.insurance] IN ["Yes", "No"] AND question[q.survey.height] IN [123]
// question[q.survey.do.you.have.health.insurance] IN ["Yes", "No"] AND (question[q.survey.individual] EQ true OR question[q.survey.height] IN [123])

const defaultInput = 'question[q.survey.do.you.have.health.insurance] IN ["Yes", "No"] AND (question[q.survey.individual] EQ true OR question[q.survey.height] IN [123])'

const App: React.FC = () => {
  const [input, setInput] = React.useState<string>(defaultInput);
  const [output, setOutput] = React.useState<string>();

  const doTheThing = () => {
    try {
      const parser = Parser(showIfExpression);
      const ast = parser(input ?? "");
      setOutput(JSON.stringify(ast, null, 2));
    } catch (e) {
      setOutput("Error: " + e?.message);
      console.error(e);
    }
  };

  return (
    <div className="container px-4 py-4">
      <h1 className="text-2xl mb-4">Parser Playground</h1>
      <div className="flex flex-col w-96">
        <textarea
          className="border border-gray-300 rounded-md p-2"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <button
          className="my-4 px-8 py-3 font-medium rounded-md text-white bg-indigo-600"
          onClick={doTheThing}
        >
          Do the thing
        </button>
        <textarea
          className="border border-gray-300 rounded-md p-2 font-mono"
          disabled
          rows={20}
          value={output}
        ></textarea>
      </div>
    </div>
  );
};

export default App;
