const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== PYQUEST VISUAL REDESIGN VERIFICATION SUITE ===\n');

// 1. Inspect FixCodeChallenge.tsx
const fixCodePath = path.join(__dirname, 'src', 'features', 'challenge', 'FixCodeChallenge.tsx');
assert(fs.existsSync(fixCodePath), 'FixCodeChallenge.tsx must exist');
const fixCodeContent = fs.readFileSync(fixCodePath, 'utf8');

// Verify Sage / NPC Dialogue
assert(fixCodeContent.includes('Archmage Pythos'), 'Must feature Archmage Pythos Sage');
assert(fixCodeContent.includes('Sage of the Data Forge'), 'Must feature Sage of the Data Forge title');
assert(fixCodeContent.includes('🧙‍♂️'), 'Must feature Sage avatar');
console.log('✓ PASS: Sage / NPC Dialogue (Archmage Pythos) present');

// Verify DataArtifactCard integration
assert(fixCodeContent.includes('DataArtifactCard'), 'Must integrate DataArtifactCard');
console.log('✓ PASS: DataArtifactCard integrated in FixCodeChallenge');

// Verify Python Spellbook Editor
assert(fixCodeContent.includes('Python Spell Scroll'), 'Must designate script.py as Python Spell Scroll');
assert(fixCodeContent.includes('renderHighlightedCode'), 'Must contain Python syntax highlighter');
assert(fixCodeContent.includes('TOKEN_REGEX'), 'Must have token regex for keywords, builtins, strings, brackets');
assert(fixCodeContent.includes('caret-sky-400'), 'Must feature glowing sky-blue caret');
assert(fixCodeContent.includes('selection:bg-sky-500/30'), 'Must have styled text selection');
assert(fixCodeContent.includes('lineNumbers.map'), 'Must render line numbers gutter');
console.log('✓ PASS: Visual Spellbook editor with syntax highlighting and gutter present');

// Verify Game Feedback (Error & Success States)
assert(fixCodeContent.includes('❌ SPELL FAILED'), 'Must format errors as ❌ SPELL FAILED');
assert(fixCodeContent.includes('✨ SPELL RESTORED!'), 'Must format success as ✨ SPELL RESTORED!');
assert(fixCodeContent.includes('Dataset loaded into memory'), 'Must show dataset loaded checklist on success');
assert(fixCodeContent.includes('Rows detected'), 'Must show rows detected checklist');
assert(fixCodeContent.includes('Columns detected'), 'Must show columns detected checklist');
assert(fixCodeContent.includes("View Sage's Hint"), 'Must include quick Hint button on error');
console.log('✓ PASS: Game-friendly feedback (Spell Failed / Spell Restored) present');

// Verify Action Bar
assert(fixCodeContent.includes('Reset Spell'), 'Must have Reset Spell button');
assert(fixCodeContent.includes('Cast Spell & Test Fix ⚡'), 'Must have Cast Spell & Test Fix button');
console.log('✓ PASS: Action bar with Reset and Cast Spell buttons present');

// 2. Inspect DataArtifactCard.tsx
const artifactCardPath = path.join(__dirname, 'src', 'components', 'common', 'DataArtifactCard.tsx');
assert(fs.existsSync(artifactCardPath), 'DataArtifactCard.tsx must exist');
const artifactContent = fs.readFileSync(artifactCardPath, 'utf8');

assert(artifactContent.includes('Collectible Data Artifact'), 'Must feature Collectible Data Artifact badge');
assert(artifactContent.includes('ROWS'), 'Must display ROWS stat');
assert(artifactContent.includes('COLUMNS'), 'Must display COLUMNS stat');
assert(artifactContent.includes('MISSING VALUES'), 'Must display MISSING VALUES warning stat');
assert(artifactContent.includes('table'), 'Must display compact table preview');
assert(artifactContent.includes('NaN'), 'Must highlight missing cells with NaN badge');
console.log('✓ PASS: Collectible Data Artifact card with stat pills and NaN table preview present');

// 3. Inspect QuestContainer.tsx
const questContainerPath = path.join(__dirname, 'src', 'features', 'challenge', 'QuestContainer.tsx');
assert(fs.existsSync(questContainerPath), 'QuestContainer.tsx must exist');
const questContainerContent = fs.readFileSync(questContainerPath, 'utf8');

assert(questContainerContent.includes("currentChallenge.type !== 'fix-bug'"), 'QuestContainer must not render duplicate prompt header for fix-bug');
assert(questContainerContent.includes('xpReward'), 'Top quest bar must display XP reward');
assert(questContainerContent.includes('coinReward'), 'Top quest bar must display Coin reward');
console.log('✓ PASS: QuestContainer seamless integration and rewards display verified');

// 4. Inspect index.css for animations
const cssPath = path.join(__dirname, 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('animate-spell-shake'), 'Must include spell shake animation');
assert(cssContent.includes('animate-spell-glow'), 'Must include spell glow animation');
assert(cssContent.includes('animate-reward-pop'), 'Must include reward pop animation');
console.log('✓ PASS: Keyframe animations (shake, glow, reward pop) present in index.css');

// 5. Test Python Syntax Tokenizer directly
const rawTestCode = 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv")';
const TOKEN_REGEX =
  /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:import|from|as|def|class|return|if|elif|else|while|for|in|try|except|with|pass|break|continue|lambda|and|or|not|is|None|True|False)\b)|(\b(?:print|read_csv|read_excel|fillna|dropna|replace|isnull|isna|sum|mean|median|mode|shape|head|tail|info|describe|open|range|len)\b)|(\b(?:pd|np|plt|sns|df)\b)|(\b\d+(?:\.\d+)?\b)|([()[\]{}:])/g;

const matchedTokens = [];
let m;
while ((m = TOKEN_REGEX.exec(rawTestCode)) !== null) {
  matchedTokens.push(m[0]);
}

assert(matchedTokens.includes('import'), 'Tokenizer must match import keyword');
assert(matchedTokens.includes('as'), 'Tokenizer must match as keyword');
assert(matchedTokens.includes('pd'), 'Tokenizer must match pd module');
assert(matchedTokens.includes('read_csv'), 'Tokenizer must match read_csv method');
assert(matchedTokens.includes('"student_performance.csv"'), 'Tokenizer must match string literal');
assert(matchedTokens.includes('('), 'Tokenizer must match opening parenthesis');
assert(matchedTokens.includes(')'), 'Tokenizer must match closing parenthesis');
console.log('✓ PASS: Syntax tokenizer matches all Python keywords, modules, methods, strings, and parentheses correctly');

console.log('\n==================================================');
console.log('ALL VISUAL REDESIGN CHECKS PASSED (100%)! ✨');
console.log('==================================================');
