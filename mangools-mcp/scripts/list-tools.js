import { ALL_DEFINITIONS, ALL_TOOLS } from "../index.js";

const counts = ALL_DEFINITIONS.reduce((acc, tool) => {
  const prefix = tool.name.split("_")[0];
  acc[prefix] = (acc[prefix] || 0) + 1;
  return acc;
}, {});

console.log(
  JSON.stringify(
    {
      total: ALL_TOOLS.length,
      counts,
      tools: ALL_TOOLS.map((tool) => tool.name),
    },
    null,
    2
  )
);
