# Module 1: Data Cleaning & Visualization

## 1. Academic Source of Truth
This module implements **MODULE 1: Data Cleaning** from the Master of Business Administration (MBA - Business Analytics) course:
- **Course Code**: BUAU2619
- **Course Title**: Machine Learning Using Python
- **Allocated Hours**: 12 Hours
- **Primary Source Material**: Classroom Python Notes (`chapter 1.2`) and Course Syllabus (Amity University Haryana).

---

## 2. Curriculum Mapping to Quests

| Academic Topic (Course Syllabus & Chapter 1.2) | PyQuest Quest | Method / Concept Learned |
| :--- | :--- | :--- |
| **Reading the data, Variations, DataFrames, Delimiters** | **Quest 1: Meet the Data** | Tabular structure, rows, columns, `pd.read_csv()`, delimiter separators (`sep=','`, `sep='\t'`) |
| **Import Methods: CSV, `open()`, URL, `.xls`/`.xlsx`** | **Quest 2: Data Import Forge** | `pd.read_csv()`, Python built-in `open()`, reading raw data via HTTP/HTTPS URLs, `pd.read_excel()` |
| **Exporting data to CSV & Excel, Multi-sheet workbooks** | **Quest 3: Data Export Workshop** | `df.to_csv("file.csv", index=False)`, `df.to_excel()`, `pd.ExcelWriter()` multi-sheet export, **Raw Data Preservation** principle |
| **Detecting, Counting, Dropping, Imputing Missing Values** | **Quest 4: Missing Value Dungeon** | `df.isna().sum()`, `df.isna().mean() * 100`, `df.dropna(subset=['Marks'])`, `df['Marks'].fillna(median)`, `ffill()`, `bfill()` |
| **Categorical Variables, Dummy Variables & Trap Avoidance** | **Quest 5: Category Forge** | Categorical imputation (`fillna('Unknown')`), `pd.get_dummies(dtype=int)`, Dummy-Variable Trap, `drop_first=True` |
| **Data Visualization: Scatter, Histogram, Boxplots** | **Quest 6: Visualization Tower** | `plt.scatter()` (association vs causation), `plt.hist(bins=8)` distribution, `plt.boxplot()` 5-number summary & outliers, `df.boxplot(by='Course')` |
| **End-to-End Cleaning & Visualization Workflow** | **Quest 7: The Clean Data Trial (Final Boss)** | Comprehensive pipeline: Read -> Inspect -> Impute Missing Values -> Encode Categories -> Visualize -> Save Cleaned Data |

---

## 3. Quests & Learning Objectives

### Quest 1 — Meet the Data
- **Objective**: Understand tabular structure (observations as rows, features as columns), DataFrame representation in Pandas, and how delimiters separate raw stream text into structured tables.
- **Challenges**:
  - Delimiter identification MCQ (`comma `,` in CSV`).
  - DataFrame structure prediction (`10 rows × 9 columns`).
  - Delimiter separator parameter in `read_csv(sep=...)`.

### Quest 2 — Data Import Forge
- **Objective**: Master 4 practical import vectors taught in the syllabus: local CSV via `pd.read_csv`, low-level `open()`, web URLs, and spreadsheet files via `pd.read_excel()`.
- **Challenges**:
  - Missing import function completion (`read_csv`).
  - Excel reading syntax verification (`read_excel`).
  - Active Python editor challenge executing `df = pd.read_csv("student_performance.csv")` and checking `df.shape`.

### Quest 3 — Data Export Workshop
- **Objective**: Learn how to persist cleaned DataFrames using `to_csv` and `to_excel`, comprehend why `index=False` prevents duplicate index columns, write multiple worksheets using `pd.ExcelWriter(engine="openpyxl")`, and uphold the golden academic rule: **always preserve original raw datasets**.
- **Challenges**:
  - MCQ on `index=False` utility.
  - Multi-sheet syntax completion using `pd.ExcelWriter`.
  - Fix-code challenge exporting `cleaned.csv` without index columns.

### Quest 4 — Missing Value Dungeon
- **Objective**: Deep-dive into missing observation mechanics:
  1. Detect & Count: `df.isna().sum()` and proportion `df.isna().mean() * 100`.
  2. Remove: `df.dropna(subset=['Marks'])` with justification on sample size reduction.
  3. Impute: Central tendency replacement using `df['Marks'].fillna(df['Marks'].median())`.
  4. Sequence fill: `ffill()` for ordered/time-series data, and `bfill()`.
- **Challenges**:
  - MCQ on percentage of missing values.
  - Fix-the-bug challenge repairing `isna().sum()`.
  - Code editor challenge completing median imputation on `Marks`.

### Quest 5 — Category Forge
- **Objective**: Bridge statistical algorithms requiring numerical matrices with categorical qualitative data:
  1. Guard against category loss by filling missing categories with `"Unknown"`.
  2. One-hot encode using `pd.get_dummies(..., dtype=int)`.
  3. Master the **Dummy-Variable Trap**: understanding perfect linear multicollinearity when an intercept is included, and resolving it with `drop_first=True`.
