const fs = require("fs");
const path = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\3e2ea792-1071-41ad-9460-05bb17bd91e5\\.system_generated\\logs\\transcript_full.jsonl";
const lines = fs.readFileSync(path, "utf-8").split("\n");

let logs = [];
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.function.name === "default_api:write_to_file" || tc.function.name === "default_api:replace_file_content") {
          const args = JSON.parse(tc.function.arguments);
          if (args.TargetFile && args.TargetFile.includes("Dashboard.tsx")) {
             logs.push(JSON.stringify(args, null, 2));
          }
        }
      }
    }
  } catch (e) {}
}

fs.writeFileSync("C:\\Users\\DELL\\.gemini\\antigravity\\brain\\3e2ea792-1071-41ad-9460-05bb17bd91e5\\scratch\\dashboard_changes.txt", logs.join("\n\n---\n\n"));
console.log("Extracted " + logs.length + " changes.");
