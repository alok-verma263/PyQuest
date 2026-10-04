export interface QuestLandmarkData {
  id: string;
  order: number;
  title: string;
  tagline: string;
  description: string;
  landmarkType:
    | 'dataframe-shrine'
    | 'import-gate'
    | 'export-workshop'
    | 'missing-dungeon'
    | 'category-forge'
    | 'visualization-tower'
    | 'clean-portal';
  mapX: number;
  mapY: number;
  tags: string[];
  learnChecklist: string[];
  floatingCard: {
    title: string;
    type: 'table' | 'tags' | 'missing-table' | 'encoding-table' | 'charts' | 'portal';
    items?: string[];
    tableData?: { headers: string[]; rows: (string | number)[][] };
  };
  xpReward: number;
  coinReward: number;
}

export const DATA_CLEANING_LANDMARKS: Record<number, QuestLandmarkData> = {
  1: {
    id: 'quest-1-meet-the-data',
    order: 1,
    title: 'Meet the Data',
    tagline: 'Understanding datasets, DataFrames and delimiters',
    description:
      'Begin your data exploration journey. Learn how tabular datasets are structured into rows and columns, explore DataFrame architecture, and understand file delimiters.',
    landmarkType: 'dataframe-shrine',
    mapX: 95,
    mapY: 360,
    tags: ['DataFrames', 'Rows & Columns', 'Delimiters', 'df.head()'],
    learnChecklist: [
      'Understand real-world tabular datasets',
      'Learn rows (observations) and columns (variables)',
      'Explore the pandas DataFrame structure',
      'Understand delimiters (comma, tab, semicolon)',
      'Inspect dataset dimensions using df.shape',
    ],
    floatingCard: {
      title: 'DataFrame Matrix',
      type: 'table',
      tableData: {
        headers: ['ID', 'Name', 'Age'],
        rows: [
          [1, 'Aarav', 20],
          [2, 'Diya', 21],
          [3, 'Rohan', 22],
        ],
      },
    },
    xpReward: 60,
    coinReward: 15,
  },
  2: {
    id: 'quest-2-import-forge',
    order: 2,
    title: 'Data Import Forge',
    tagline: 'Import data from CSV, Excel, open(), and URLs',
    description:
      "Learn how to bring real-world data into Python using CSV files, Excel files, Python's open() method, and remote web URLs.",
    landmarkType: 'import-gate',
    mapX: 215,
    mapY: 220,
    tags: ['pd.read_csv()', 'pd.read_excel()', 'open()', 'from URL'],
    learnChecklist: [
      'Import CSV files using pd.read_csv()',
      'Read Excel workbooks (.xls, .xlsx)',
      "Use Python's built-in open() method",
      'Stream remote datasets directly from a web URL',
      'Configure custom separators and delimiters',
      'Handle file paths and memory ingestion',
    ],
    floatingCard: {
      title: 'Import Streams',
      type: 'tags',
      items: ['pd.read_csv()', 'pd.read_excel()', 'open()', 'from URL'],
    },
    xpReward: 75,
    coinReward: 25,
  },
  3: {
    id: 'quest-3-export-workshop',
    order: 3,
    title: 'Data Export Workshop',
    tagline: 'Save cleaned data to CSV and Excel (multiple sheets)',
    description:
      'Learn how to persist and export your processed DataFrames to disk as CSV files and multi-sheet Excel reports using pd.ExcelWriter.',
    landmarkType: 'export-workshop',
    mapX: 350,
    mapY: 330,
    tags: ['df.to_csv()', 'df.to_excel()', 'ExcelWriter()', 'index=False'],
    learnChecklist: [
      'Export DataFrames to CSV with df.to_csv()',
      'Suppress unwanted row numbers using index=False',
      'Generate formatted Excel workbooks (.xlsx)',
      'Create multi-worksheet business reports with ExcelWriter',
      'Verify exported file integrity on the local system',
    ],
    floatingCard: {
      title: 'Export Targets',
      type: 'tags',
      items: ['df.to_csv()', 'df.to_excel()', 'ExcelWriter()'],
    },
    xpReward: 65,
    coinReward: 20,
  },
  4: {
    id: 'quest-4-missing-value-dungeon',
    order: 4,
    title: 'Missing Value Dungeon',
    tagline: 'Detect, remove and fill missing values',
    description:
      'Enter the shadowy cavern of incomplete records. Detect null values, count NaNs across features, and master dropping vs mean/median/mode imputation.',
    landmarkType: 'missing-dungeon',
    mapX: 485,
    mapY: 190,
    tags: ['isna()', 'sum()', 'dropna()', 'fillna()', 'median()'],
    learnChecklist: [
      'Identify null indicators (NaN / None) using .isna()',
      'Sum missing values per column with .isna().sum()',
      'Drop records with .dropna(subset=...)',
      'Impute numerical columns with mean and median',
      'Fill forward (ffill) and fill backward (bfill) for time series',
    ],
    floatingCard: {
      title: 'Incomplete Records',
      type: 'missing-table',
      tableData: {
        headers: ['Name', 'Marks'],
        rows: [
          ['Aarav', 78],
          ['Diya', 'NaN'],
          ['Rohan', 65],
        ],
      },
    },
    xpReward: 80,
    coinReward: 25,
  },
  5: {
    id: 'quest-5-category-forge',
    order: 5,
    title: 'Category Forge',
    tagline: 'Create dummy variables and avoid the dummy trap',
    description:
      'Forge categorical text labels into machine-readable numerical matrices using One-Hot Encoding and learn why drop_first=True prevents multicollinearity.',
    landmarkType: 'category-forge',
    mapX: 625,
    mapY: 310,
    tags: ['pd.get_dummies()', 'One-Hot Encoding', 'drop_first=True', 'Dummy Trap'],
    learnChecklist: [
      'Distinguish categorical labels from numerical variables',
      'Convert categorical columns with pd.get_dummies()',
      'Understand the Dummy Variable Trap (multicollinearity)',
      'Use drop_first=True to eliminate redundant feature columns',
      'Verify binary matrix encoding output (0 and 1)',
    ],
    floatingCard: {
      title: 'pd.get_dummies()',
      type: 'encoding-table',
      tableData: {
        headers: ['Gender', 'M', 'F'],
        rows: [
          ['0', 0, 1],
          ['Course', 'DS', 'ML'],
        ],
      },
    },
    xpReward: 75,
    coinReward: 20,
  },
  6: {
    id: 'quest-6-visualization-tower',
    order: 6,
    title: 'Visualization Tower',
    tagline: 'Scatter plots, histograms, boxplots and more',
    description:
      'Ascend the Visualization Tower to inspect feature relationships, distributions, and outliers with Scatter Plots, Histograms (bins=8), and Boxplots.',
    landmarkType: 'visualization-tower',
    mapX: 745,
    mapY: 195,
    tags: ['Scatter Plots', 'Histograms', 'Boxplots', 'Outlier Detection'],
    learnChecklist: [
      'Plot variable correlations using Scatter Plots (plt.scatter)',
      'Analyze frequency distributions with Histograms (bins=8)',
      'Extract 5-Number Summaries (min, Q1, median, Q3, max)',
      'Detect data skewness and outlier points with Boxplots',
      'Compare distribution metrics across categorical groups',
    ],
    floatingCard: {
      title: 'Miniature Charts',
      type: 'charts',
      items: ['Scatter Plot', 'Histogram', 'Boxplot'],
    },
    xpReward: 85,
    coinReward: 25,
  },
  7: {
    id: 'quest-7-clean-data-boss',
    order: 7,
    title: 'Clean Data Trial',
    tagline: 'Apply the full workflow and clean a real-world dataset',
    description:
      'The Grand Master Trial of Module 1. Execute the entire end-to-end data preparation workflow: Read -> Inspect -> Clean -> Encode -> Visualize -> Save.',
    landmarkType: 'clean-portal',
    mapX: 880,
    mapY: 260,
    tags: ['End-to-End Workflow', 'Data Quality Audit', 'Master Pipeline', 'Export Artifact'],
    learnChecklist: [
      'Ingest raw messy CSV records into memory',
      'Audit structural nulls and count missing observations',
      'Execute strategic median imputation on incomplete scores',
      'Encode categorical variables using drop_first=True',
      'Verify distributions visually with diagnostic boxplots',
      'Export the final golden dataset artifact to CSV & Excel',
    ],
    floatingCard: {
      title: 'Data Pipeline',
      type: 'portal',
      items: ['READ', 'INSPECT', 'CLEAN', 'ENCODE', 'VISUALIZE', 'SAVE'],
    },
    xpReward: 150,
    coinReward: 50,
  },
};
