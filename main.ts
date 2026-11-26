/**
 * The Comment Above the Code — make.fun bounty entry.
 *
 * Writes one funny, honest comment for fragile production code to
 * /output/entry.txt. The comment is a single line of plain ASCII text.
 *
 * Node 22, standard library only. No network, no arguments, no input:
 * the entry is a constant, checked against the bounty gate, written
 * once, then read back and compared byte-for-byte.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "// Do not refactor this - it works by accident, and that accident took three days to arrange.";

const MAX_CHARS = 200;
const MIN_CHARS = 1;
const OUT_DIR = "/output";
const OUT_PATH = join(OUT_DIR, "entry.txt");

function fail(message: string): never {
  throw new Error(`entry gate failed: ${message}`);
}

function checkEntry(text: string): void {
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    fail(`length must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    fail("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be exactly one line");
  }
  if (!text.startsWith("//")) {
    fail("entry must be a code comment");
  }
  if (text !== text.trim()) {
    fail("entry must not have leading or trailing white space");
  }
  if (text.includes("\t")) {
    fail("entry must not contain a tab character");
  }
}

function writeEntry(text: string): void {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  writeFileSync(OUT_PATH, text, "utf8");
}

function verifyEntry(text: string): void {
  const backAsText = readFileSync(OUT_PATH, "utf8");
  if (backAsText !== text) {
    fail(`read-back text differs: wrote ${JSON.stringify(text)}, read ${JSON.stringify(backAsText)}`);
  }
  const expected = Buffer.from(text, "utf8");
  const actual = readFileSync(OUT_PATH);
  if (expected.length !== actual.length || !expected.equals(actual)) {
    fail(`read-back bytes differ: expected ${expected.length} bytes, got ${actual.length}`);
  }
}

checkEntry(ENTRY);
writeEntry(ENTRY);
verifyEntry(ENTRY);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptName = join(scriptDir, "main.ts");
if (!existsSync(scriptName)) {
  fail(`expected this script at ${scriptName}`);
}
console.log(`Wrote ${ENTRY.length} characters to ${OUT_PATH}`);
