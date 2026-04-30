// All answers verified against Cambridge 1123 conventions (British English rules).
// Audit log (subtle fixes): comma+but drill (removed short-clause ambiguity), "Because…" set (A=because+so),
// Q9 comma placement (compound subject + compound predicate; no comma), collective Q → "every one… was",
// fragment While-clause distractor D (verb claim removed), list + Despite-rain explanations tightened,
// dialogue-after-tag explanation (proper noun vs reporting verb).

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
          'When a dialogue tag follows the spoken words, a comma (not a full stop) ends the quoted speech inside the quotation marks; the reporting verb stays lower case ("said"). The name "Sara" stays capitalised as a proper noun. Correct line: "I cannot believe it," Sara said.',
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

  // ══════════════════════════════════════════════════════════════════════
  // FEELINGS PRACTICE WORKSHEET
  // ══════════════════════════════════════════════════════════════════════
  "mcq-feelings-practice": {
    id: "mcq-feelings-practice",
    title: "Feelings Practice Worksheet",
    description:
      "20 questions · 10 minutes. Read the quote and the context, then choose the feeling that best fits — exam-style vocabulary, no vague words.",
    timeLimit: 600,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — From Dialogue
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question:
          "\"I've never been on a stage before. What if I forget everything?\"\n— a student speaking before their first school assembly\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Anxious",
          B: "Proud",
          C: "Excited",
          D: "Relieved",
        },
        answer: "A",
        explanation:
          'The speaker fears forgetting and has never done this before — both are signs of anxiety. "Proud" or "excited" would imply confidence or anticipation, which the words do not support.',
      },
      {
        section: "A",
        question:
          "\"You actually finished the whole thing? In two days?\"\n— said to a classmate who completed a group project alone\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Angry",
          B: "Relieved",
          C: "Impressed",
          D: "Sad",
        },
        answer: "C",
        explanation:
          'The question and emphasis on "In two days?" show the speaker cannot quite believe what they are hearing — they are impressed and astonished by the achievement.',
      },
      {
        section: "A",
        question:
          "\"I told you I could do it, and I did. Nobody believed me.\"\n— after winning first place in a competition nobody expected them to win\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Shocked",
          B: "Proud",
          C: "Amused",
          D: "Lonely",
        },
        answer: "B",
        explanation:
          'The speaker has proved doubters wrong and explicitly states their achievement — this is pride. "Shocked" would imply the speaker did not expect to win, which contradicts "I told you I could do it."',
      },
      {
        section: "A",
        question:
          "\"Oh, it doesn't matter. It's fine. I'm used to it.\"\n— said quietly after being left out of a group activity again\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Angry",
          B: "Excited",
          C: "Nostalgic",
          D: "Hurt",
        },
        answer: "D",
        explanation:
          'The quiet tone and "I\'m used to it" signal resignation and suppressed hurt. The speaker is hiding pain, not expressing anger. "Angry" is possible but the tone here is sadness, not rage.',
      },
      {
        section: "A",
        question:
          "\"I can't believe they picked me. There must be a mistake.\"\n— after being selected as head prefect\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Shocked",
          B: "Proud",
          C: "Amused",
          D: "Relieved",
        },
        answer: "A",
        explanation:
          '"There must be a mistake" shows the speaker cannot accept the news as real — they are shocked and disbelieving. Accept "surprised" only if paired with self-doubt.',
      },
      {
        section: "A",
        question:
          "\"Just jump. It's only water. You've done harder things than this.\"\n— said to themselves before diving off a high board for the first time\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Nostalgic",
          B: "Amused",
          C: "Nervous",
          D: "Bitter",
        },
        answer: "C",
        explanation:
          'The speaker is giving themselves a pep talk — which only happens when someone is scared or nervous. The self-talk shows fear being overridden by willpower.',
      },
      {
        section: "A",
        question:
          "\"That was my grandmother's recipe. She used to make it every Friday.\"\n— looking at an old family photo album while cooking\n\nWhich feeling best describes the speaker?",
        options: {
          A: "Proud",
          B: "Nostalgic",
          C: "Anxious",
          D: "Eager",
        },
        answer: "B",
        explanation:
          'The speaker is recalling a memory tied to a lost or absent person — this is nostalgia. The past tense "used to" reinforces that the experience is remembered rather than present.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — From Narrative Detail
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "\"She read the email three times, then closed her laptop without replying.\"\n— after receiving unexpected criticism from her manager\n\nWhich feeling best describes the character?",
        options: {
          A: "Amused",
          B: "Carefree",
          C: "Nostalgic",
          D: "Hurt",
        },
        answer: "D",
        explanation:
          'Reading something multiple times and then going silent — without replying — shows the character has been stunned or hurt. The unexpected nature of the criticism deepens the impact.',
      },
      {
        section: "B",
        question:
          "\"His hands shook as he unfolded the letter, but his voice was steady when he read it aloud.\"\n— opening exam results in front of his family\n\nWhich feeling best describes the character?",
        options: {
          A: "Tense",
          B: "Relieved",
          C: "Carefree",
          D: "Proud",
        },
        answer: "A",
        explanation:
          'The shaking hands reveal physical anxiety even as the character tries to appear calm. The contrast between inner tension and outward composure is the key detail here.',
      },
      {
        section: "B",
        question:
          "\"She stood at the back of the room, arms folded, watching everyone else celebrate.\"\n— after her team won but she had been benched for the final match\n\nWhich feeling best describes the character?",
        options: {
          A: "Relieved",
          B: "Frustrated",
          C: "Amused",
          D: "Nostalgic",
        },
        answer: "B",
        explanation:
          'Standing apart with arms folded while others celebrate shows the character feels left out and bitter. She should share in the victory but cannot, because she was excluded from playing.',
      },
      {
        section: "B",
        question:
          "\"He kept checking over his shoulder, walking faster with each step.\"\n— walking home alone through an unfamiliar street at night\n\nWhich feeling best describes the character?",
        options: {
          A: "Nostalgic",
          B: "Excited",
          C: "Scared",
          D: "Amused",
        },
        answer: "C",
        explanation:
          'Checking over the shoulder and speeding up are instinctive fear responses. The unfamiliar setting at night reinforces that the character feels vulnerable and frightened.',
      },
      {
        section: "B",
        question:
          "\"For the first time in months, she put her phone down and just listened to the rain.\"\n— sitting by the window after a long period of stress\n\nWhich feeling best describes the character?",
        options: {
          A: "Relieved",
          B: "Anxious",
          C: "Frustrated",
          D: "Proud",
        },
        answer: "A",
        explanation:
          '"For the first time in months" tells us this moment is rare. The act of putting the phone down and simply listening suggests the stress has lifted — the character is finally at peace.',
      },
      {
        section: "B",
        question:
          "\"He laughed so hard that his drink came out of his nose, and he didn't even care.\"\n— during a lunch break with old school friends he hadn't seen in years\n\nWhich feeling best describes the character?",
        options: {
          A: "Lonely",
          B: "Amused",
          C: "Tense",
          D: "Determined",
        },
        answer: "B",
        explanation:
          'Uncontrollable laughter and not caring about embarrassment show complete carefree amusement. The reunion context deepens the happiness — he is fully at ease.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Mixed Feelings (Harder)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "\"She wanted to scream at him, but instead she smiled and said, 'Good luck with that.'\"\n— responding to someone who had just taken credit for her idea in a meeting\n\nWhich feeling best describes the character?",
        options: {
          A: "Happy",
          B: "Relieved",
          C: "Nostalgic",
          D: "Angry",
        },
        answer: "D",
        explanation:
          'The urge to scream reveals rage. The sarcastic smile and dismissive comment are controlled ways of expressing contempt. Students who write "happy" should be redirected — the smile is not genuine.',
      },
      {
        section: "C",
        question:
          "\"I know I should be excited, but honestly, I just feel tired.\"\n— said the night before leaving for a trip they had planned for a year\n\nWhich feeling best describes the character?",
        options: {
          A: "Overwhelmed",
          B: "Proud",
          C: "Amused",
          D: "Nostalgic",
        },
        answer: "A",
        explanation:
          'The character is fighting conflicting feelings — they know excitement is expected but feel drained instead. This exhaustion alongside a big event signals being overwhelmed. Accept "conflicted" if the student explains the contradiction.',
      },
      {
        section: "C",
        question:
          "\"He stared at the empty chair across the dinner table and set down two plates anyway.\"\n— a father on the first evening after his daughter left for university\n\nWhich feeling best describes the character?",
        options: {
          A: "Proud",
          B: "Amused",
          C: "Lonely",
          D: "Relieved",
        },
        answer: "C",
        explanation:
          'Setting two plates out of habit shows the father has not yet adjusted to his daughter\'s absence. The empty chair is a symbol of loss. The dominant feeling is loneliness, with traces of nostalgia.',
      },
      {
        section: "C",
        question:
          "\"She didn't clap when the announcement was made. She just nodded, once, and left.\"\n— after someone else was promoted to the position she had applied for\n\nWhich feeling best describes the character?",
        options: {
          A: "Happy",
          B: "Disappointed",
          C: "Relieved",
          D: "Amused",
        },
        answer: "B",
        explanation:
          'The restrained, silent exit — no clapping, just a single nod — communicates controlled disappointment. Restraint and silence are the key cues here. The feeling is defeat, not anger.',
      },
      {
        section: "C",
        question:
          "\"'You're mad,' he said, grinning. 'Completely, absolutely mad.' He followed her anyway.\"\n— said to a friend who suggested climbing a fence to get into a closed park\n\nWhich feeling best describes the character?",
        options: {
          A: "Frightened",
          B: "Annoyed",
          C: "Frustrated",
          D: "Amused",
        },
        answer: "D",
        explanation:
          'The grin and the fact that he follows her reveal genuine delight, not criticism. He calls her "mad" playfully — the word "grinning" and "He followed her anyway" together show he is thrilled by the idea.',
      },
      {
        section: "C",
        question:
          "\"I don't understand why they're making us do this. None of it makes any sense.\"\n— muttered during a confusing group task with no clear instructions\n\nWhich feeling best describes the character?",
        options: {
          A: "Confused",
          B: "Nostalgic",
          C: "Relieved",
          D: "Proud",
        },
        answer: "A",
        explanation:
          '"I don\'t understand" and "None of it makes any sense" both directly state the character\'s confusion. Frustration is present too, but confusion is the dominant and most specific feeling.',
      },
      {
        section: "C",
        question:
          "\"She kept her hand raised even after the teacher had moved on, whispering 'please' under her breath.\"\n— a student desperate to answer a question she finally understood\n\nWhich feeling best describes the character?",
        options: {
          A: "Frightened",
          B: "Nostalgic",
          C: "Eager",
          D: "Sad",
        },
        answer: "C",
        explanation:
          'The persistence — keeping her hand up after being passed over, whispering "please" — shows intense eagerness. The "please" signals desire, not politeness. The character is desperate to be heard.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // RESULT ADJECTIVES PRACTICE WORKSHEET
  // ══════════════════════════════════════════════════════════════════════
  "mcq-result-adjectives": {
    id: "mcq-result-adjectives",
    title: "Result Adjectives Practice Worksheet",
    description:
      "20 questions · 10 minutes. Read the quote, picture the scene, and choose the adjective cluster that best describes it — using the 8-cluster framework.",
    timeLimit: 600,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Clusters 1–4
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question:
          "\"The dog planted its legs wide apart, every muscle locked, a low growl building in its chest.\"\n— a stray dog blocking the path ahead\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Calm / Peaceful",
          B: "Dangerous / Threatening",
          C: "Beautiful / Captivating",
          D: "Tense / Dramatic",
        },
        answer: "B",
        explanation:
          'Every detail — the wide stance, locked muscles, low growl — signals threat. The dog is actively blocking the path and preparing to attack. The scene is Dangerous / Threatening.',
      },
      {
        section: "A",
        question:
          "\"The current dragged at her ankles, pulling harder with each step, the rocks invisible beneath the foam.\"\n— crossing a swollen river after heavy rain\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Chaotic / Frantic",
          B: "Powerful / Energetic",
          C: "Dangerous / Threatening",
          D: "Mysterious / Otherworldly",
        },
        answer: "C",
        explanation:
          'The pulling current and invisible rocks create a direct personal threat. Students may choose "chaotic" — but the focus is on danger to the character, not disorder. The scene is Dangerous / Threatening.',
      },
      {
        section: "A",
        question:
          "\"The wave hit the seawall and hurled spray thirty feet into the air, shaking the ground beneath us.\"\n— watching a winter storm from a harbour wall\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Dangerous / Threatening",
          B: "Powerful / Energetic",
          C: "Chaotic / Frantic",
          D: "Tense / Dramatic",
        },
        answer: "B",
        explanation:
          'Spray hurled thirty feet and the ground shaking demonstrate enormous force. The observers are watching from safety — the emphasis is on power and energy, not personal danger. The scene is Powerful / Energetic.',
      },
      {
        section: "A",
        question:
          "\"She launched herself from the starting block like something fired from a cannon, arms slicing the water.\"\n— the opening seconds of a swimming race\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Tense / Dramatic",
          B: "Calm / Peaceful",
          C: "Powerful / Energetic",
          D: "Chaotic / Frantic",
        },
        answer: "C",
        explanation:
          '"Fired from a cannon" and "arms slicing the water" are images of explosive, controlled power. The scene is Powerful / Energetic.',
      },
      {
        section: "A",
        question:
          "\"The frost had turned every blade of grass into a slender crystal, and the whole field glittered as if someone had scattered diamonds.\"\n— early morning in winter\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Mysterious / Otherworldly",
          B: "Beautiful / Captivating",
          C: "Calm / Peaceful",
          D: "Powerful / Energetic",
        },
        answer: "B",
        explanation:
          'The simile of scattered diamonds focuses on visual beauty. The scene is still and lovely — not mysterious or threatening. The scene is Beautiful / Captivating.',
      },
      {
        section: "A",
        question:
          "\"The fabric was so finely woven that it seemed to change colour with every fold, shifting from copper to gold to deep burgundy.\"\n— examining a hand-crafted shawl at a market stall\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Beautiful / Captivating",
          B: "Unpleasant / Cruel",
          C: "Mysterious / Otherworldly",
          D: "Powerful / Energetic",
        },
        answer: "A",
        explanation:
          'The shifting colours and fine craftsmanship draw the eye and hold attention. The scene is Beautiful / Captivating.',
      },
      {
        section: "A",
        question:
          "\"The boat drifted without direction, the oars resting, the only sound the soft lap of water against wood.\"\n— floating on a lake at dusk\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Mysterious / Otherworldly",
          B: "Tense / Dramatic",
          C: "Calm / Peaceful",
          D: "Beautiful / Captivating",
        },
        answer: "C",
        explanation:
          'Drifting without effort, resting oars, and the single soft sound all suggest complete stillness and ease. The scene is Calm / Peaceful.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Clusters 5–8
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "\"She closed her eyes and let the warmth of the sunlit wall soak into her back, the traffic noise fading to nothing.\"\n— sitting in a sheltered courtyard after a stressful morning\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Calm / Peaceful",
          B: "Beautiful / Captivating",
          C: "Chaotic / Frantic",
          D: "Tense / Dramatic",
        },
        answer: "A",
        explanation:
          'The fading of noise and the sensation of warmth soaking in describe a moment of total quiet and recovery. The scene is Calm / Peaceful.',
      },
      {
        section: "B",
        question:
          "\"Bags split open across the pavement, papers whipping in every direction, people shouting over each other and nobody listening.\"\n— a market stall collapsing in strong wind\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Dangerous / Threatening",
          B: "Tense / Dramatic",
          C: "Powerful / Energetic",
          D: "Chaotic / Frantic",
        },
        answer: "D",
        explanation:
          'Split bags, flying papers, and overlapping shouts all create disorder without a clear focus. The scene is Chaotic / Frantic.',
      },
      {
        section: "B",
        question:
          "\"He poured, stirred, tasted, spat, added salt, added sugar, tasted again, then started the whole thing over from scratch.\"\n— a student cooking without a recipe for the first time\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Chaotic / Frantic",
          B: "Unpleasant / Cruel",
          C: "Tense / Dramatic",
          D: "Powerful / Energetic",
        },
        answer: "A",
        explanation:
          'The rapid repetition of actions with no clear method signals disorder, not tension. Starting over from scratch confirms the lack of control. The scene is Chaotic / Frantic.',
      },
      {
        section: "B",
        question:
          "\"The fog swallowed the path ahead, and where the trees should have been there was only white silence.\"\n— walking through a forest at dawn\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Calm / Peaceful",
          B: "Mysterious / Otherworldly",
          C: "Tense / Dramatic",
          D: "Dangerous / Threatening",
        },
        answer: "B",
        explanation:
          '"Swallowed" and "white silence" give the scene a surreal, dreamlike quality. The familiar (trees, path) has been erased by something unnatural. The scene is Mysterious / Otherworldly.',
      },
      {
        section: "B",
        question:
          "\"Roots twisted upward through the stone floor as if the building had grown out of the earth rather than been built on it.\"\n— entering an abandoned temple deep in the jungle\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Mysterious / Otherworldly",
          B: "Beautiful / Captivating",
          C: "Unpleasant / Cruel",
          D: "Dangerous / Threatening",
        },
        answer: "A",
        explanation:
          'Roots breaking through stone and the sense that the building "grew" rather than was built give the scene an unnatural, otherworldly quality. Students may choose "beautiful" — accept only if they also identify the strangeness.',
      },
      {
        section: "B",
        question:
          "\"Nobody moved. The clock above the door ticked once, twice. Then the headteacher cleared her throat.\"\n— a disciplinary meeting in the school office\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Calm / Peaceful",
          B: "Unpleasant / Cruel",
          C: "Tense / Dramatic",
          D: "Chaotic / Frantic",
        },
        answer: "C",
        explanation:
          'The stillness, the ticking clock, and the deliberate throat-clearing build suspense. Everyone is waiting for something uncomfortable to begin. The scene is Tense / Dramatic.',
      },
      {
        section: "B",
        question:
          "\"His finger hovered over the send button for a full ten seconds before he pressed it.\"\n— submitting a university application at the last minute\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Tense / Dramatic",
          B: "Chaotic / Frantic",
          C: "Powerful / Energetic",
          D: "Calm / Peaceful",
        },
        answer: "A",
        explanation:
          'The hesitation and the precision of "ten seconds" are tension cues. This single moment carries enormous weight. The scene is Tense / Dramatic.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Nuanced choices
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "\"The smell hit them before they saw it — a thick, rotten sweetness that sat at the back of the throat and refused to leave.\"\n— discovering spoiled food in a storage room\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Chaotic / Frantic",
          B: "Dangerous / Threatening",
          C: "Unpleasant / Cruel",
          D: "Mysterious / Otherworldly",
        },
        answer: "C",
        explanation:
          '"Rotten sweetness" that "refused to leave" describes something repulsive and oppressive. There is no danger or chaos — only discomfort and revulsion. The scene is Unpleasant / Cruel.',
      },
      {
        section: "C",
        question:
          "\"He spoke to her without looking up, waving his hand as though shooing a fly.\"\n— a manager responding to an employee\'s question\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Tense / Dramatic",
          B: "Unpleasant / Cruel",
          C: "Dangerous / Threatening",
          D: "Chaotic / Frantic",
        },
        answer: "B",
        explanation:
          'The dismissive gesture — waving her away like a fly — is degrading and contemptuous. The behaviour is rude and cruel, not threatening or tense. The scene is Unpleasant / Cruel.',
      },
      {
        section: "C",
        question:
          "\"The firework split the sky open, scattering gold and silver across the darkness, the boom arriving a half-second later and shaking the windows.\"\n— watching a firework display from a rooftop\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Beautiful / Captivating",
          B: "Chaotic / Frantic",
          C: "Powerful / Energetic",
          D: "Tense / Dramatic",
        },
        answer: "C",
        explanation:
          '"Split the sky" and "shaking the windows" signal force and impact. Students may choose "beautiful" — but the verbs of force and the physical boom signal power, not delicacy. The scene is Powerful / Energetic.',
      },
      {
        section: "C",
        question:
          "\"The corridor stretched ahead without end, every door identical, every light the same sickly yellow.\"\n— walking through an unfamiliar hospital at night\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Unpleasant / Cruel",
          B: "Calm / Peaceful",
          C: "Tense / Dramatic",
          D: "Mysterious / Otherworldly",
        },
        answer: "D",
        explanation:
          'The endless, identical corridor and the sickly light create a surreal, disorienting quality. The repetition and endlessness suggest something outside normal reality. The scene is Mysterious / Otherworldly.',
      },
      {
        section: "C",
        question:
          "\"She didn't run. She walked, slowly, straight towards the smoke, while everyone else went the other way.\"\n— a volunteer firefighter arriving at the scene\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Powerful / Energetic",
          B: "Dangerous / Threatening",
          C: "Tense / Dramatic",
          D: "Calm / Peaceful",
        },
        answer: "C",
        explanation:
          'The contrast between her calm, deliberate walk and everyone else fleeing creates dramatic tension. The scene is Tense / Dramatic, not simply powerful — the drama comes from her composure against the chaos.',
      },
      {
        section: "C",
        question:
          "\"The playground had been cemented over. Where the swings had been, there was a car park.\"\n— revisiting a childhood neighbourhood after many years\n\nWhich adjective cluster best describes the scene?",
        options: {
          A: "Calm / Peaceful",
          B: "Mysterious / Otherworldly",
          C: "Beautiful / Captivating",
          D: "Unpleasant / Cruel",
        },
        answer: "D",
        explanation:
          'The childhood playground has been erased and replaced with something functional and cold. The scene is not simply sad — the cement is unnatural and oppressive to the memory. The scene is Unpleasant / Cruel.',
      },
    ],
  },
};

validateMcqAnswerKeys(mcqSetsInternal);
export const mcqSets = mcqSetsInternal;
