// All answers verified against Cambridge 1123 conventions (British English rules).

export type McqOption = "A" | "B" | "C" | "D";

export interface McqQuestion {
  question: string;
  options: Record<McqOption, string>;
  answer: McqOption;
  explanation: string;
  section: "A" | "B" | "C";
}

export interface McqSet {
  id: string;
  title: string;
  description: string;
  /** Optional time limit in seconds — displayed in the resource viewer header. */
  timeLimit?: number;
  questions: McqQuestion[];
}

/** Dev-only guard: every `answer` must match an option key (prevents typos in keys). */
function validateMcqAnswerKeys(sets: Record<string, McqSet>): void {
  if (process.env.NODE_ENV === "production") return;
  for (const [setId, set] of Object.entries(sets)) {
    set.questions.forEach((q, idx) => {
      if (!(q.answer in q.options)) {
        console.error(
          `[mcq-data] answer "${q.answer}" is not an option key in set "${setId}" question ${idx + 1}: ${q.question.slice(0, 60)}…`
        );
      }
    });
  }
}

const mcqSetsInternal: Record<string, McqSet> = {
  "mcq-compound-complex-sentences": {
    id: "mcq-compound-complex-sentences",
    title: "5-Minute Drill: Clear Sentences & Joining",
    description:
      "10 questions · 5 minutes · exam level. Sentences and fragments, commas in real 1123-style lines, and quick fixes — plain wording, no grammar labels.",
    timeLimit: 300,
    questions: [
      // SECTION A — sentence vs fragment (3)
      {
        section: "A",
        question: "Which option is a complete sentence?",
        options: {
          A: "Running through the park in the rain.",
          B: "Because the bell had already rung.",
          C: "The team celebrated after the final whistle.",
          D: "Although the coach was pleased with the effort.",
        },
        answer: "C",
        explanation:
          'A sentence must express a full thought with a subject and a main verb. "The team celebrated after the final whistle" stands alone. A, B, and D are fragments — they do not finish the idea on their own.',
      },
      {
        section: "A",
        question: "Which option is a fragment, not a sentence?",
        options: {
          A: "She closed the window before the storm arrived.",
          B: "Hoping for better weather tomorrow.",
          C: "They waited at the bus stop for twenty minutes.",
          D: "The exam was harder than we expected.",
        },
        answer: "B",
        explanation:
          '"Hoping for better weather tomorrow" has no subject paired with a full statement — it cannot stand alone. The other options are complete sentences.',
      },
      {
        section: "A",
        question: "Is this a sentence or a fragment?\n\"While the audience was still clapping.\"",
        options: {
          A: "A sentence — it has a subject and a verb.",
          B: "A fragment — it starts with \"While\" and does not finish the thought.",
          C: "A sentence — it ends with a full stop.",
          D: "A fragment — it has no verb.",
        },
        answer: "B",
        explanation:
          'The line begins with "While," so the reader expects more after the comma or full stop. On its own it is a fragment.',
      },
      // SECTION B — comma placement (4)
      {
        section: "B",
        question:
          "Where should the comma go?\n\"After the results were announced the hall fell silent.\"",
        options: {
          A: "After the results were announced, the hall fell silent.",
          B: "After, the results were announced the hall fell silent.",
          C: "After the results were announced the hall, fell silent.",
          D: "No comma is needed.",
        },
        answer: "A",
        explanation:
          'When the opening part cannot stand alone as a sentence, put a comma after it: "After the results were announced, the hall fell silent."',
      },
      {
        section: "B",
        question:
          "Which sentence is punctuated correctly? (The extra detail about the book could be removed.)",
        options: {
          A: "The novel which won the prize was translated into twelve languages.",
          B: "The novel, which won the prize, was translated into twelve languages.",
          C: "The novel which won the prize, was translated into twelve languages.",
          D: "The novel, which won the prize was translated into twelve languages.",
        },
        answer: "B",
        explanation:
          'If the part about winning the prize is extra information, use a comma before and after it: "The novel, which won the prize, was translated..."',
      },
      {
        section: "B",
        question:
          "Which sentence correctly joins two full ideas with a comma and \"but\"?",
        options: {
          A: "The plan looked simple it failed at the first step.",
          B: "The plan looked simple, but it failed at the first step.",
          C: "The plan looked simple but, it failed at the first step.",
          D: "The plan looked simple but it failed at the first step.",
        },
        answer: "B",
        explanation:
          'Two full ideas joined by "but" need a comma before "but": "...simple, but it failed..."',
      },
      {
        section: "B",
        question:
          "Which sentence avoids a comma splice? (Two full ideas need proper linking.)",
        options: {
          A: "The ferry was cancelled, we took the train instead.",
          B: "The ferry was cancelled; we took the train instead.",
          C: "The ferry was cancelled we took the train instead.",
          D: "The ferry was cancelled, and, we took the train instead.",
        },
        answer: "B",
        explanation:
          'You cannot link two full ideas with only a comma (that is a comma splice). A semicolon is one correct fix: "The ferry was cancelled; we took the train instead."',
      },
      // SECTION C — exam-style correction (3)
      {
        section: "C",
        question: "Which rewrite fixes the error?\n\"Because she revised every evening. She passed with confidence.\"",
        options: {
          A: "Because she revised every evening she passed with confidence.",
          B: "She revised every evening. Because she passed with confidence.",
          C: "Because she revised every evening; she passed with confidence.",
          D: "She passed with confidence, because she revised every evening.",
        },
        answer: "D",
        explanation:
          'The first line is only half an idea after "Because." Putting the main idea first often reads clearly: "She passed with confidence, because she revised every evening."',
      },
      {
        section: "C",
        question: "What is wrong here?\n\"I wanted to stay longer, although I left early.\"",
        options: {
          A: "The word \"although\" turns the meaning the wrong way.",
          B: "A comma cannot appear in this sentence.",
          C: "The sentence needs a semicolon after \"longer.\"",
          D: "Both parts should be questions.",
        },
        answer: "A",
        explanation:
          '"Although" suggests something surprising — usually that you did not stay. If you left early because you wanted to stay longer, use a word that shows result, such as "so": "I wanted to stay longer, so I was disappointed to leave early."',
      },
      {
        section: "C",
        question: "Which sentence is written correctly?",
        options: {
          A: "She practised daily however her scores barely moved.",
          B: "She practised daily, yet her scores barely moved.",
          C: "She practised daily yet, her scores barely moved.",
          D: "She practised daily; yet her scores barely moved.",
        },
        answer: "B",
        explanation:
          '"Yet" can join two full ideas like "but." Use a comma before it: "She practised daily, yet her scores barely moved." "However" cannot be used like "yet" here without heavier punctuation.',
      },
    ],
  },

  "mcq-common-grammatical-errors": {
    id: "mcq-common-grammatical-errors",
    title: "5-Minute Drill: Common Errors",
    description:
      "10 questions · 5 minutes. Quick checks on words, tense, and punctuation that often cost marks — plain wording throughout.",
    timeLimit: 300,
    questions: [
      // SECTION A — Basic Accuracy (3)
      {
        section: "A",
        question: "Which sentence is written correctly?",
        options: {
          A: "Neither of the answers are correct.",
          B: "Neither of the answers is correct.",
          C: "Neither of the answers were correct.",
          D: "Neither of the answers be correct.",
        },
        answer: "B",
        explanation:
          'Use a singular verb with "neither of": "Neither of the answers is correct."',
      },
      {
        section: "A",
        question: "Which sentence is written correctly?",
        options: {
          A: "\"That’s amazing\", she said.",
          B: "\"That’s amazing!\", she said.",
          C: "\"That’s amazing\"! she said.",
          D: "\"That’s amazing!\" she said.",
        },
        answer: "D",
        explanation:
          "Use the exclamation mark inside the quotation marks, and do not add a comma before the reporting clause. The exclamation mark already ends the sentence: \"That's amazing!\" she said.",
      },
      {
        section: "A",
        question: "Which word fits best?\n\"The new rules will _____ everyone in Year 11.\"",
        options: {
          A: "affect",
          B: "effect",
          C: "affects",
          D: "effects",
        },
        answer: "A",
        explanation:
          'You need a verb meaning "influence": "will affect everyone."',
      },
      // SECTION B — Common Exam Errors (4)
      {
        section: "B",
        question: "Which sentence uses the correct word?",
        options: {
          A: "We reached the station than boarded the train.",
          B: "We reached the station then boarded the train.",
          C: "We reached the station then the train was late than expected.",
          D: "We reached the station than the train was late then expected.",
        },
        answer: "B",
        explanation:
          '"Then" relates to time or sequence. "Than" is used for comparison.',
      },
      {
        section: "B",
        question: "Which sentence is written correctly?",
        options: {
          A: "There were less students on the bus today.",
          B: "She has fewer money than her sister.",
          C: "There were fewer students on the bus today.",
          D: "She has fewer time to finish than him.",
        },
        answer: "C",
        explanation:
          'Use "fewer" with things you can count ("students"); "less" with amounts like time or money.',
      },
      {
        section: "B",
        question: "Which sentence uses the correct word?",
        options: {
          A: "Their is a quiet corner near the library.",
          B: "There revision notes are on the desk.",
          C: "Their revision group meets after school.",
          D: "The students left there bags in class.",
        },
        answer: "C",
        explanation:
          '"Their" shows possession. "There" refers to a place or position.',
      },
      {
        section: "B",
        question: "Which sentence is written correctly?",
        options: {
          A: "The jury has reached its verdict.",
          B: "The jury have reached their verdict.",
          C: "The jury has reached their verdict.",
          D: "The jury have reached its verdict.",
        },
        answer: "A",
        explanation:
          'Treat "jury" as one unit in formal writing: singular verb "has" and "its."',
      },
      // SECTION C — Fix the Sentence (3)
      {
        section: "C",
        question: "Which version fixes the mistake?\n\"Running for the bus, her books fell on the steps.\"",
        options: {
          A: "Running for the bus, her books dropped on the steps.",
          B: "Running for the bus, she dropped her books on the steps.",
          C: "Her books, running for the bus, fell on the steps.",
          D: "She was running for the bus her books fell on the steps.",
        },
        answer: "B",
        explanation:
          'The person running should follow the opening phrase: "she dropped her books."',
      },
      {
        section: "C",
        question: "Which sentence is written correctly?",
        options: {
          A: "The research, carried out over three years, have produced useful results.",
          B: "The research, carried out over three years, has produced useful results.",
          C: "The research carried out over three years have produced useful results.",
          D: "The research, carried out over three years has produced useful results.",
        },
        answer: "B",
        explanation:
          '"Research" is singular here, so use "has produced"; keep commas around the added phrase.',
      },
      {
        section: "C",
        question: "Where is the mistake?\n\"The evidence shows that the results supports our idea.\"",
        options: {
          A: "\"Evidence shows\" should be \"evidence show.\"",
          B: "\"Results supports\" should be \"results support.\"",
          C: "The word \"that\" should be removed.",
          D: "\"Our idea\" should be \"us idea.\"",
        },
        answer: "B",
        explanation:
          'Plural "results" needs "support," not "supports."',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 5-MINUTE DRILL: SENTENCES & COMMAS
  // ══════════════════════════════════════════════════════════════════════
  "mcq-sentence-comma-5min": {
    id: "mcq-sentence-comma-5min",
    title: "5-Minute Drill: Sentences & Commas",
    description:
      "10 questions · 5 minutes. Identify sentences vs fragments, place commas correctly, and fix common exam errors — built from real 1123 marking patterns.",
    timeLimit: 300,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Identify sentence vs fragment
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question: "Which of the following is a complete sentence?",
        options: {
          A: "Running through the park every morning.",
          B: "Because she was tired.",
          C: "The dog barked loudly.",
          D: "After the long and exhausting journey.",
        },
        answer: "C",
        explanation:
          'A complete sentence needs a subject and a verb that together express a full thought. "The dog barked loudly" has both (subject: "The dog"; verb: "barked") and makes sense on its own. The other options are fragments — they either lack a main verb or do not finish the idea on their own.',
      },
      {
        section: "A",
        question: "Which of the following is a fragment, not a sentence?",
        options: {
          A: "She finished her homework before dinner.",
          B: "The concert was very loud.",
          C: "Although it was raining heavily.",
          D: "They arrived at the station on time.",
        },
        answer: "C",
        explanation:
          '"Although it was raining heavily" cannot stand alone as a sentence — it leaves the reader waiting for the rest of the idea. The other options each finish a full thought on their own.',
      },
      {
        section: "A",
        question: "Identify the sentence.",
        options: {
          A: "During the summer holidays in July.",
          B: "The scientists discovered a new species.",
          C: "Working hard to meet the deadline.",
          D: "Before the sun had even risen.",
        },
        answer: "B",
        explanation:
          '"The scientists discovered a new species" is the only option with a clear subject ("The scientists") and a finite verb ("discovered") that together form a complete thought. The remaining options are fragments — they do not stand alone as full sentences.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Comma placement
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "Which sentence uses commas correctly when listing items?",
        options: {
          A: "She bought apples oranges, and bananas.",
          B: "She bought apples, oranges, and bananas.",
          C: "She bought, apples, oranges and bananas.",
          D: "She bought apples, oranges and, bananas.",
        },
        answer: "B",
        explanation:
          'In a list of three or more items, commas separate each item. "She bought apples, oranges, and bananas" places commas correctly between all items. Option A is missing the comma after "apples"; Option C puts an incorrect comma after "bought"; Option D places the comma in the wrong position before "bananas".',
      },
      {
        section: "B",
        question:
          "Where should the comma be placed in this sentence?\n\"After finishing her homework she went out to play.\"",
        options: {
          A: "After \"finishing\"",
          B: "After \"she\"",
          C: "After \"homework\"",
          D: "No comma is needed.",
        },
        answer: "C",
        explanation:
          'When an opening phrase comes before the main idea, put a comma after that phrase. "After finishing her homework" is the opening part, so the comma goes after "homework": "After finishing her homework, she went out to play."',
      },
      {
        section: "B",
        question:
          "Which sentence correctly uses a comma before a joining word like \"but\"?",
        options: {
          A: "She wanted to go, but she was tired.",
          B: "She wanted to go but, she was tired.",
          C: "She wanted, to go but she was tired.",
          D: "She, wanted to go but she was tired.",
        },
        answer: "A",
        explanation:
          'When two full ideas are joined by a word like "and," "but," or "yet," use a comma before that word: "She wanted to go, but she was tired." The other options misplace or omit the comma.',
      },
      {
        section: "B",
        question:
          "My brother is a doctor. Which sentence adds where he lives, using commas correctly?",
        options: {
          A: "My brother who lives in London is a doctor.",
          B: "My brother, who lives in London, is a doctor.",
          C: "My brother, who lives in London is a doctor.",
          D: "My brother who lives, in London, is a doctor.",
        },
        answer: "B",
        explanation:
          'When the extra detail could be lifted out and the sentence still works ("My brother is a doctor"), put a comma before and after that detail: "My brother, who lives in London, is a doctor."',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Exam-style corrections
      // ──────────────────────────────════════════════════════════════════
      {
        section: "C",
        question:
          "Choose the correctly punctuated version of the following:\n\"The teacher explained the lesson the students took notes.\"",
        options: {
          A: "The teacher explained the lesson, the students took notes.",
          B: "The teacher explained the lesson; the students took notes.",
          C: "The teacher explained, the lesson the students took notes.",
          D: "The teacher explained the lesson the students, took notes.",
        },
        answer: "B",
        explanation:
          'The original is a run-on — two full sentences joined without punctuation. A semicolon correctly separates two closely related full sentences. Option A creates a comma splice (two full sentences joined only by a comma, which is incorrect). Options C and D misplace punctuation.',
      },
      {
        section: "C",
        question:
          "Which of the following fixes the fragment by turning it into a complete sentence?",
        options: {
          A: "Because the match was cancelled. The team was disappointed.",
          B: "The team was disappointed because the match was cancelled.",
          C: "Because the match was cancelled, and the team was disappointed.",
          D: "The team, because the match was cancelled.",
        },
        answer: "B",
        explanation:
          '"The team was disappointed because the match was cancelled" combines the ideas into one correct sentence. The part starting with "because" explains why and follows the main idea. Option A keeps them as two separate (incorrect) units; Options C and D remain grammatically incomplete.',
      },
      {
        section: "C",
        question:
          "Which sentence is correctly punctuated throughout?",
        options: {
          A: "Despite the rain the match continued and the fans, cheered loudly.",
          B: "Despite the rain, the match continued, and the fans cheered loudly.",
          C: "Despite, the rain the match continued and the fans cheered loudly.",
          D: "Despite the rain, the match continued and the fans, cheered loudly.",
        },
        answer: "B",
        explanation:
          '"Despite the rain, the match continued, and the fans cheered loudly" is correctly punctuated throughout: a comma follows the opening phrase "Despite the rain", and a comma precedes "and" when it joins two full ideas. Option A omits the opening comma and misplaces the second; Option C puts an incorrect comma after "Despite"; Option D misplaces the second comma.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 5-MINUTE DRILL: PUNCTUATION
  // ══════════════════════════════════════════════════════════════════════
  "mcq-punctuation-5min": {
    id: "mcq-punctuation-5min",
    title: "5-Minute Drill: Punctuation",
    description:
      "10 questions · 5 minutes. Dialogue format, em dashes, colons, and comma rules — the marks most students leave on the table.",
    timeLimit: 300,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Dialogue format + em dash
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question: "Which sentence correctly punctuates dialogue?",
        options: {
          A: "Sara said, \"I cannot believe it.\"",
          B: "Sara said \"I cannot believe it.\"",
          C: "Sara said, I cannot believe it.",
          D: "\"Sara said, I cannot believe it.\"",
        },
        answer: "A",
        explanation:
          'When a dialogue tag (e.g. "Sara said") introduces speech, it is followed by a comma, and the spoken words are enclosed in double quotation marks. The full stop goes inside the closing quotation mark. Option A follows all three rules correctly.',
      },
      {
        section: "A",
        question:
          "Which sentence correctly punctuates the following dialogue?\n(The speaker tag comes AFTER the spoken words.)",
        options: {
          A: "\"I cannot believe it,\" Sara said.",
          B: "\"I cannot believe it.\" Sara said.",
          C: "\"I cannot believe it\" Sara said.",
          D: "I cannot believe it, Sara said.",
        },
        answer: "A",
        explanation:
          'When a dialogue tag follows the spoken words, a comma (not a full stop) ends the quoted speech inside the quotation marks, and the tag begins with a lower-case letter. "\"I cannot believe it,\" Sara said." is the only option that applies all these rules correctly.',
      },
      {
        section: "A",
        question:
          "Which sentence uses the em dash correctly?",
        options: {
          A: "She had one goal — to win the championship.",
          B: "She had one goal to — win the championship.",
          C: "She had — one goal to win the championship.",
          D: "She had one goal to win — the championship.",
        },
        answer: "A",
        explanation:
          'An em dash can introduce or emphasise information after the first part of the sentence. "She had one goal — to win the championship" correctly places the em dash between the general statement and the detail that follows. The other options break the sentence at illogical points.',
      },
      {
        section: "A",
        question:
          "Which sentence correctly uses em dashes to enclose a parenthetical remark?",
        options: {
          A: "The project — which took three years — was finally complete.",
          B: "The project — which took three years, was finally complete.",
          C: "The project, which took three years — was finally complete.",
          D: "The project which — took three years — was finally complete.",
        },
        answer: "A",
        explanation:
          'Em dashes used to enclose parenthetical information must appear on both sides of the inserted remark, mirroring the way commas or brackets work. "The project — which took three years — was finally complete" places the dashes symmetrically around "which took three years". The other options are asymmetric or split the sentence illogically.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Colon + comma rules
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "Which sentence uses the colon correctly?",
        options: {
          A: "She loves three things: reading, hiking, and cooking.",
          B: "She loves: three things reading, hiking, and cooking.",
          C: "She loves three things reading: hiking and cooking.",
          D: "She loves three things, reading: hiking and cooking.",
        },
        answer: "A",
        explanation:
          'A colon after a full sentence or complete first part introduces a list, explanation, or elaboration. "She loves three things: reading, hiking, and cooking" has a complete statement before the colon ("She loves three things") and a correctly formatted list after it. The other options place the colon in the wrong place.',
      },
      {
        section: "B",
        question:
          "Where should the comma go?\n\"When the bell rang the students left the room.\"",
        options: {
          A: "When the bell rang the students left the room.",
          B: "When the bell rang, the students left the room.",
          C: "When, the bell rang the students left the room.",
          D: "When the bell rang the students, left the room.",
        },
        answer: "B",
        explanation:
          'When the sentence opens with a part that cannot stand alone, put a comma before the main idea. "When the bell rang, the students left the room" is correct. The other options either omit the comma or place it in the wrong spot.',
      },
      {
        section: "B",
        question:
          "Which sentence correctly uses a colon to introduce an explanation?",
        options: {
          A: "He was nervous: because he had not prepared.",
          B: "He was nervous for one reason: he had not prepared.",
          C: "He was: nervous because he had not prepared.",
          D: "He was nervous because: he had not prepared.",
        },
        answer: "B",
        explanation:
          'A colon must follow a complete sentence or full statement. "He was nervous for one reason: he had not prepared" places the colon after a complete first part and introduces the explanation that follows. Options A, C, and D all place the colon in the wrong place — before "because", after "was", or after "because".',
      },
      {
        section: "B",
        question:
          "Which of the following correctly punctuates a sentence with an appositive?",
        options: {
          A: "My teacher, Mr Ahmed taught us grammar.",
          B: "My teacher Mr Ahmed, taught us grammar.",
          C: "My teacher, Mr Ahmed, taught us grammar.",
          D: "My teacher Mr Ahmed taught us grammar.",
        },
        answer: "C",
        explanation:
          'When a name or title repeats who someone is, set it off with commas on both sides if the extra words could be removed. "My teacher, Mr Ahmed, taught us grammar" is correct. Option D omits the commas; Options A and B each include only one comma, which is incorrect.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Mixed exam traps
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "Which sentence wrongly adds extra punctuation after the spoken words?",
        options: {
          A: "\"Are you coming?\" Mum asked.",
          B: "\"Are you coming?\", Mum asked.",
          C: "\"Are you coming,\" Mum asked.",
          D: "Mum asked, \"Are you coming?\"",
        },
        answer: "B",
        explanation:
          'Do not put a comma after the closing quotation mark when ? or ! already ends the spoken words. "\"Are you coming?\" Mum asked." is correct. Option B wrongly adds a comma after the closing quote.',
      },
      {
        section: "C",
        question:
          "Identify the sentence that is correctly punctuated throughout.",
        options: {
          A: "The coach said, \"train harder\" and the players agreed.",
          B: "The coach said, \"Train harder,\" and the players agreed.",
          C: "The coach said \"Train harder,\" and the players agreed.",
          D: "The coach said, \"Train harder.\" And the players agreed.",
        },
        answer: "B",
        explanation:
          '"The coach said, \"Train harder,\" and the players agreed." applies all rules correctly: a comma follows the dialogue tag; the spoken words begin with a capital; a comma inside the closing quotation mark separates the speech from what follows; and "and" continues in lower case because the sentence is not finished. Option A lacks a capital and a comma inside the quotes; Option C omits the comma after "said"; Option D creates a fragment after the full stop.',
      },
    ],
  },
};

validateMcqAnswerKeys(mcqSetsInternal);
export const mcqSets = mcqSetsInternal;
