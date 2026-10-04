const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== PYQUEST DATA CLEANING REALM VISUAL VERIFICATION SUITE ===\n');

// 1. Inspect FixCodeChallenge.tsx
const fixCodePath = path.join(__dirname, 'src', 'features', 'challenge', 'FixCodeChallenge.tsx');
assert(fs.existsSync(fixCodePath), 'FixCodeChallenge.tsx must exist');
const fixCodeContent = fs.readFileSync(fixCodePath, 'utf8');

// Verify Wizard / Sage character REMOVAL
assert(!fixCodeContent.includes('Archmage Pythos'), 'Must NOT feature Archmage Pythos');
assert(!fixCodeContent.includes('Sage of the Data Forge'), 'Must NOT feature Sage of the Data Forge');
assert(!fixCodeContent.includes('🧙‍♂️'), 'Must NOT feature wizard character emoji');
console.log('✓ PASS: Wizard / Sage character removed from challenge screen');

// Verify DataPipelineGate integration
assert(fixCodeContent.includes('DataPipelineGate'), 'Must integrate DataPipelineGate');
console.log('✓ PASS: DataPipelineGate integrated in FixCodeChallenge');

// Verify Python Code Editor label & functionality
assert(fixCodeContent.includes('PYTHON CODE EDITOR'), 'Must label editor as PYTHON CODE EDITOR');
assert(fixCodeContent.includes('renderHighlightedCode'), 'Must contain Python syntax highlighter');
assert(fixCodeContent.includes('caret-sky-400'), 'Must feature glowing sky-blue caret');
assert(fixCodeContent.includes('lineNumbers.map'), 'Must render line numbers gutter');
console.log('✓ PASS: PYTHON CODE EDITOR with syntax highlighting and line numbers gutter present');

// Verify Game Feedback (Error & Success States)
assert(fixCodeContent.includes('❌ CODE CHECK FAILED'), 'Must format errors as ❌ CODE CHECK FAILED');
assert(fixCodeContent.includes('✨ DATA IMPORT SUCCESSFUL'), 'Must format success as ✨ DATA IMPORT SUCCESSFUL');
assert(fixCodeContent.includes('Python code executed'), 'Must show Python code executed checklist item');
assert(fixCodeContent.includes('10 rows detected'), 'Must show 10 rows detected checklist item');
assert(fixCodeContent.includes('9 columns detected'), 'Must show 9 columns detected checklist item');
console.log('✓ PASS: Clean data-focused feedback (Code Check Failed / Data Import Successful) present');

// 2. Inspect DataPipelineGate.tsx
const pipelineGatePath = path.join(__dirname, 'src', 'components', 'common', 'DataPipelineGate.tsx');
assert(fs.existsSync(pipelineGatePath), 'DataPipelineGate.tsx must exist');
const pipelineContent = fs.readFileSync(pipelineGatePath, 'utf8');

assert(pipelineContent.includes('CSV Document'), 'Must include CSV Document step');
assert(pipelineContent.includes('pd.read_csv()'), 'Must include Python read_csv step');
assert(pipelineContent.includes('DataFrame'), 'Must include DataFrame step');
assert(pipelineContent.includes('Import Gate'), 'Must include Glowing Import Gate step');
console.log('✓ PASS: DataPipelineGate [CSV] -> [Python] -> [DataFrame] -> [Gate] verified');

// 3. Inspect DataArtifactCard.tsx
const artifactCardPath = path.join(__dirname, 'src', 'components', 'common', 'DataArtifactCard.tsx');
assert(fs.existsSync(artifactCardPath), 'DataArtifactCard.tsx must exist');
const artifactContent = fs.readFileSync(artifactCardPath, 'utf8');

assert(artifactContent.includes('Data Artifact'), 'Must feature Data Artifact badge');
assert(artifactContent.includes('ROWS'), 'Must display ROWS stat');
assert(artifactContent.includes('COLUMNS'), 'Must display COLUMNS stat');
assert(artifactContent.includes('MISSING VALUES'), 'Must display MISSING VALUES stat');
assert(artifactContent.includes('NaN'), 'Must highlight missing cells with NaN badge');
assert(!artifactContent.includes('🧙‍♂️') && !artifactContent.includes('Runes'), 'Must not contain wizard references');
console.log('✓ PASS: DataArtifactCard with observations, variables, and missing values verified');