- **Challenges**:
  - Identify categorical columns vs continuous features.
  - Predict encoded column counts with `drop_first=True`.
  - Code editor challenge encoding `Gender` and verifying column presence.

### Quest 6 — Visualization Tower
- **Objective**: Visually inspect data distributions and relationships with Matplotlib and Pandas plotting:
  1. Scatter Plot: `plt.scatter(df['Study_Hours'], df['Marks'])` to assess correlation without falsely presuming causation.
  2. Histogram: `plt.hist(df['Marks'].dropna(), bins=8)` for frequency distributions and interval binning.
  3. Boxplot: `plt.boxplot()` visualizing median, quartiles (Q1, Q3), IQR, whiskers, and outliers.
  4. Categorical Boxplot: `df.boxplot(column='Marks', by='Course')` comparing cross-group distributions.
- **Challenges**:
  - Match visualization type to exploratory purpose.
  - Boxplot outlier and median interpretation.
  - Generate scatter plot with labels and title.

### Quest 7 — The Clean Data Trial (Final Boss)
- **Objective**: Integrate all 6 sub-skills into an end-to-end, multi-stage data cleaning workflow directly reflecting Slide 19 of the classroom notes:
  $$\text{READ} \longrightarrow \text{INSPECT} \longrightarrow \text{IMPUTE NUMERIC} \longrightarrow \text{IMPUTE CATEGORICAL} \longrightarrow \text{ENCODE DUMMIES} \longrightarrow \text{SAVE OUTPUT}$$
- **Reward**: Massive 150 XP, 60 Gold Coins, and the exclusive **Master of Clean Data** crown badge.

---

## 4. Classroom Practice Datasets

PyQuest embeds authentic classroom datasets directly accessible to the player in-memory and via the virtual filesystem:

### 1. `student_performance.csv` (10 Rows × 9 Columns)
| Student_ID | Name | Gender | Age | Course | City | Study_Hours | Attendance | Marks |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 101 | Aarav | M | 20 | Data Science | Delhi | 5.5 | 92 | 78 |
| 102 | Diya | F | 21 | Machine Learning | Mumbai | 6.0 | 88 | *NaN* |
| 103 | Rohan | M | 22 | Data Science | *NaN* | 4.0 | *NaN* | 65 |
| 104 | Ananya | F | 20 | Business Analytics | Bangalore | 7.5 | 95 | 85 |
| 105 | Kabir | M | 21 | Machine Learning | Delhi | 3.0 | 75 | 52 |
| 106 | Meera | F | 23 | Business Analytics | Mumbai | 8.0 | 90 | 92 |
| 107 | Arjun | *NaN* | 22 | Data Science | Bangalore | 5.0 | 85 | 70 |
| 108 | Ishita | F | 20 | Machine Learning | *NaN* | 6.5 | *NaN* | *NaN* |
| 109 | Aditya | M | 21 | Business Analytics | Delhi | 4.5 | 80 | 68 |
| 110 | Pooja | F | 22 | Data Science | Mumbai | 7.0 | 94 | 88 |

### 2. `sales_data.csv`
Used for multi-sheet workbook examples with `pd.ExcelWriter`. Contains `Region`, `Product`, `Units_Sold`, and `Revenue`.

### 3. `missing_values_practice.csv`
Reflects Slide 21 classroom exercises with `Student_ID`, `Name`, `Gender`, `Age`, `City`, and `Marks`.

---

## 5. Python Execution Architecture

1. **Client-Side Pyodide (WASM)**:
   - Evaluates real Python 3 code directly within the user's web browser sandbox.
   - Loads packages (`pandas`, `matplotlib`) without sending student code or data to external untrusted servers.
   - Mounts the 3 practice CSV files into Pyodide's virtual filesystem (`pyodide.FS.writeFile`) so `pd.read_csv("student_performance.csv")` executes natively.
2. **Offline Simulation Engine**:
   - Zero-dependency client simulation fallback in `pyodideRunner.ts` if running in an offline network or before CDN scripts load.
   - Accurately computes shapes, missing value tallies (`isna().sum()`), median fills, dummy encoding checks, and plotting calls.
3. **Safety & Security**:
   - Zero `exec()` or arbitrary code execution in the FastAPI backend process.

---

## 6. How to Add Future Modules

To add subsequent modules according to the syllabus:
- **Module 2**: Data Wrangling (`content/worlds/data-wrangling.json`)
- **Module 3**: Statistical Concepts & Linear Regression (`content/worlds/linear-regression.json`)
- **Module 4**: Logistic Regression (`content/worlds/logistic-regression.json`)
- **Module 5**: Decision Trees & Random Forests (`content/worlds/trees-and-forests.json`)

**Steps**:
1. Define the world JSON in `content/worlds/<module-name>.json` with academic topics, lessons, code examples, and progressive challenges.
2. Place any required benchmark CSV datasets in `content/data/` and add typed constants to `frontend/src/data/practiceDatasets.ts`.
3. The FastAPI backend automatically loads and validates any JSON file dropped into `content/worlds/` via `content_service.reload_content()`.
4. The frontend curriculum bundler automatically renders the world in the Realm Switcher, Adventure Map Canvas, and Progress Tracker.
