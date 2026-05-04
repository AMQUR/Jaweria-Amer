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

  // ══════════════════════════════════════════════════════════════════════
  // REWORDING WORKSHOP — PICK THE BEST REWORDING (EXERCISE B)
  // ══════════════════════════════════════════════════════════════════════
  "mcq-rewording-workshop": {
    id: "mcq-rewording-workshop",
    title: "Rewording Workshop: Pick the Best Rewording",
    description:
      "15 questions · 8 minutes. Cambridge marking scheme points — pick the rewording that is precise, clear, and captures the full meaning without lifting, vagueness, or added content.",
    timeLimit: 480,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Q1–5 (Exercise B)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question:
          "[S24 V11 — Plogging]\nMS Point: \"makes a noticeable difference // helps solve a big problem // has a huge impact\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Creates a visible change in the local area",
          B: "Makes things better for the environment",
          C: "Helps solve things and makes a difference",
          D: "No correct option",
        },
        answer: "A",
        explanation:
          "B is too vague — 'makes things better' does not specify what changes or for whom. C lifts 'solve' and 'makes a difference' directly from the MS. A rewrites the MS point precisely: 'visible change' captures 'noticeable difference', and 'local area' provides the scope.",
      },
      {
        section: "A",
        question:
          "[W24 V12 — Fitness App]\nMS Point: \"shares personal information / stats whether you want it to or not / without consent\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Private data is exposed to other users without permission",
          B: "The app shares your information with people",
          C: "Personal information is shared whether you want it to or not",
          D: "No correct option",
        },
        answer: "A",
        explanation:
          "B is too vague — 'your information' and 'with people' lose the key detail of personal data and lack of consent. C lifts 'personal information' and 'whether you want it to or not' directly from the MS. A rewrites the point cleanly using 'private data', 'exposed', and 'without permission'.",
      },
      {
        section: "A",
        question:
          "[W25 V11 — Everest]\nMS Point: \"not doing it first // do not have to figure out how to do it\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "The route is already challenging and dangerous for new climbers",
          B: "Modern climbers do not need to pioneer the path themselves",
          C: "Climbers today have not done it first",
          D: "No correct option",
        },
        answer: "B",
        explanation:
          "A changes the meaning — it is about difficulty and danger, not about pioneering. C lifts 'done it first' directly from the MS. B rewrites the core idea cleanly: 'pioneer the path' captures 'figure out how to do it / not doing it first' without lifting any key word.",
      },
      {
        section: "A",
        question:
          "[S24 V12 — Authentic Travel]\nMS Point: \"clean / hygienic / comfortable / relaxing hotels / guesthouses // good standard of accommodation\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Travellers stay in clean, hygienic and comfortable guesthouses",
          B: "Accommodation is of a satisfactory standard",
          C: "The company provides luxurious five-star lodgings that pamper every guest",
          D: "No correct option",
        },
        answer: "D",
        explanation:
          "A lifts 'clean, hygienic and comfortable' directly from the MS. B is too vague — 'satisfactory standard' loses the specific qualities listed. C changes the meaning by adding 'five-star' and 'pamper' which are not in the MS. None of the three reword the point correctly — D is correct.",
      },
      {
        section: "A",
        question:
          "[S25 V11 — Swimming Pools]\nMS Point: \"eco-pools can be cheaper to run // natural purification can be cheaper\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Eco-friendly pools are less expensive to operate due to natural cleaning methods",
          B: "These pools are cheap",
          C: "Natural purification reduces the cost of running the pool significantly and saves money",
          D: "No correct option",
        },
        answer: "A",
        explanation:
          "B is too vague — 'cheap' loses the eco element and the reason for the saving. C is repetitive — 'reduces the cost' and 'saves money' say the same thing. A rewrites both MS elements precisely: 'less expensive to operate' = 'cheaper to run', and 'natural cleaning methods' = 'natural purification'.",
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Q6–10 (Exercise B)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "[W24 V11 — Sanctuaries]\nMS Point: \"saving / focusing on individual animals is not a priority / not worthwhile\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Rescuing animals is not important at all",
          B: "Individual animals are not a priority and not worthwhile",
          C: "Saving animals one at a time is a waste of resources",
          D: "No correct option",
        },
        answer: "D",
        explanation:
          "A overstates the MS point — 'not important at all' is too extreme. B lifts 'not a priority' and 'not worthwhile' directly from the MS. C changes the meaning — 'a waste of resources' is not stated. None of the three reword the point correctly — D is correct.",
      },
      {
        section: "B",
        question:
          "[S25 V12 — Zoo]\nMS Point: \"popular animals are being sold to other zoos // not all animals are moving\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "The zoo is selling its animals because it needs money",
          B: "Some beloved animals are going to be gotten rid of",
          C: "Popular creatures will be relocated to other facilities",
          D: "No correct option",
        },
        answer: "C",
        explanation:
          "A invents a reason ('because it needs money') not in the MS. B is too informal — 'gotten rid of' is colloquial and implies the animals are being discarded rather than transferred. C rewrites the point precisely: 'popular creatures' = 'popular animals', 'relocated' = 'sold/moved', 'other facilities' = 'other zoos'.",
      },
      {
        section: "B",
        question:
          "[W25 V12 — Sneakers]\nMS Point: \"sporting endorsements // contracts signed with top athletes // athletes promote / advertise them\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Famous sportspeople endorse the products through lucrative agreements",
          B: "Athletes sign contracts with big brands and promote them",
          C: "Top athletes advertise sneakers to the world",
          D: "No correct option",
        },
        answer: "D",
        explanation:
          "A adds 'lucrative' — a detail not in the MS. B lifts 'contracts signed' and 'promote' directly from the MS. C lifts 'top athletes' and 'advertise' from the MS, and 'to the world' adds detail not stated. None of the three reword the point cleanly — D is correct.",
      },
      {
        section: "B",
        question:
          "[Specimen — Treehotel]\nMS Point: \"built sustainably / environmentally friendly / built with sensitivity to wildlife\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "The venue was constructed with care for the environment and measures to protect local animals",
          B: "The hotel was built sustainably with sensitivity to wildlife",
          C: "The place is green and eco-friendly in every way imaginable",
          D: "No correct option",
        },
        answer: "A",
        explanation:
          "B lifts 'built sustainably' and 'sensitivity to wildlife' directly from the MS. C is vague and ornate — 'in every way imaginable' adds unwarranted emphasis. A rewrites all three MS elements without lifting: 'constructed with care for the environment' = 'built sustainably / environmentally friendly', and 'measures to protect local animals' = 'sensitivity to wildlife'.",
      },
      {
        section: "B",
        question:
          "[S24 V11 — Plogging]\nMS Point: \"protects / helps ecosystem / wildlife / nature\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "The natural environment is safeguarded from harm",
          B: "It helps the ecosystem and protects wildlife",
          C: "Animals and plants benefit from cleaner areas",
          D: "No correct option",
        },
        answer: "D",
        explanation:
          "A loses specificity — 'safeguarded from harm' does not name what is protected. B lifts 'helps the ecosystem' and 'protects wildlife' directly from the MS. C changes the meaning — 'animals and plants benefit from cleaner areas' is not the same as protecting the ecosystem or wildlife. None reword the point correctly — D is correct.",
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Q11–15 (Exercise B)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "[W24 V12 — Fitness App]\nMS Point: \"makes you overtrain / not work at your own pace / run / ride too fast / too far\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Users exercise too much",
          B: "The app pushes users beyond safe physical limits — disregarding their own pace",
          C: "People are made to overtrain and not work at their own pace",
          D: "No correct option",
        },
        answer: "B",
        explanation:
          "A is too vague — 'exercise too much' loses the pace, distance, and compulsive elements. C lifts 'overtrain' and 'not work at their own pace' directly from the MS. B rewrites the point precisely: 'pushes users beyond safe physical limits' = 'overtrain / too fast / too far', and 'disregarding their own pace' = 'not work at your own pace'.",
      },
      {
        section: "C",
        question:
          "[W25 V11 — Everest]\nMS Point: \"microplastic / waste / belongings abandoned / environmental impact\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Discarded items and pollutants are causing environmental degradation on the mountain",
          B: "The mountain has microplastic waste and abandoned belongings causing environmental impact",
          C: "Climbers are messy and leave rubbish everywhere on the slopes",
          D: "No correct option",
        },
        answer: "A",
        explanation:
          "B lifts 'microplastic waste', 'abandoned belongings', and 'environmental impact' directly from the MS. C is too informal — 'messy' and 'rubbish everywhere' are colloquial and lose precision. A rewrites all MS elements without lifting: 'discarded items' = 'belongings abandoned / waste', 'pollutants' = 'microplastic', 'environmental degradation' = 'environmental impact'.",
      },
      {
        section: "C",
        question:
          "[S24 V12 — Authentic Travel]\nMS Point: \"feel more confident / supported / safe\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Customers feel confident, supported and safe on their trips",
          B: "Customers no longer worry about their safety because they have guides",
          C: "Travellers feel reassured and well looked after throughout the journey",
          D: "No correct option",
        },
        answer: "C",
        explanation:
          "A lifts 'confident, supported and safe' directly from the MS — all three adjectives are copied unchanged. B changes the meaning — 'no longer worry about their safety' is a different point, and 'because they have guides' is not in the MS. C rewrites all three feelings without lifting: 'reassured' = 'confident / safe', 'well looked after' = 'supported'.",
      },
      {
        section: "C",
        question:
          "[W24 V11 — Sanctuaries]\nMS Point: \"environmental impact of flying / using non eco-friendly transport to get to a sanctuary\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "Flying is bad for the planet",
          B: "The carbon footprint of travelling to isolated sanctuaries undermines the conservation effort",
          C: "Using non eco-friendly transport to reach a sanctuary has an environmental impact",
          D: "No correct option",
        },
        answer: "B",
        explanation:
          "A is too vague — 'flying is bad for the planet' loses the sanctuary context entirely. C lifts 'non eco-friendly transport', 'sanctuary', and 'environmental impact' directly from the MS. B rewrites the point precisely: 'carbon footprint of travelling' = 'environmental impact of flying', 'isolated sanctuaries' = 'sanctuary', and 'undermines the conservation effort' explains the significance.",
      },
      {
        section: "C",
        question:
          "[S25 V12 — Zoo]\nMS Point: \"no public consultation / discussion\"\n\nWhich option is the BEST rewording of this marking scheme point?",
        options: {
          A: "The decision was imposed without any public consultation or discussion",
          B: "The community was not informed about what would happen",
          C: "Nobody even talked about the plans with the people",
          D: "No correct option",
        },
        answer: "D",
        explanation:
          "A lifts 'public consultation' and 'discussion' directly from the MS, and 'imposed without any' adds content beyond the MS. B changes the meaning — 'not informed' is a different point from 'no consultation or discussion'. C is too informal — 'nobody even talked about the plans with the people' is colloquial and imprecise. None reword the point correctly — D is correct.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SHORT RESPONSE PRACTICE QUIZ — Q3(b) 1123 O LEVEL
  // ══════════════════════════════════════════════════════════════════════
  "mcq-short-response-q3b": {
    id: "mcq-short-response-q3b",
    title: "Short Response Practice Quiz — Q3(b)",
    description:
      "10 questions · 5 minutes. Five real-world scenarios — identify whether the speaker agrees or disagrees, then pick the development that best supports their stated reason.",
    timeLimit: 300,
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Cases 1 & 2 (Elon Musk, The Rock)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question:
          "CASE 1 — Elon Musk: Train Travel in China\n\nPersona: A billionaire who recently chose to travel in Hard Class to experience ordinary life. He found it refreshing and honest.\n\nQuestion: 'Some people say that Hard Class carriages are uncomfortable, noisy and not worth recommending. Would you advise someone to book it?'\n\nQ1: Does Elon agree that Hard Class is not worth recommending?",
        options: {
          A: "Yes — he agrees it is uncomfortable and a poor experience overall",
          B: "No — he disagrees and would recommend it for the human connection it offers",
          C: "Partially — the conditions are difficult but worth enduring occasionally",
          D: "His view on this cannot be determined from the passage",
        },
        answer: "B",
        explanation:
          "The persona states Elon found the experience 'refreshing and honest' and it 'gave him the sense of connection he was looking for.' He would recommend it. Q1 is always NO in this quiz — the speaker always disagrees with the negative framing of the question.",
      },
      {
        section: "A",
        question:
          "CASE 1 — Elon Musk: Train Travel in China\n\nElon gives one reason for his view. The carriage was packed with ordinary people going about their daily lives — strangers of all kinds, carrying simple belongings, eating and talking unselfconsciously.\n\nQ2: Which development BEST supports his point?",
        options: {
          A: "This reminded him that most of the world lives nothing like he does — being surrounded by people from all walks of life gave him a genuine sense of perspective and human connection that no luxury experience could replicate.",
          B: "The carriage also had air vents along the top which allowed fresh air to circulate throughout, making the environment feel less confined and considerably more comfortable than the description suggested.",
          C: "Hard Class carriages are more environmentally sustainable than Soft Class because they carry significantly more passengers per journey, which reduces the overall carbon footprint of rail travel considerably.",
          D: "This proved that Hard Class passengers are accustomed to long journeys with minimal luggage, making the carriage atmosphere unexpectedly efficient and orderly compared to Soft Class.",
        },
        answer: "A",
        explanation:
          "B talks about air vents from the passage — this is a passage detail, not a development of Elon's reason about human connection. C brings in carbon footprint — a new topic unconnected to his reason. D changes the focus to luggage and efficiency rather than human connection. A directly develops Elon's point: the ordinary people gave him perspective and connection.",
      },
      {
        section: "A",
        question:
          "CASE 2 — The Rock: Personal Chef\n\nPersona: The Rock is a professional personal chef. A client asks about hiring a personal chef vs using food delivery apps.\n\nQuestion: 'I've been thinking of hiring a personal chef, but some people say it's an unnecessary expense when food delivery apps are so convenient. What is your opinion?'\n\nQ1: Does The Rock agree that hiring a personal chef is unnecessary?",
        options: {
          A: "Yes — he agrees that food delivery apps are just as effective for most people",
          B: "No — he disagrees and believes a personal chef provides something no app can",
          C: "Partially — apps work for everyday meals but a chef is better for health goals",
          D: "His view on this is not clearly stated in the passage",
        },
        answer: "B",
        explanation:
          "The Rock observed his client's sodium intake 'with the quiet disapproval of someone who has seen this before' — this is clearly a professional who believes in the value of personal attention over apps. He disagrees that a personal chef is unnecessary.",
      },
      {
        section: "A",
        question:
          "CASE 2 — The Rock: Personal Chef\n\nThe Rock gives one reason for his view. He noticed that his client was consuming a remarkable amount of sodium long before the client had realised it themselves.\n\nQ2: Which development BEST supports his point?",
        options: {
          A: "This proves that food delivery apps are becoming increasingly popular because people are too busy to cook for themselves, which shows there is a growing market for convenient meal solutions that personal chefs could also tap into.",
          B: "This kind of attentiveness means problems are identified early — a personal chef looks after a client's long-term health, not just a single meal, in a way that no algorithm or delivery notification ever could.",
          C: "Sodium is found in high quantities in most processed and restaurant food, which is why nutritionists generally recommend home-cooked meals as the healthiest option for people of all ages and dietary requirements.",
          D: "This demonstrates that clients often lose track of their dietary habits over time, which is why keeping a personal food journal alongside any meal service can help maintain awareness of nutritional intake.",
        },
        answer: "B",
        explanation:
          "C explains what sodium is generally — it does not develop The Rock's point about noticing the problem early. A changes the subject entirely to app popularity. D introduces a food journal — a different solution not connected to The Rock's reason. B directly develops his point: noticing the sodium early = the chef's attentiveness = long-term care no algorithm provides.",
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Cases 3 & 4 (Jane Margolis, Saad Imran)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          "CASE 3 — Jane Margolis: Community Composting\n\nPersona: Jane Margolis is a waste management specialist giving a talk to a community group.\n\nQuestion: 'The best way to deal with our waste problem is to encourage more people in our community to compost. What is your opinion?'\n\nQ1: Does Jane agree that composting is the best way to deal with the waste problem?",
        options: {
          A: "Yes — she believes community composting is the most practical and effective solution",
          B: "No — she disagrees and argues that legislation and business accountability are needed",
          C: "Partially — composting helps individuals but falls short of a complete solution",
          D: "Her opinion is ambiguous — she neither clearly agrees nor disagrees",
        },
        answer: "B",
        explanation:
          "Jane says she is 'a little impatient with the framing' and argues 'We need legislation. We need manufacturers to take responsibility.' She clearly disagrees that composting is the best solution — the real problem lies with businesses, not individuals.",
      },
      {
        section: "B",
        question:
          "CASE 3 — Jane Margolis: Community Composting\n\nJane gives one reason for her view. She says that businesses created the waste problem through packaging, single-use plastics and food discarded before it reaches the consumer.\n\nQ2: Which development BEST supports her point?",
        options: {
          A: "Composting does have genuine environmental benefits — it produces rich fertiliser, supports soil microorganisms and prevents methane release, which is why so many communities have embraced it so enthusiastically in recent years.",
          B: "This means composting only handles what remains after the damage is done — the real solution is to stop businesses producing that waste in the first place through legislation and mandatory packaging reform.",
          C: "Businesses should encourage their employees to compost at home by providing composting bins as part of their corporate social responsibility programmes, which would make a meaningful difference to landfill levels nationally.",
          D: "It follows that governments should invest in public education campaigns teaching individuals to reduce their personal environmental footprint at the household level.",
        },
        answer: "B",
        explanation:
          "A lists composting benefits — this actually supports the opposite view, not Jane's. C suggests businesses do something small (bins) — but Jane's point is about legislation, not corporate gestures. D is about public education — a different point. B directly develops Jane's reason: if businesses created the damage, composting only addresses the aftermath — the real fix is preventing the waste at source.",
      },
      {
        section: "B",
        question:
          "CASE 4 — Saad Imran: Rooftop Gardens\n\nPersona: Saad Imran is an environmental engineer with twenty years of experience. A journalist asks about rooftop gardens.\n\nQuestion: 'Some people think that installing a rooftop garden is a significant and meaningful contribution to the environment. What is your opinion?'\n\nQ1: Does Saad agree that a rooftop garden is a significant environmental contribution?",
        options: {
          A: "Yes — he believes rooftop gardens are a meaningful step towards urban sustainability",
          B: "No — he disagrees and argues they are not a genuine climate solution",
          C: "Partially — they have modest benefits but their impact should not be overstated",
          D: "His position shifts throughout the passage and cannot be clearly identified",
        },
        answer: "B",
        explanation:
          "Saad states directly: 'A rooftop garden is a fine thing. It is not, however, a climate solution. It is a conversation piece with excellent drainage.' He clearly disagrees that a rooftop garden is significant or meaningful as an environmental contribution.",
      },
      {
        section: "B",
        question:
          "CASE 4 — Saad Imran: Rooftop Gardens\n\nSaad gives one reason for his view. A rooftop garden serves the residents of that one building rather than the surrounding community.\n\nQ2: Which development BEST supports his point?",
        options: {
          A: "Rooftop gardens are also very expensive to install and maintain, which means that only wealthy property developers can afford them, making them an exclusive rather than an inclusive form of green space that further widens inequality.",
          B: "A well-maintained public park, by contrast, delivers benefits to an entire postcode — it supports biodiversity, cools surrounding streets and provides free accessible green space to residents who may have no private outdoor area at all.",
          C: "Rooftop gardens increase property values significantly, which encourages more developers to invest in green features and creates a positive trend towards greener urban architecture that benefits cities in the long run.",
          D: "This suggests that urban planners should require all new residential buildings to include shared green spaces on upper floors, making rooftop gardens a standard rather than an exclusive feature.",
        },
        answer: "B",
        explanation:
          "C says rooftop gardens raise property values — this contradicts Saad's argument against them. A talks about cost and inequality — a related but different point from community access. D suggests a policy fix but does not develop Saad's stated reason. B directly develops his point: a public park contrasts with the rooftop garden by serving an entire community — the comparison proves his reason.",
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Case 5 (Amy Santiago)
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "CASE 5 — Amy Santiago: The Office\n\nPersona: Amy Santiago recently returned to a traditional office after years of remote work. She really enjoyed the return.\n\nQuestion: 'Some people think that working in a traditional office is inefficient and outdated. What is your opinion?'\n\nQ1: Does Amy agree that the office is inefficient and outdated?",
        options: {
          A: "Yes — she found remote working more productive and regrets returning to the office",
          B: "No — she disagrees and values the clarity and structure that office working provides",
          C: "Partially — the office has real inefficiencies but remains better than remote working",
          D: "Her opinion about office working is not stated clearly in the passage",
        },
        answer: "B",
        explanation:
          "The persona states Amy 'really enjoyed the return' to the office. She would not agree that offices are inefficient or outdated — her personal experience was the opposite. She disagrees with the negative framing.",
      },
      {
        section: "C",
        question:
          "CASE 5 — Amy Santiago: The Office\n\nAmy gives one reason for her view. Working from home had blurred every boundary she possessed — her flat had become simultaneously her office and her place of rest, and neither was working well.\n\nQ2: Which development BEST supports her point?",
        options: {
          A: "Remote working technology, however sophisticated, requires enormous investment to function properly — the bespoke digital infrastructure needed to replicate office collaboration takes years and considerable resource to develop correctly.",
          B: "Having a physical separation between work and home means that when Amy is at the office she can focus completely, and when she returns home she can genuinely rest — her mental health and productivity both improved as a result.",
          C: "Open-plan offices have been shown by research to increase collaboration and creativity amongst employees, with workers in shared spaces generating more ideas and completing tasks more efficiently than those working in isolation.",
          D: "This shows that interior design plays a crucial role in mental wellbeing — creating a clearly defined work zone within a home can reduce the psychological overlap between professional and personal life significantly.",
        },
        answer: "B",
        explanation:
          "C is about open-plan offices and research — a new claim, not a development of Amy's boundary point. A is about remote technology costs — relevant to the passage but not to Amy's personal reason. D proposes a home design solution — which doesn't develop her stated reason for valuing the office. B directly develops her boundary point: physical separation between work and home is precisely what resolved the blurring she described.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // IMPRESSIONS PRACTICE QUIZ — PAPER 1 QUESTION 2
  // ══════════════════════════════════════════════════════════════════════
  "impressions-practice-quiz": {
    id: "impressions-practice-quiz",
    title: "Impressions Practice Quiz",
    description:
      "12 questions · 10 minutes. Tone, impression vocabulary, inference, and precise meaning for Paper 1 Question 2.",
    timeLimit: 600,
    questions: [
      {
        section: "A",
        question:
          "\"The hall fell silent the moment she stepped onto the stage.\"\n\nWhich impression does the writer chiefly create for the reader?",
        options: {
          A: "Joyful celebration and noisy festivity throughout the crowd",
          B: "Heightened expectation and tension — attention is fixed and the moment feels significant",
          C: "Open hostility and anger directed at the performer",
          D: "Complete boredom and indifference from everyone present",
        },
        answer: "B",
        explanation:
          "Silence when someone appears often signals anticipation and importance. The writer does not describe cheering (A), aggression (C), or apathy (D). B captures the held-breath, expectant mood.",
      },
      {
        section: "A",
        question:
          "\"His apology sounded rehearsed, each phrase weighted like a lawyer's brief.\"\n\nWhat does the writer suggest about the apology?",
        options: {
          A: "It was spontaneous and deeply sincere",
          B: "It was carefully prepared and lacked genuine feeling",
          C: "It was too quiet for anyone to hear",
          D: "It was delivered in a foreign language",
        },
        answer: "B",
        explanation:
          "'Rehearsed' and comparison to a legal document imply polish without warmth. The writer is not praising sincerity (A), commenting on volume (C), or on language choice (D).",
      },
      {
        section: "A",
        question:
          "\"Bitter wind clawed at the shutters.\"\n\nWhich word cluster best matches the dominant tone?",
        options: {
          A: "Gentle domestic comfort and cosiness",
          B: "Threatening, hostile energy from the weather against the house",
          C: "Light-hearted comic exaggeration with no real menace",
          D: "Calm spring warmth and renewal",
        },
        answer: "B",
        explanation:
          "'Bitter' and 'clawed' personify the wind as aggressive. The tone is menacing, not cosy (A), purely comic (C), or warm (D).",
      },
      {
        section: "A",
        question:
          "\"She spoke in a voice barely above a whisper, as if the words might break if raised.\"\n\nThe most reasonable inference is that she feels —",
        options: {
          A: "Arrogant and eager to command the room",
          B: "Cautious, vulnerable, or afraid of being overheard",
          C: "Amused by the acoustics of the hall",
          D: "Determined to sing rather than speak",
        },
        answer: "B",
        explanation:
          "A whisper and fear of 'breaking' words suggest delicacy and inhibition. Nothing supports arrogance (A), humour about sound (C), or singing (D).",
      },
      {
        section: "B",
        question:
          "'Progress,' he muttered, eyes fixed on the bulldozers lined up like predators.\n\nWhat impression does the simile 'like predators' create?",
        options: {
          A: "The machines look weak, outdated, and harmless",
          B: "The machines seem patient, nurturing, and protective",
          C: "The machines seem threatening, purposeful, and unstoppable",
          D: "The machines are colourful toys in a child's drawing",
        },
        answer: "C",
        explanation:
          "Predators hunt — the image casts bulldozers as dangerous and intent. They are not weak (A), caring (B), or playful (D).",
      },
      {
        section: "B",
        question:
          "\"The newsroom had the stale energy of a waiting room.\"\n\nWhich impression is conveyed to the reader?",
        options: {
          A: "Creative buzz and constant breaking news",
          B: "Stagnation, delay, and drained enthusiasm",
          C: "Violent argument between colleagues",
          D: "Festive celebration after a success",
        },
        answer: "B",
        explanation:
          "'Stale' parallels a waiting room — boredom and limbo. This contradicts energy and celebration (A, D) and does not imply violence (C).",
      },
      {
        section: "B",
        question:
          "\"The smile did not reach her eyes.\"\n\nWhat does this phrase most strongly imply?",
        options: {
          A: "She is genuinely delighted and relaxed",
          B: "Her warmth is only surface-level; she may be guarded or insincere",
          C: "She has poor eyesight",
          D: "She is telling a joke",
        },
        answer: "B",
        explanation:
          "Eyes often signal real emotion. A smile that stops at the mouth suggests performance, not true joy (A). The line is not about vision (C) or humour (D).",
      },
      {
        section: "B",
        question:
          "\"Children pressed their faces to the glass, noses flattened like cartoon characters.\"\n\nThe dominant tone is closest to —",
        options: {
          A: "Tragic moralising about poverty",
          B: "Affectionate, lightly comic observation of childhood curiosity",
          C: "Furious accusation against the shopkeeper",
          D: "Detached scientific measurement",
        },
        answer: "B",
        explanation:
          "Cartoon noses invite a smile — gentle humour and fondness. The scene is not tragic (A), angry (C), or clinical (D).",
      },
      {
        section: "C",
        question:
          "\"He counted every second, the clock's tick mocking him.\"\n\nWhat is the main effect of personifying the tick as 'mocking'?",
        options: {
          A: "Time seems actively hostile and oppressive to him",
          B: "The clock is literally broken beyond repair",
          C: "He enjoys rhythmic sound as music",
          D: "Silence has made him calmer",
        },
        answer: "A",
        explanation:
          "Personification makes the passage of time feel personal and cruel. The clock is not literally broken (B), and he is not enjoying sound (C) or calm (D).",
      },
      {
        section: "C",
        question:
          "\"The village welcomed them with bread still warm from the oven.\"\n\nWhich impression of the village is strongest?",
        options: {
          A: "Hostile suspicion towards strangers",
          B: "Generosity, homeliness, and human warmth",
          C: "Cold indifference",
          D: "Dishonest trickery",
        },
        answer: "B",
        explanation:
          "Warm bread is a classic symbol of hospitality and care. It contradicts hostility (A), indifference (C), and deceit (D).",
      },
      {
        section: "C",
        question:
          "\"Rain blurred the headlights into halos.\"\n\nWhat visual impression does the writer create?",
        options: {
          A: "Crystal-clear precision in bright sunshine",
          B: "Soft, uncertain shapes — reduced visibility and a dreamlike edge",
          C: "A crowded midday market",
          D: "Complete darkness with no light at all",
        },
        answer: "B",
        explanation:
          "Blurred lights into halos suggest misted glass, rain, and softened edges — not clarity (A), a market (C), or total dark (D).",
      },
      {
        section: "C",
        question:
          "\"He straightened his tie in the mirror, practising confidence he did not feel.\"\n\nWhich impression of his inner state is most accurate?",
        options: {
          A: "Genuine self-assurance before an audience",
          B: "Outward composure masking insecurity or anxiety",
          C: "Vanity about fashion with no emotional subtext",
          D: "Carefree excitement before a party",
        },
        answer: "B",
        explanation:
          "'Practising confidence he did not feel' exposes the gap between appearance and reality. He is not truly assured (A), merely vain without emotion (C), or carefree (D).",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // WRITER'S EFFECT PRACTICE QUIZ — PAPER 1 QUESTION 2
  // ══════════════════════════════════════════════════════════════════════
  "writers-effect-practice-quiz": {
    id: "writers-effect-practice-quiz",
    title: "Writer's Effect Practice Quiz",
    description:
      "12 questions · 10 minutes. Word class, meaning in context, and reader effect for Paper 1 Question 2 (writer's effect).",
    timeLimit: 600,
    questions: [
      {
        section: "A",
        question:
          "\"The corridor folded back on itself like a badly written sentence.\"\n\nWhat is the main effect of this simile on the reader?",
        options: {
          A: "It suggests mathematical precision in the building's measurements",
          B: "It conveys confusion, repetition, and disorientation in the space",
          C: "It praises the architect's clever design",
          D: "It proves the narrator cannot read",
        },
        answer: "B",
        explanation:
          "A sentence that 'folds back' is tangled and hard to follow — the simile maps that onto the corridor. It is not praise (C), maths (A), or literacy proof (D).",
      },
      {
        section: "A",
        question:
          "\"She snapped the ledger shut with a crack that silenced the office.\"\n\nWhy is 'crack' an effective word choice?",
        options: {
          A: "It suggests humour and playfulness only",
          B: "It implies the ledger is physically weak",
          C: "It suggests sharp finality and authority — sound enforces attention",
          D: "It indicates the office has no windows",
        },
        answer: "C",
        explanation:
          "Onomatopoeia makes the action audible and decisive; the following silence shows its impact. Weak paper (B) or jokes (A) are not the focus.",
      },
      {
        section: "A",
        question:
          "\"Dust motes drifted in the single shaft of light.\"\n\nWhat atmosphere does this image chiefly create?",
        options: {
          A: "Chaos, speed, and loud confusion",
          B: "Stillness, suspension, and a forgotten or neglected space",
          C: "Immediate danger of fire spreading",
          D: "A crowded festival street",
        },
        answer: "B",
        explanation:
          "Slow-drifting motes in one beam suggest quiet and stasis. There is no chaos (A), fire (C), or crowd (D).",
      },
      {
        section: "A",
        question:
          "\"He was hunched over the keyboard, shoulders meeting his ears.\"\n\nIn a three-step analysis, the strongest middle step (meaning in context) is —",
        options: {
          A: "'Hunched' is an adverb showing typing speed",
          B: "'Hunched' is a verb/adjective suggesting prolonged strain and a closed, defensive posture over the work",
          C: "'Hunched' is a conjunction linking two clauses",
          D: "'Hunched' names a brand of computer",
        },
        answer: "B",
        explanation:
          "Word class + contextual meaning: the body is curled and tight from concentration or stress — not speed as adverb (A), grammar (C), or a name (D).",
      },
      {
        section: "B",
        question:
          "\"The headlines screamed from every stall.\"\n\nWhat is the main effect of 'screamed' here?",
        options: {
          A: "Literal physical injury to readers",
          B: "Headlines feel loud, urgent, and alarmingly everywhere — news dominates the scene",
          C: "The market sells only musical instruments",
          D: "The scene is silent and peaceful",
        },
        answer: "B",
        explanation:
          "Personification heightens intensity and omnipresence of bad or shocking news. It is figurative, not literal harm (A), and not peaceful (D).",
      },
      {
        section: "B",
        question:
          "\"His laugh was a rusty hinge that rarely opened.\"\n\nWhat does the metaphor suggest about his laughter?",
        options: {
          A: "It is frequent, youthful, and effortless",
          B: "It is rare, awkward, and joy-starved — humour does not come easily",
          C: "He is a trained engineer",
          D: "The hinge needs oil only in summer",
        },
        answer: "B",
        explanation:
          "Rust and rarity imply stiffness and lack of use — emotional dryness. Not youth (A) or literal profession (C).",
      },
      {
        section: "B",
        question:
          "\"Footsteps echoed hollowly down the stairwell.\"\n\nWhat effect does the sound imagery mainly produce?",
        options: {
          A: "Warm intimacy between friends",
          B: "Emptiness, isolation, and a sense of abandoned space",
          C: "A crowded carnival atmosphere",
          D: "Underwater muffling with no echo",
        },
        answer: "B",
        explanation:
          "Echoes in an empty stairwell amplify loneliness. Not warmth (A), crowds (C), or underwater quiet without echo (D).",
      },
      {
        section: "B",
        question:
          "\"The medal hung heavy around his neck.\"\n\nBeyond literal weight, which reader effect is most justified?",
        options: {
          A: "The honour feels burdensome — guilt, pressure, or emotional weight",
          B: "Gold medals are always cheap metal",
          C: "He cannot swim with medals on",
          D: "The scene is purely slapstick comedy",
        },
        answer: "A",
        explanation:
          "'Heavy' often shifts to abstract burden — responsibility or shame. The line is not about metal value (B), swimming (C), or only comedy (D).",
      },
      {
        section: "C",
        question:
          "\"The bus lurched forward, throwing passengers forward.\"\n\nBest three-step style comment on 'lurched':",
        options: {
          A: "Adjective of colour — shows the bus is painted red",
          B: "Verb of sudden, violent movement — creates unease and loss of physical control for passengers",
          C: "Proper noun naming the driver's hometown",
          D: "Shows the journey is always perfectly smooth",
        },
        answer: "B",
        explanation:
          "Class: verb of motion. Context: jerky start. Effect: instability and discomfort — matches examiner expectations for writer's effect.",
      },
      {
        section: "C",
        question:
          "\"Wait—\" He stopped.\n\nWhat is the main effect of the em dash after 'Wait'?",
        options: {
          A: "It marks an abrupt cut-off or interrupted thought in speech",
          B: "It introduces a numbered list",
          C: "It must always end the paragraph in Cambridge scripts",
          D: "It shows the speaker cannot spell",
        },
        answer: "A",
        explanation:
          "A dash after a fragment often signals interruption or sudden break — standard punctuation effect for drama.",
      },
      {
        section: "C",
        question:
          "\"Fragile hope.\"\n\nWhat combined effect does the adjective + noun pairing create?",
        options: {
          A: "Scientific measurement of mass only",
          B: "Hope feels vulnerable and easily destroyed — invites reader empathy",
          C: "Comic exaggeration with no emotional content",
          D: "Neutral reportage with no tone",
        },
        answer: "B",
        explanation:
          "'Fragile' qualifies 'hope' emotionally — delicacy and risk. Not pure science (A), empty comedy (C), or neutrality (D).",
      },
      {
        section: "C",
        question:
          "\"The engine growled, ready.\"\n\nWhat is the chief effect of personifying the engine?",
        options: {
          A: "The vehicle seems alive and eager — tension builds before movement",
          B: "Wild animals have entered the garage",
          C: "The engine is permanently broken",
          D: "The scene is completely silent",
        },
        answer: "A",
        explanation:
          "Growling readiness animates the machine and heightens anticipation. Not literal animals (B), broken (C), or silence (D).",
      },
    ],
  },
};

validateMcqAnswerKeys(mcqSetsInternal);
export const mcqSets = mcqSetsInternal;
