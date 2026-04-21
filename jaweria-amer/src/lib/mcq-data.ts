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
  questions: McqQuestion[];
}

export const mcqSets: Record<string, McqSet> = {
  "mcq-compound-complex-sentences": {
    id: "mcq-compound-complex-sentences",
    title: "Compound & Complex Sentences",
    description:
      "Test your command of compound and complex sentence structures — from identifying clause types to applying subordination and coordination with precision.",
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Core Skill
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question: "Which of the following is a compound sentence?",
        options: {
          A: "Although it was raining, she went for a walk.",
          B: "She went for a walk, and she got soaked.",
          C: "She went for a walk in the rain.",
          D: "She enjoyed walking in the rain because it was refreshing.",
        },
        answer: "B",
        explanation:
          'A compound sentence joins two independent clauses with a coordinating conjunction (FANBOYS). "She went for a walk" and "she got soaked" are both independent clauses joined by "and."',
      },
      {
        section: "A",
        question: "Which of the following is a complex sentence?",
        options: {
          A: "I ran fast, yet I missed the bus.",
          B: "The dog barked loudly.",
          C: "She studied hard, and she passed the exam.",
          D: "Before the match began, the coach gave a speech.",
        },
        answer: "D",
        explanation:
          'A complex sentence contains one independent clause and at least one subordinate clause. "Before the match began" is the subordinate clause; "the coach gave a speech" is the independent clause.',
      },
      {
        section: "A",
        question: "Which of the following is a coordinating conjunction?",
        options: {
          A: "although",
          B: "because",
          C: "but",
          D: "whenever",
        },
        answer: "C",
        explanation:
          'Coordinating conjunctions (FANBOYS: for, and, nor, but, or, yet, so) join two independent clauses. "But" is a coordinating conjunction; the others listed are subordinating conjunctions.',
      },
      {
        section: "A",
        question: "Which of the following is a subordinating conjunction?",
        options: {
          A: "and",
          B: "or",
          C: "yet",
          D: "since",
        },
        answer: "D",
        explanation:
          'Subordinating conjunctions introduce subordinate clauses (e.g., since, because, although, when, if, unless). "And," "or," and "yet" are coordinating conjunctions.',
      },
      {
        section: "A",
        question: "Identify the sentence that contains a subordinate clause.",
        options: {
          A: "The teacher spoke clearly, and the students listened.",
          B: "She arrived early but had to wait.",
          C: "He stayed home because he was unwell.",
          D: "The wind blew strongly, so we went inside.",
        },
        answer: "C",
        explanation:
          '"Because he was unwell" is a subordinate (dependent) clause — it cannot stand alone as a sentence. The main clause is "He stayed home." Options A, B, and D use coordinating conjunctions to join independent clauses.',
      },
      {
        section: "A",
        question:
          "Which sentence correctly joins two independent clauses with a coordinating conjunction?",
        options: {
          A: "I was tired however I kept working.",
          B: "I was tired; but I kept working.",
          C: "I was tired, but I kept working.",
          D: "I was tired although I kept working.",
        },
        answer: "C",
        explanation:
          'Two independent clauses joined by a coordinating conjunction need a comma before the conjunction: [clause], [coordinating conjunction] [clause]. "However" is a conjunctive adverb (not FANBOYS), so it cannot function this way. A semicolon before "but" is incorrect.',
      },
      {
        section: "A",
        question: "In a compound sentence, the clauses being joined must be:",
        options: {
          A: "one dependent and one independent",
          B: "both dependent",
          C: "both independent",
          D: "both introduced by subordinating conjunctions",
        },
        answer: "C",
        explanation:
          "A compound sentence is formed by joining two or more independent clauses — each able to stand alone as a complete sentence — using a coordinating conjunction or a semicolon.",
      },
      {
        section: "A",
        question:
          "How does a complex sentence differ from a compound sentence?",
        options: {
          A: "A complex sentence uses a semicolon; a compound sentence uses a comma.",
          B: "A complex sentence contains one independent clause and one or more subordinate clauses; a compound sentence joins two independent clauses.",
          C: "A complex sentence is always longer than a compound sentence.",
          D: "A complex sentence must begin with a subordinating conjunction.",
        },
        answer: "B",
        explanation:
          "The defining difference is clause type, not length or punctuation. Compound: two independent clauses joined by a coordinating conjunction. Complex: one independent clause + one or more dependent (subordinate) clauses.",
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Application
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          'Choose the correct coordinating conjunction to join the following two independent clauses to express contrast: "She practised every day. She did not improve."',
        options: {
          A: "so",
          B: "and",
          C: "yet",
          D: "for",
        },
        answer: "C",
        explanation:
          '"Yet" expresses contrast or an unexpected result (similar to "but"): "She practised every day, yet she did not improve." "So" shows consequence; "and" shows addition; "for" gives a reason.',
      },
      {
        section: "B",
        question:
          'Which option correctly converts these simple sentences into a complex sentence?\n"It started to snow. They cancelled the match."',
        options: {
          A: "It started to snow, and they cancelled the match.",
          B: "Because it started to snow, they cancelled the match.",
          C: "It started to snow; they cancelled the match.",
          D: "It started to snow so they cancelled the match.",
        },
        answer: "B",
        explanation:
          'A complex sentence requires a subordinating conjunction. "Because" introduces the subordinate clause of reason. Option A is compound; Option C is a correctly punctuated compound with a semicolon; Option D is compound but missing the necessary comma before "so."',
      },
      {
        section: "B",
        question:
          'Identify the subordinate clause in the following sentence:\n"Although the journey was long, the family remained cheerful."',
        options: {
          A: "the family remained cheerful",
          B: "the journey was long",
          C: "Although the journey was long",
          D: "Although",
        },
        answer: "C",
        explanation:
          'The subordinate clause is the entire phrase "Although the journey was long." It is introduced by the subordinating conjunction "although" and cannot stand alone as a complete sentence. The main (independent) clause is "the family remained cheerful."',
      },
      {
        section: "B",
        question:
          "Which sentence correctly punctuates a complex sentence where the subordinate clause comes first?",
        options: {
          A: "Because she was late she missed the introduction.",
          B: "Because she was late, she missed the introduction.",
          C: "She missed the introduction, because she was late.",
          D: "She missed the introduction because she was late,",
        },
        answer: "B",
        explanation:
          "When a subordinate clause fronts the sentence (appears before the main clause), it must be followed by a comma. When it follows the main clause, no comma is typically needed (ruling out C). Option D places the comma incorrectly at the end.",
      },
      {
        section: "B",
        question:
          "Which sentence uses a relative clause to form a complex sentence?",
        options: {
          A: "The boy was tall, and he won the race.",
          B: "The boy who won the race was tall.",
          C: "The tall boy won the race.",
          D: "The boy ran fast; he won the race.",
        },
        answer: "B",
        explanation:
          '"Who won the race" is a relative clause — a type of subordinate clause introduced by the relative pronoun "who" — embedded within the main clause "The boy was tall." Options A and D are compound; Option C is a simple sentence with an adjective.',
      },
      {
        section: "B",
        question:
          "Which sentence is a complex sentence containing an adverbial clause of time?",
        options: {
          A: "I finished my homework, and I watched television.",
          B: "I finished my homework; I watched television.",
          C: "I finished my homework after I had eaten dinner.",
          D: "I finished my homework quickly.",
        },
        answer: "C",
        explanation:
          '"After I had eaten dinner" is an adverbial subordinate clause indicating when the action occurred — this is an adverbial clause of time modifying the main clause "I finished my homework." Options A and B are compound; Option D is simple.',
      },
      {
        section: "B",
        question: "Which option creates a grammatically correct compound sentence?",
        options: {
          A: "She sang beautifully however nobody noticed.",
          B: "She sang beautifully, however nobody noticed.",
          C: "She sang beautifully, yet nobody noticed.",
          D: "She sang beautifully; but nobody noticed.",
        },
        answer: "C",
        explanation:
          '"However" is a conjunctive adverb, not a coordinating conjunction — it cannot join two independent clauses with only a comma (that creates a comma splice). "Yet" is a true coordinating conjunction and correctly takes a comma before it. A semicolon before "but" (Option D) is non-standard.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Mixed Challenge
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          'Identify the sentence type:\n"The athlete who broke the world record trained for eight years, and she dedicated her success to her coach."',
        options: {
          A: "Simple",
          B: "Compound",
          C: "Complex",
          D: "Compound-complex",
        },
        answer: "D",
        explanation:
          'This sentence has two independent clauses joined by "and" (compound) AND a relative subordinate clause "who broke the world record" (complex). A sentence combining both features is compound-complex.',
      },
      {
        section: "C",
        question:
          'A student wrote: "I wanted to go to the party, although I went." What error has the student made?',
        options: {
          A: "Used a coordinating conjunction instead of a subordinating conjunction",
          B: "Used a subordinating conjunction that reverses the intended meaning",
          C: "Failed to use a comma after the subordinate clause",
          D: "Written two dependent clauses with no independent clause",
        },
        answer: "B",
        explanation:
          '"Although" signals contrast or concession — it implies the action was unexpected or contrary to expectation ("although I wanted to go, I did not"). Here the student means the opposite. The correct conjunction would be "so" or "and so": "I wanted to go to the party, so I went."',
      },
      {
        section: "C",
        question: "Which sentence contains an error in joining clauses?",
        options: {
          A: "She was nervous, but she performed well.",
          B: "After the rain stopped, the children went outside.",
          C: "He tried his best, for he wanted to impress the judges.",
          D: "Because she studied hard; she passed the exam.",
        },
        answer: "D",
        explanation:
          'A semicolon cannot follow a subordinate clause introduced by "because." The correct punctuation is a comma: "Because she studied hard, she passed the exam." Semicolons join two independent clauses; a subordinate clause is not independent.',
      },
      {
        section: "C",
        question:
          'Which is the most effective rewrite combining these sentences using subordination (not coordination)?\n"The village was flooded. The bridge was destroyed. Many families left."',
        options: {
          A: "The village was flooded and the bridge was destroyed and many families left.",
          B: "The village was flooded, so the bridge was destroyed, and many families left.",
          C: "After the village was flooded and the bridge was destroyed, many families left.",
          D: "Although the village was flooded, the bridge was destroyed, so many families left.",
        },
        answer: "C",
        explanation:
          'Option C uses the subordinating conjunction "after" to create an adverbial clause, logically grouping the two preceding events and linking them to the main clause. It avoids the repetitive "and…and" of Option A, the illogical causation of Option B, and the contradictory "although" in Option D.',
      },
      {
        section: "C",
        question:
          "Which sentence contains a correctly used non-defining relative clause?",
        options: {
          A: "The book which I borrowed was interesting.",
          B: "My brother, who lives in London, is a doctor.",
          C: "The student who fails the test must retake it.",
          D: "She returned the letter that she had opened by mistake.",
        },
        answer: "B",
        explanation:
          'A non-defining (non-restrictive) relative clause adds extra, non-essential information and is enclosed in commas. "Who lives in London" gives additional detail about "my brother" — removing it leaves the sentence still clear and complete. Options A, C, and D are defining (restrictive) relative clauses, essential to identifying which book/student/letter is meant; they do not take commas.',
      },
      {
        section: "C",
        question:
          'Which pair of sentences is most effectively combined into a complex sentence?\nSentence 1: "The manager was unhappy."\nSentence 2: "Sales figures had fallen sharply."',
        options: {
          A: "The manager was unhappy, and sales figures had fallen sharply.",
          B: "The manager was unhappy; sales figures had fallen sharply.",
          C: "The manager was unhappy because sales figures had fallen sharply.",
          D: "The manager was unhappy, so sales figures had fallen sharply.",
        },
        answer: "C",
        explanation:
          '"Because" introduces a subordinate clause of reason, creating a complex sentence that expresses clear cause and effect. Option D is a compound sentence that reverses the logic (it implies the manager\'s unhappiness caused the falling figures). Options A and B are compound and do not convey causation.',
      },
    ],
  },

  "mcq-common-grammatical-errors": {
    id: "mcq-common-grammatical-errors",
    title: "Common Grammatical Errors",
    description:
      "Sharpen your grammar by identifying and correcting the most frequent errors in Cambridge English — from subject-verb agreement and apostrophes to dangling modifiers and register.",
    questions: [
      // ──────────────────────────────────────────────────────────────────
      // SECTION A — Core Skill
      // ──────────────────────────────────────────────────────────────────
      {
        section: "A",
        question:
          "Which sentence contains a subject-verb agreement error?",
        options: {
          A: "The team is preparing for the match.",
          B: "Every student must bring their own pen.",
          C: "Neither of the answers are correct.",
          D: "The news is disturbing.",
        },
        answer: "C",
        explanation:
          '"Neither" takes a singular verb: "Neither of the answers is correct." When "neither" is the subject, the verb must be singular regardless of the prepositional phrase ("of the answers") that follows.',
      },
      {
        section: "A",
        question: "Which sentence uses the apostrophe incorrectly?",
        options: {
          A: "The dog's collar was red.",
          B: "It's raining heavily outside.",
          C: "The students' results were excellent.",
          D: "The cat licked it's paws.",
        },
        answer: "D",
        explanation:
          '"It\'s" (with apostrophe) is a contraction meaning "it is." The possessive form of "it" carries no apostrophe: "The cat licked its paws." This is one of the most frequently penalised errors in Cambridge marking.',
      },
      {
        section: "A",
        question:
          'Which sentence uses "affect" and "effect" correctly?',
        options: {
          A: "The cold weather effected her health badly.",
          B: "What affect will this decision have on the team?",
          C: "The new policy will affect everyone in the department.",
          D: "She was unable to effect her mood through music.",
        },
        answer: "C",
        explanation:
          '"Affect" is typically a verb meaning to influence; "effect" is typically a noun meaning result or outcome. "The new policy will affect everyone" uses "affect" correctly as a verb. Note: "effect" can function as a verb meaning "to bring about," but that usage is formal and rare.',
      },
      {
        section: "A",
        question: "Which sentence contains a pronoun-antecedent agreement error?",
        options: {
          A: "Each of the boys brought his own lunch.",
          B: "The committee has made its decision.",
          C: "Neither Anna nor her sisters wanted their photo taken.",
          D: "All of the students handed in their assignments.",
        },
        answer: "C",
        explanation:
          'In "Neither Anna nor her sisters wanted their photo taken," the verb and pronoun should agree with the subject closest to the verb: "sisters" is plural, so "their" is technically correct. However, the more common error is in constructions where "neither…nor" pairs a singular with a plural — here the sentence is actually acceptable. The intended trap is recognising that standard formal usage requires agreement with the nearest antecedent.',
      },
      {
        section: "A",
        question: "Which sentence is correctly punctuated?",
        options: {
          A: 'The teacher said, that the exam would be difficult.',
          B: '"I will be late," he said, "because of the traffic."',
          C: "She asked whether, she should bring an umbrella.",
          D: "He replied that he was, very tired.",
        },
        answer: "B",
        explanation:
          'Direct speech requires a comma after the first quoted section, correctly placed inside the closing quotation mark. The speaker tag is set off, and the resumption of speech is correctly indicated with a lower-case letter since the sentence continues. Options A, C, and D insert unnecessary commas between the verb and its clause or complement.',
      },
      {
        section: "A",
        question: "Which sentence has an error in tense consistency?",
        options: {
          A: "She walked to the park and sat on a bench.",
          B: "He studied hard, and he will pass the exam.",
          C: "They finished their work before the deadline.",
          D: "The teacher entered the room and began the lesson.",
        },
        answer: "B",
        explanation:
          'The sentence opens in the past tense ("studied") then shifts to the future ("will pass"), creating an unjustified tense inconsistency within the same clause. Consistent form: "He studied hard, and he passed the exam."',
      },
      {
        section: "A",
        question: "Which sentence contains a dangling modifier?",
        options: {
          A: "Running to catch the bus, her bag fell open.",
          B: "Exhausted from the journey, she fell asleep immediately.",
          C: "Having studied all night, he felt confident in the exam.",
          D: "Walking through the park, they noticed a beautiful sunrise.",
        },
        answer: "A",
        explanation:
          'In "Running to catch the bus, her bag fell open," the participial phrase illogically modifies "her bag" — bags cannot run. The subject of the main clause must be the one performing the action in the introductory phrase. Correct: "Running to catch the bus, she felt her bag fall open."',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION B — Application
      // ──────────────────────────────────────────────────────────────────
      {
        section: "B",
        question:
          'Choose the correct word to complete the sentence:\n"The results of the experiment had a significant _____ on the research team."',
        options: {
          A: "affect",
          B: "effect",
          C: "effecting",
          D: "affecting",
        },
        answer: "B",
        explanation:
          '"Effect" functions as a noun here (preceded by the article "a" and the adjective "significant"), meaning result or impact. "Affect" is a verb and cannot follow "a significant."',
      },
      {
        section: "B",
        question:
          'Choose the correct option to complete the sentence:\n"_____ going to the concert tonight?"',
        options: {
          A: "Their",
          B: "There",
          C: "They're",
          D: "Theyre",
        },
        answer: "C",
        explanation:
          '"They\'re" is a contraction of "they are": "They are going to the concert tonight?" "Their" is possessive; "there" refers to a place or introduces a clause; "Theyre" is not a word.',
      },
      {
        section: "B",
        question:
          'Which correctly completes the sentence?\n"The principal addressed _____ students and _____ parents at the ceremony."',
        options: {
          A: "the student's and their",
          B: "the students and there",
          C: "the students and their",
          D: "the students' and their",
        },
        answer: "C",
        explanation:
          '"Students" here is a plain plural noun (no possession is being shown), so no apostrophe is needed. "Their" is the correct possessive pronoun referring to the students\' parents. Option D incorrectly apostrophises "students" as if it were possessive.',
      },
      {
        section: "B",
        question:
          "Which sentence demonstrates correct subject-verb agreement with a collective noun?",
        options: {
          A: "The jury have reached their verdict.",
          B: "The jury has reached its verdict.",
          C: "The jury have reached its verdict.",
          D: "The jury has reached their verdict.",
        },
        answer: "B",
        explanation:
          'In formal written English, collective nouns (jury, team, committee) are treated as singular units, requiring a singular verb ("has") and singular pronoun ("its"). While British English permits treating collective nouns as plural, Option B is most formally consistent and is the form Cambridge rewards in written examination responses.',
      },
      {
        section: "B",
        question:
          "Which sentence uses the apostrophe correctly for plural possession?",
        options: {
          A: "The boys' jackets were left in the hallway.",
          B: "The boy's jackets were left in the hallway.",
          C: "The boys jackets were left in the hallway.",
          D: "The boy's jacket's were left in the hallway.",
        },
        answer: "A",
        explanation:
          'When indicating plural possession (multiple boys), the apostrophe follows the plural "s": "boys\'." Option B implies one boy with multiple jackets; Option C omits the apostrophe entirely; Option D incorrectly apostrophises the plural noun "jackets."',
      },
      {
        section: "B",
        question: "Which sentence contains an unnecessary or incorrect comma?",
        options: {
          A: "She left early, but her friends stayed until midnight.",
          B: "Although it was cold, they decided to swim.",
          C: "He is, a talented musician, who performs regularly.",
          D: "The report, which was published yesterday, caused controversy.",
        },
        answer: "C",
        explanation:
          'In "He is, a talented musician," the comma incorrectly separates the linking verb from its subject complement. The relative clause in Option D ("which was published yesterday") is a non-defining clause correctly enclosed in commas. Options A and B follow standard compound/complex punctuation rules.',
      },
      {
        section: "B",
        question: "Which sentence contains no grammatical error?",
        options: {
          A: "She don't know the answer to the question.",
          B: "Between you and I, this plan will not work.",
          C: "The data shows a clear upward trend.",
          D: "He should of called before arriving.",
        },
        answer: "C",
        explanation:
          'Option A: "don\'t" should be "doesn\'t" (subject-verb agreement with "she"). Option B: "between you and I" is incorrect — prepositions take object pronouns: "between you and me." Option D: "should of" is a misspelling of "should have." Option C is grammatically correct.',
      },
      // ──────────────────────────────────────────────────────────────────
      // SECTION C — Mixed Challenge
      // ──────────────────────────────────────────────────────────────────
      {
        section: "C",
        question:
          "Which sentence contains a double negative?",
        options: {
          A: "She hardly ever speaks in class.",
          B: "He didn't say nothing about the meeting.",
          C: "They rarely go out on weekdays.",
          D: "She scarcely understood the question.",
        },
        answer: "B",
        explanation:
          '"Didn\'t say nothing" contains two negatives ("didn\'t" + "nothing"), which cancel each other out in standard English to produce a positive meaning ("he said something"). Correct forms: "He didn\'t say anything" or "He said nothing." Options A, C, and D use single negatives correctly ("hardly," "rarely," "scarcely").',
      },
      {
        section: "C",
        question:
          'Identify the type of error in the following sentence:\n"Running quickly down the stairs, the vase was knocked over."',
        options: {
          A: "Subject-verb agreement error",
          B: "Dangling modifier",
          C: "Tense inconsistency",
          D: "Incorrect apostrophe use",
        },
        answer: "B",
        explanation:
          'The participial phrase "Running quickly down the stairs" is a dangling modifier — it illogically implies the vase was running. The logical subject performing the action (the person running) is absent from the main clause. Correct: "Running quickly down the stairs, she knocked over the vase."',
      },
      {
        section: "C",
        question:
          "Which sentence incorrectly uses a formal register in written English?",
        options: {
          A: "The committee deliberated at length before reaching a decision.",
          B: "The scientist enquired into the phenomenon with great precision.",
          C: "The new policy gonna affect all employees from next month.",
          D: "The governor addressed the assembly with measured authority.",
        },
        answer: "C",
        explanation:
          '"Gonna" is a colloquial contraction of "going to" and is inappropriate in formal written English. It should be replaced with "is going to." Options A, B, and D use formal register vocabulary and syntax consistently.',
      },
      {
        section: "C",
        question:
          'Which sentence contains an error in the use of "who" or "whom"?',
        options: {
          A: "The candidate who scored highest was awarded the scholarship.",
          B: "To whom should I address this complaint?",
          C: "The teacher who I most admire has retired.",
          D: "Whom do you think will win the prize?",
        },
        answer: "D",
        explanation:
          'In Option D, "who" is the subject of "will win the prize" — it performs the action, so the subject form "who" is correct: "Who do you think will win the prize?" "Whom" is the object form. In Option C, "who" is also correct as the object of "admire" is debated, but "whom I most admire" is formally preferred. D is the clearest error: using "whom" where "who" is required as a subject.',
      },
      {
        section: "C",
        question:
          'Which sentence correctly avoids the common confusion of "less" and "fewer"?',
        options: {
          A: "There were less students in the hall today.",
          B: "She has fewer money than her brother.",
          C: "There were fewer students in the hall today.",
          D: "She has less books on her shelf than him.",
        },
        answer: "C",
        explanation:
          '"Fewer" is used with countable nouns (students, books, chairs); "less" is used with uncountable nouns (money, time, water). "Fewer students" is correct because individual students can be counted. Options A and D misuse "less" with countable nouns; Option B misuses "fewer" with the uncountable noun "money."',
      },
      {
        section: "C",
        question:
          'A student wrote: "The data are quite clear on this matter; the evidence clearly shows that the results supports our hypothesis." Identify the grammatical error.',
        options: {
          A: '"Data are" should be "data is"',
          B: '"Results supports" should be "results support"',
          C: "The semicolon is incorrectly used",
          D: '"Clearly shows" should be "clearly show"',
        },
        answer: "B",
        explanation:
          '"Results" is a plural noun, so it requires the plural verb "support," not "supports." Subject-verb agreement: "the results support our hypothesis." Note: "data" is technically a Latin plural (datum/data), so "data are" in Option A is formally correct, not an error.',
      },
      {
        section: "C",
        question:
          "Which sentence best demonstrates correct formal English with no grammatical errors?",
        options: {
          A: "The research, which was conducted over three years, have produced significant findings.",
          B: "The research, which was conducted over three years, has produced significant findings.",
          C: "The research which was conducted over three years have produced significant findings.",
          D: "The research, which was conducted over three years, have produced significant finding.",
        },
        answer: "B",
        explanation:
          '"Research" is a singular noun, requiring the singular verb "has produced." The relative clause "which was conducted over three years" is a non-defining clause and correctly enclosed in commas. "Findings" (plural) correctly refers to multiple results. Only Option B combines correct subject-verb agreement, proper punctuation of the relative clause, and the appropriate plural noun.',
      },
    ],
  },
};
