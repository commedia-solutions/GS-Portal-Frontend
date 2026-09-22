const fs = require("fs");
const path = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\3e2ea792-1071-41ad-9460-05bb17bd91e5\\.system_generated\\logs\\transcript_full.jsonl";
const lines = fs.readFileSync(path, "utf-8").split("\n");

let targetContent = null;
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.content && obj.content.includes("<SummaryCard") && obj.content.includes("Network Topology Overview") && obj.content.includes("Monitoring Dashboard")) {
       targetContent = obj.content;
    }
  } catch (e) {}
}

if (targetContent) {
   fs.writeFileSync("C:\\Users\\DELL\\.gemini\\antigravity\\brain\\3e2ea792-1071-41ad-9460-05bb17bd91e5\\scratch\\dashboard_recovery2.txt", targetContent);
   console.log("Extracted!");
} else {
   console.log("Not found.");
}
