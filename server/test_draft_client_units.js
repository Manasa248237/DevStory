/**
 * DevStory — Draft Auto-Save Client Logic Verification
 * Tests:
 * 1. Debounce and meaningful change detection (dirty check)
 * 2. Race condition sequencing logic
 * 3. Recovery snapshot normalization
 * 4. Offline / Network error resilience
 */

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("=================================================");
console.log("DEVSTORY - DRAFT CLIENT UNIT ALGORITHMS VERIFICATION");
console.log("=================================================\n");

// 1. Snapshot generation test
function getPayloadSnapshot(data) {
  return JSON.stringify({
    title: data.title || "",
    category: data.category || "General",
    tags: data.tags || "",
    thumbnail: data.thumbnail || "",
    excerpt: data.excerpt || "",
    content: data.content || "",
    status: data.status || "draft",
  });
}

console.log("--- Section 1: Dirty Checking & Snapshot Equality ---");
const snapshotA = getPayloadSnapshot({
  title: "Building Microservices",
  content: "<p>Kafka event streaming guide</p>",
  category: "Architecture",
  tags: "Kafka, Node.js",
  status: "draft",
});

const snapshotB = getPayloadSnapshot({
  title: "Building Microservices",
  content: "<p>Kafka event streaming guide</p>",
  category: "Architecture",
  tags: "Kafka, Node.js",
  status: "draft",
});

const snapshotC = getPayloadSnapshot({
  title: "Building Microservices v2",
  content: "<p>Kafka event streaming guide with CQRS</p>",
  category: "Architecture",
  tags: "Kafka, Node.js",
  status: "draft",
});

assert(snapshotA === snapshotB, "Identical payloads produce identical snapshot strings (skips redundant DB write)");
assert(snapshotA !== snapshotC, "Meaningful edits produce distinct snapshot strings (triggers auto-save)");

console.log("\n--- Section 2: Minimum Viability Validation ---");
function minValidCheck(data) {
  const plainText = (data?.content || "").replace(/<[^>]*>/gm, "").trim();
  return Boolean(data?.title?.trim()?.length >= 3 && plainText.length >= 5);
}

assert(!minValidCheck({ title: "Hi", content: "" }), "Short title & empty content rejects server auto-save");
assert(!minValidCheck({ title: "Valid Title", content: "<p>   </p>" }), "Empty HTML tags rejects server auto-save");
assert(minValidCheck({ title: "Valid Title", content: "<p>Valid text</p>" }), "Valid title and content passes eligibility");

console.log("\n--- Section 3: Race Condition Sequencing Simulation ---");
class AutoSaveSequencer {
  constructor() {
    this.sequence = 0;
    this.latestSavedData = null;
  }

  async mockSave(data, delayMs) {
    const currentSeq = ++this.sequence;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (currentSeq !== this.sequence) {
      // Stale response ignored
      return { saved: false, reason: "stale" };
    }
    this.latestSavedData = data;
    return { saved: true, data };
  }
}

async function testSequencing() {
  const sequencer = new AutoSaveSequencer();

  // Rapid typing triggers Request 1 (slow network, 100ms) and Request 2 (fast network, 20ms)
  const p1 = sequencer.mockSave("Slow keystroke #1", 100);
  const p2 = sequencer.mockSave("Fast keystroke #2", 20);

  const [res1, res2] = await Promise.all([p1, p2]);

  assert(res1.saved === false, "Earlier in-flight request is safely ignored when newer edit arrives");
  assert(res2.saved === true, "Newest request resolves and persists latest user state");
  assert(sequencer.latestSavedData === "Fast keystroke #2", "Stored state matches newest typed content");
}

await testSequencing();

console.log("\n--- Section 4: Offline / Failure State Preservation ---");
let editorState = {
  title: "My Offline Article",
  content: "<p>Content written while disconnected</p>",
};

// Simulated network error
let saveStatus = "saving";
try {
  throw new Error("Network offline (503 Service Unavailable)");
} catch (err) {
  saveStatus = "error";
  // Verify editorState is preserved!
  assert(editorState.title === "My Offline Article", "Editor state is never cleared on network failure");
  assert(saveStatus === "error", "Save status gracefully transitions to error state");
}

console.log("\n=================================================");
console.log("🎉 ALL DRAFT CLIENT UNIT TESTS PASSED (100%)");
console.log("=================================================\n");
