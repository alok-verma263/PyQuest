import type { World } from '../types/world';
import type { AvatarOption } from '../types/profile';

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'char-a',
    name: 'PyMage',
    role: 'Snake Sorcerer',
    emoji: '🧙‍♂️',
    color: '#10b981',
    border: 'border-emerald-500',
    bg: 'from-emerald-900/60 to-emerald-950/90',
    description: 'Masters the ancient syntax incantations and channels pure Pythonic energy.',
  },
  {
    id: 'char-b',
    name: 'ByteKnight',
    role: 'Logic Warrior',
    emoji: '⚔️',
    color: '#0284c7',
    border: 'border-sky-500',
    bg: 'from-sky-900/60 to-sky-950/90',
    description: 'Armored in robust data types and cleaves through complex control flows.',
  },
  {
    id: 'char-c',
    name: 'CyberRogue',
    role: 'Shadow Scripter',
    emoji: '🥷',
    color: '#8b5cf6',
    border: 'border-purple-500',
    bg: 'from-purple-900/60 to-purple-950/90',
    description: 'Infiltrates stubborn bugs in the shadows and automates repetitive tasks.',
  },
  {
    id: 'char-d',
    name: 'DataDruid',
    role: 'Keeper of Algorithms',
    emoji: '🌿',
    color: '#f59e0b',
    border: 'border-amber-500',
    bg: 'from-amber-900/60 to-amber-950/90',
    description: 'Harmonizes complex data structures with natural analytical intuition.',
  },
];

export const DEFAULT_WORLD_1: World = {
  id: "python-basics",
  title: "PYTHON BASICS",
  tagline: "Begin your coding quest and master the core foundations",
  description: "Welcome to the enchanted kingdom of PyQuest! Awaken your magical coding potential as you learn Python syntax, manipulate elemental variables, and conjure interactive spells.",
  order: 1,
  themeColor: "#0284c7",
  levels: [
    {
      id: "level-1-first-program",
      worldId: "python-basics",
      order: 1,
      title: "Your First Python Program",
      description: "Master statement syntax, learn what Python is, and cast your very first print() invocation.",
      topics: [
        "What is Python?",
        "print()",
        "Basic syntax"
      ],
      mapX: 160,
      mapY: 280,
      xpReward: 100,
      coinReward: 25,
      lessons: [
        {
          title: "Your First Python Program",
          content: "Python is a programming language used to build applications, automate tasks, analyze data, and much more.\n\nPython code is clean, readable, and written in plain English-like statements. In PyQuest, your Python code directly commands the computer to perform actions and solve challenges!",
          codeExample: "# Your first Python statement\nprint(\"Hello, Python!\")",
          tip: "Python code executes line by line from top to bottom."
        },
        {
          title: "The print() Function",
          content: "The `print()` function is the primary tool to output information to the console screen.\n\nWhatever text you place inside `print(...)` surrounded by quotation marks will be displayed as output without the quotes!",
          codeExample: "print(\"Hello, Python!\")\n# Output displayed:\n# Hello, Python!",
          tip: "Always wrap your words in double quotes (\"...\") or single quotes ('...')."
        }
      ],
      challenges: [
        {
          id: "c1-predict-print",
          title: "Output Prediction Trial",
          type: "predict-output",
          instructions: "Inspect the Python code snippet below. What will be displayed on the console screen?",
          question: "print(\"Hello Python\")",
          options: [
            "Hello Python",
            "\"Hello Python\"",
            "print(\"Hello Python\")",
            "Error"
          ],
          answer: "Hello Python",
          hints: [
            "Remember that print() outputs the text inside the quotes, but does not print the quotation marks themselves."
          ],
          explanation: "Correct! The print() function displays the text content inside quotes. The quotation marks tell Python it is text, but are not printed.",
          xpReward: 40,
          coinReward: 10
        },
        {
          id: "c1-write-print",
          title: "Cast the print() Spell",
          type: "write-code",
          instructions: "Write a Python statement that prints the exact message 'Hello Python' to the console output.",
          starterCode: "# Write your code below to print Hello Python\n",
          solution: "print(\"Hello Python\")",
          testCases: [
            {
              input: "",
              expectedOutput: "Hello Python",
              hidden: false
            }
          ],
          hints: [
            "Use the print() function: print(\"Hello Python\")"
          ],
          explanation: "Brilliant! You wrote and executed your very first Python program in the browser sandbox!",
          xpReward: 60,
          coinReward: 15
        }
      ]
    },
    {
      id: "level-2-variables-data",
      worldId: "python-basics",
      order: 2,
      title: "Variables & Data",
      description: "Harness data containers: craft strings, store integers, measure floats, and balance booleans.",
      topics: [
        "Variables",
        "Strings & Integers",
        "Booleans & Floats"
      ],
      mapX: 380,
      mapY: 210,
      xpReward: 100,
      coinReward: 25,
      lessons: [
        {
          title: "Variables: The Magic Jars",
          content: "A variable is like a labeled container that stores data for later use. In Python, you create a variable by naming it and using the `=` assignment operator.",
          codeExample: "hero_name = \"Alok\"\nhero_level = 5\nprint(hero_name)",
          tip: "Variable names in Python should use lowercase letters and underscores (snake_case)."
        }
      ],
      challenges: [
        {
          id: "c2-mana-var",
          title: "Store Mana Power",
          type: "write-code",
          instructions: "Create a variable named `mana` and set it to `100`. Then print the value of `mana`.",
          starterCode: "# Create mana variable and print it\n",
          solution: "mana = 100\nprint(mana)",
          testCases: [
            {
              input: "",
              expectedOutput: "100",
              hidden: false
            }
          ],
          hints: [
            "mana = 100",
            "print(mana)"
          ],
          explanation: "Great job! Printing a variable without quotes displays the value held inside.",
          xpReward: 100,
          coinReward: 25
        }
      ]
    },
    {
      id: "level-3-user-input",
      worldId: "python-basics",
      order: 3,
      title: "User Input",
      description: "Communicate with users using input(), perform type conversions, and evaluate arithmetic expressions.",
      topics: [
        "input() Function",
        "Type Conversion",
        "Arithmetic Expressions"
      ],
      mapX: 600,
      mapY: 290,
      xpReward: 100,
      coinReward: 25,
      lessons: [
        {
          title: "Gathering User Input",
          content: "The `input()` function pauses execution and waits for the user to type something into the console. The user's input is returned as a text string.",
          codeExample: "player_name = input()\nprint(\"Welcome, \" + player_name)",
          tip: "Remember that input() always returns text, so convert with int() if you need a number."
        }
      ],
      challenges: [
        {
          id: "c3-square-input",
          title: "The Power Calculation",
          type: "write-code",
          instructions: "Read an integer number using `input()`, calculate its square, and print the result.",
          starterCode: "# Read integer and print its square\n",
          solution: "num = int(input())\nprint(num * num)",
          testCases: [
            {
              "input": "5",
              expectedOutput: "25",
              hidden: false
            }
          ],
          hints: [
            "num = int(input())",
            "print(num * num)"
          ],
          explanation: "Awesome! You handled dynamic standard input and computed numerical results!",
          xpReward: 100,
          coinReward: 25
        }
      ]
    }
  ]
};
