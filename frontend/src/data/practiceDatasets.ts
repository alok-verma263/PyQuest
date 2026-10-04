// Classroom Practice Datasets for Module 1: Data Cleaning

export interface TableDataset {
  name: string;
  filename: string;
  description: string;
  headers: string[];
  rows: (string | number | null)[][];
  csvRaw: string;
}

export const STUDENT_PERFORMANCE_CSV = `Student_ID,Name,Gender,Age,Course,City,Study_Hours,Attendance,Marks
101,Aarav,M,20,Data Science,Delhi,5.5,92,78
102,Diya,F,21,Machine Learning,Mumbai,6.0,88,
103,Rohan,M,22,Data Science,,4.0,,65
104,Ananya,F,20,Business Analytics,Bangalore,7.5,95,85
105,Kabir,M,21,Machine Learning,Delhi,3.0,75,52
106,Meera,F,23,Business Analytics,Mumbai,8.0,90,92
107,Arjun,,22,Data Science,Bangalore,5.0,85,70
108,Ishita,F,20,Machine Learning,,6.5,,
109,Aditya,M,21,Business Analytics,Delhi,4.5,80,68
110,Pooja,F,22,Data Science,Mumbai,7.0,94,88`;

export const SALES_DATA_CSV = `Region,Product,Units_Sold,Revenue
North,Analytics Suite,120,60000
South,Data Platform,85,42500
East,ML Tool,150,75000
West,Cloud Storage,95,47500`;

export const MISSING_VALUES_PRACTICE_CSV = `Student_ID,Name,Gender,Age,City,Marks
1,Aarav,M,20,Delhi,75
2,Diya,F,,Mumbai,82
3,Rohan,M,22,,68
4,Ananya,,21,Bangalore,
5,Kabir,M,23,Delhi,90`;

export const STUDENT_PERFORMANCE_DATASET: TableDataset = {
  name: "Student Performance",
  filename: "student_performance.csv",
  description: "Classroom benchmark dataset with academic scores, attendance, study hours, and intentional missing observations.",
  headers: ["Student_ID", "Name", "Gender", "Age", "Course", "City", "Study_Hours", "Attendance", "Marks"],
  rows: [
    [101, "Aarav", "M", 20, "Data Science", "Delhi", 5.5, 92, 78],
    [102, "Diya", "F", 21, "Machine Learning", "Mumbai", 6.0, 88, null],
    [103, "Rohan", "M", 22, "Data Science", null, 4.0, null, 65],
    [104, "Ananya", "F", 20, "Business Analytics", "Bangalore", 7.5, 95, 85],
    [105, "Kabir", "M", 21, "Machine Learning", "Delhi", 3.0, 75, 52],
    [106, "Meera", "F", 23, "Business Analytics", "Mumbai", 8.0, 90, 92],
    [107, "Arjun", null, 22, "Data Science", "Bangalore", 5.0, 85, 70],
    [108, "Ishita", "F", 20, "Machine Learning", null, 6.5, null, null],
    [109, "Aditya", "M", 21, "Business Analytics", "Delhi", 4.5, 80, 68],
    [110, "Pooja", "F", 22, "Data Science", "Mumbai", 7.0, 94, 88],
  ],
  csvRaw: STUDENT_PERFORMANCE_CSV,
};

export const SALES_DATASET: TableDataset = {
  name: "Sales Records",
  filename: "sales_data.csv",
  description: "Quarterly sales figures used for demonstrating multi-sheet Excel reports.",
  headers: ["Region", "Product", "Units_Sold", "Revenue"],
  rows: [
    ["North", "Analytics Suite", 120, 60000],
    ["South", "Data Platform", 85, 42500],
    ["East", "ML Tool", 150, 75000],
    ["West", "Cloud Storage", 95, 47500],
  ],
  csvRaw: SALES_DATA_CSV,
};

export const MISSING_VALUES_DATASET: TableDataset = {
  name: "Missing Values Practice",
  filename: "missing_values_practice.csv",
  description: "Dedicated practice dataset for inspecting missingness percentages and imputation.",
  headers: ["Student_ID", "Name", "Gender", "Age", "City", "Marks"],
  rows: [
    [1, "Aarav", "M", 20, "Delhi", 75],
    [2, "Diya", "F", null, "Mumbai", 82],
    [3, "Rohan", "M", 22, null, 68],
    [4, "Ananya", null, 21, "Bangalore", null],
    [5, "Kabir", "M", 23, "Delhi", 90],
  ],
  csvRaw: MISSING_VALUES_PRACTICE_CSV,
};
