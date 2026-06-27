export type ReadinessQuizSectionId =
  | "sentence-structure"
  | "punctuation"
  | "vocabulary"
  | "grammar";

export interface ReadinessQuizSection {
  id: ReadinessQuizSectionId;
  title: string;
  instruction: string;
}

export interface ReadinessQuizQuestion {
  section: ReadinessQuizSectionId;
  question: string;
  options: string[];
  /** Zero-based index into `options`. */
  answer: number;
  explanation: string;
}

export const READINESS_QUIZ_TITLE = "Are you ready for the October/November batch?";

export const READINESS_QUIZ_TOTAL = 20;

export const READINESS_QUIZ_THRESHOLD = 80;

export const READINESS_QUIZ_SECTIONS: ReadinessQuizSection[] = [
  {
    id: "sentence-structure",
    title: "Sentence Structure",
    instruction: "True or False: Is the sentence correctly written and punctuated?",
  },
  {
    id: "punctuation",
    title: "Punctuation",
    instruction: "True or False: Is the sentence correctly punctuated?",
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    instruction:
      "All words are taken from the 2025 past paper attempt. Choose the correct meaning or complete the sentence.",
  },
  {
    id: "grammar",
    title: "Grammar",
    instruction: "Identify and correct the error in each sentence.",
  },
];

export const readinessQuizQuestions: ReadinessQuizQuestion[] = [
  // ── Section A — Sentence Structure ──
  {
    section: "sentence-structure",
    question: '"Ash cried and Pikachu watched."',
    options: ["True", "False"],
    answer: 0,
    explanation: "Compound sentence correctly joined with ‘and.’",
  },
  {
    section: "sentence-structure",
    question: '"Ash cried Pikachu watched."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "Run-on sentence; two independent clauses are written with no conjunction or punctuation.",
  },
  {
    section: "sentence-structure",
    question: '"Ash cried because Pikachu watched."',
    options: ["True", "False"],
    answer: 0,
    explanation: "The subordinating conjunction ‘because’ correctly links the clauses.",
  },
  {
    section: "sentence-structure",
    question: '"Ash cried because Pikachu watched him with taunting eyes."',
    options: ["True", "False"],
    answer: 0,
    explanation: "Correctly extended subordinate clause with added detail.",
  },
  {
    section: "sentence-structure",
    question:
      '"Ash cried and Pikachu watched him with taunting eyes as he messed up"',
    options: ["True", "False"],
    answer: 1,
    explanation: "The sentence is missing a full stop at the end.",
  },

  // ── Section B — Punctuation ──
  {
    section: "punctuation",
    question: '"She studied hard, she passed the exam."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "Comma splice; two independent clauses are incorrectly joined by just a comma.",
  },
  {
    section: "punctuation",
    question: '"There was only one thing on his mind — which was revenge."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "The em dash already introduces what follows; ‘which was’ is redundant.",
  },
  {
    section: "punctuation",
    question: '"The children played outside, however, it started to rain."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "‘However’ is a conjunctive adverb; it needs a semicolon before it, not a comma.",
  },
  {
    section: "punctuation",
    question: '"He packed three items; a pen; a notebook; and an eraser."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "A colon should follow ‘items,’ and commas should separate the list, not semicolons.",
  },
  {
    section: "punctuation",
    question: '"She was exhausted; but she still finished her work."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "Do not use a semicolon before ‘but’; a comma is correct before a coordinating conjunction.",
  },

  // ── Section C — Vocabulary ──
  {
    section: "vocabulary",
    question: "Menace means:",
    options: ["an annoyance", "a threat", "an obstacle"],
    answer: 1,
    explanation: "‘Menace’ means something that threatens danger or harm.",
  },
  {
    section: "vocabulary",
    question: "Orient means:",
    options: ["new", "adjust", "demonstrate"],
    answer: 1,
    explanation: "‘Orient’ means to adjust or align yourself to new surroundings.",
  },
  {
    section: "vocabulary",
    question: "Writhing means:",
    options: ["writing quickly", "wrapping tightly", "twisting in pain"],
    answer: 2,
    explanation:
      "‘Writhing’ means squirming or twisting the body, usually in agony.",
  },
  {
    section: "vocabulary",
    question:
      "Fill in the blank. Choose from: labyrinth, nuisance, debris, enigma, turmoil.\n\nThe old city was a ________ of winding alleys and dead ends.",
    options: ["labyrinth", "nuisance", "debris", "enigma", "turmoil"],
    answer: 0,
    explanation: "‘Labyrinth’ means a complex, confusing network of paths.",
  },
  {
    section: "vocabulary",
    question:
      "Fill in the blank. Choose from: labyrinth, nuisance, debris, enigma, turmoil.\n\nThe constant buzzing of the fly was a ________ during the exam.",
    options: ["labyrinth", "nuisance", "debris", "enigma", "turmoil"],
    answer: 1,
    explanation:
      "‘Nuisance’ means something that causes inconvenience or annoyance.",
  },

  // ── Section D — Grammar ──
  {
    section: "grammar",
    question:
      '"Me and my friends went to the park."\n\nWhat is the correct correction?',
    options: [
      "Me and my friends went to the park.",
      "My friends and I went to the park.",
      "I and my friends went to the park.",
      "My friends and me went to the park.",
    ],
    answer: 1,
    explanation:
      "‘My friends and I’ is correct because the subject pronoun ‘I’ is needed. ‘Me’ is an object pronoun.",
  },
  {
    section: "grammar",
    question:
      '"I am a greater accountant."\n\nWhat is the correct correction?',
    options: [
      "I am a greater accountant.",
      "I am a greatest accountant.",
      "I am a great accountant.",
      "I am more greater accountant.",
    ],
    answer: 2,
    explanation:
      "‘Great’ is correct because no comparison is being made, so the comparative form ‘greater’ is incorrect.",
  },
  {
    section: "grammar",
    question:
      '"The loud music did not effect his concentration."\n\nWhat is the correct correction?',
    options: [
      "The loud music did not affect his concentration.",
      "The loud music did not effect his concentration.",
      "The loud music did not affected his concentration.",
      "The loud music did not effects his concentration.",
    ],
    answer: 0,
    explanation: "‘Affect’ is the verb. ‘Effect’ is usually a noun.",
  },
  {
    section: "grammar",
    question:
      '"Your going to regret not starting earlier, trust me."\n\nWhat is the correct correction?',
    options: [
      "Your going to regret not starting earlier, trust me.",
      "You’re going to regret not starting earlier, trust me.",
      "Yours going to regret not starting earlier, trust me.",
      "You going to regret not starting earlier, trust me.",
    ],
    answer: 1,
    explanation: "‘You’re’ is the contraction of ‘you are.’ ‘Your’ is possessive.",
  },
  {
    section: "grammar",
    question:
      '"Its going to be a long day, so make sure you eat something."\n\nWhat is the correct correction?',
    options: [
      "Its going to be a long day, so make sure you eat something.",
      "It’s going to be a long day, so make sure you eat something.",
      "Its’ going to be a long day, so make sure you eat something.",
      "It going to be a long day, so make sure you eat something.",
    ],
    answer: 1,
    explanation: "‘It’s’ is the contraction of ‘it is.’ ‘Its’ is possessive.",
  },
];
