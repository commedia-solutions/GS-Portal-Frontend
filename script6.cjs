const fs = require("fs");
const path = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\3e2ea792-1071-41ad-9460-05bb17bd91e5\\scratch\\dashboard_changes.txt";
const text = fs.readFileSync(path, "utf-8");
const changes = text.split("\n\n---\n\n").filter(Boolean).map(s => JSON.parse(s));

let content = "";
for (const change of changes) {
  if (change.CodeContent !== undefined) {
    content = change.CodeContent;
  } else if (change.TargetContent !== undefined && change.ReplacementContent !== undefined) {
    if (content.includes(change.TargetContent)) {
       content = content.replace(change.TargetContent, change.ReplacementContent);
    } else {
       console.log("Failed to apply a replace: ", change.TargetContent.substring(0, 50));
    }
  }
}

fs.writeFileSync("src/pages/Monitoring/Dashboard.tsx", content);
console.log("Replayed " + changes.length + " changes successfully.");