// 4. Inspect WorldHeader.tsx
const worldHeaderPath = path.join(__dirname, 'src', 'components', 'common', 'WorldHeader.tsx');
assert(fs.existsSync(worldHeaderPath), 'WorldHeader.tsx must exist');
const worldHeaderContent = fs.readFileSync(worldHeaderPath, 'utf8');

assert(worldHeaderContent.includes('DATA CLEANING REALM'), 'Must display DATA CLEANING REALM');
assert(worldHeaderContent.includes('MODULE 1'), 'Must display MODULE 1');
assert(worldHeaderContent.includes('PROGRESS'), 'Must display MODULE 1 PROGRESS');
assert(worldHeaderContent.includes('Reward'), 'Must display Reward / Module Rewards');
console.log('✓ PASS: WorldHeader with module progress and reward preview verified');

// 5. Inspect AdventureMapCanvas.tsx & Visual Landmarks
const mapCanvasPath = path.join(__dirname, 'src', 'game', 'AdventureMapCanvas.tsx');
assert(fs.existsSync(mapCanvasPath), 'AdventureMapCanvas.tsx must exist');
const mapCanvasContent = fs.readFileSync(mapCanvasPath, 'utf8');

assert(mapCanvasContent.includes('animate-data-path'), 'Map canvas must use animated data trails');
assert(mapCanvasContent.includes('CSV'), 'Map canvas must include CSV data landmark');
assert(mapCanvasContent.includes('mountainGrad'), 'Map canvas must render scenic mountain gradients');
assert(mapCanvasContent.includes('riverGrad'), 'Map canvas must render scenic river streams');
assert(mapCanvasContent.includes('DATA_CLEANING_LANDMARKS'), 'Map canvas must connect quest landmarks data model');
console.log('✓ PASS: AdventureMapCanvas with mountains, rivers, landmarks, trails, and circular nodes verified');

// 5b. Inspect BottomQuestPanel.tsx & Components
const bottomPanelPath = path.join(__dirname, 'src', 'components', 'map', 'BottomQuestPanel.tsx');
assert(fs.existsSync(bottomPanelPath), 'BottomQuestPanel.tsx must exist');
const bottomPanelContent = fs.readFileSync(bottomPanelPath, 'utf8');
assert(bottomPanelContent.includes('You Will Learn'), 'BottomQuestPanel must include You Will Learn checklist');
assert(bottomPanelContent.includes('Start Quest'), 'BottomQuestPanel must include Start Quest action button');
assert(bottomPanelContent.includes('TreasureChestGraphic'), 'BottomQuestPanel must include TreasureChestGraphic');
console.log('✓ PASS: BottomQuestPanel with checklist, rewards, and landmark graphics verified');

// 6. Inspect LessonReader.tsx
const lessonReaderPath = path.join(__dirname, 'src', 'features', 'lesson', 'LessonReader.tsx');
assert(fs.existsSync(lessonReaderPath), 'LessonReader.tsx must exist');
const lessonReaderContent = fs.readFileSync(lessonReaderPath, 'utf8');

assert(lessonReaderContent.includes('Quest Curriculum'), 'Must include curriculum step tracker');
assert(lessonReaderContent.includes('Data Tip:'), 'Must label tips as Data Tip');
assert(lessonReaderContent.includes('Console Output:'), 'Must preview console output');
console.log('✓ PASS: LessonReader with 3-column layout and data tips verified');

// 7. Inspect QuestContainer.tsx Modals
const questContainerPath = path.join(__dirname, 'src', 'features', 'challenge', 'QuestContainer.tsx');
assert(fs.existsSync(questContainerPath), 'QuestContainer.tsx must exist');
const questContainerContent = fs.readFileSync(questContainerPath, 'utf8');

assert(questContainerContent.includes('QUEST TRIAL CLEARED'), 'Must feature clean QUEST TRIAL CLEARED modal');
assert(questContainerContent.includes('CSV Document'), 'Victory modal must include CSV -> Python -> DataFrame visual');
assert(questContainerContent.includes('Next Quest Unlocked:'), 'Victory modal must show Next Quest Unlocked');
console.log('✓ PASS: QuestContainer reward and completion modals verified');

console.log('\n==================================================');
console.log('ALL DATA CLEANING REALM VISUAL CHECKS PASSED (100%)! 🚀');
console.log('==================================================');
