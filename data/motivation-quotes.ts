import type { Localized } from "./types";

// 1000+ offline motivation quote bank for My Plan Project.
// No internet dependency. Deterministic generation keeps bundle clean while still giving a large bank.

const featuredMotivationQuotes: Localized[] = [
  {
    en: "Proof beats promises. Build, record, review, repeat.",
    bn: "Promise থেকে proof বেশি powerful। Build করো, record করো, review করো, repeat করো।",
  },
  {
    en: "Your profile becomes international when your evidence becomes organized.",
    bn: "Evidence organized হলেই profile international level-এ দেখায়।",
  },
  {
    en: "Small daily progress is stronger than random big plans.",
    bn: "Random বড় plan থেকে daily ছোট progress বেশি powerful।",
  },
  {
    en: "Do less, but go deep. Deep work creates rare proof.",
    bn: "কম করো, কিন্তু deep করো। Deep work rare proof তৈরি করে।",
  },
  {
    en: "Certificates help, but projects and notes prove the real skill.",
    bn: "Certificate help করে, কিন্তু project আর note real skill prove করে।",
  },
  {
    en: "Your future is not decided by motivation; it is decided by systems.",
    bn: "Future motivation দিয়ে না, system দিয়ে তৈরি হয়।",
  },
  {
    en: "If you can track it, you can improve it.",
    bn: "যেটা track করতে পারো, সেটাই improve করতে পারো।",
  },
  {
    en: "One focused hour is better than five distracted hours.",
    bn: "এক ঘণ্টা focused work পাঁচ ঘণ্টা distracted work থেকে ভালো।",
  },
  {
    en: "Build a portfolio that speaks before you enter the room.",
    bn: "এমন portfolio বানাও, যেটা তুমি কথা বলার আগেই তোমার skill show করে।",
  },
  {
    en: "Review weekly. Adjust monthly. Win yearly.",
    bn: "Weekly review করো, monthly adjust করো, yearly win করো।",
  },
  {
    en: "A clean dashboard is a clean mind for execution.",
    bn: "Clean dashboard মানে execution-এর জন্য clean mind।",
  },
  {
    en: "Today’s note becomes tomorrow’s proof.",
    bn: "আজকের note কালকের proof হয়ে যায়।",
  },
  {
    en: "Your roadmap is not a dream board; it is a work board.",
    bn: "Roadmap শুধু dream board না, এটা work board।",
  },
  {
    en: "Every saved file is a future evidence point.",
    bn: "প্রতিটা saved file future evidence point।",
  },
  {
    en: "Consistency makes ordinary skills look professional.",
    bn: "Consistency ordinary skill-কেও professional বানিয়ে দেয়।",
  },
  {
    en: "Your exam is not pressure; it is a chance to build proof.",
    bn: "Exam pressure না, proof build করার chance।",
  },
  {
    en: "Never confuse scrolling with learning.",
    bn: "Scrolling আর learning এক না — এটা মনে রাখো।",
  },
  {
    en: "A small completed task is better than a perfect pending plan.",
    bn: "Perfect pending plan থেকে ছোট completed task ভালো।",
  },
  {
    en: "Your strongest competitor is your old routine.",
    bn: "তোমার সবচেয়ে বড় competitor তোমার পুরনো routine।",
  },
  {
    en: "Make your future easy by making today disciplined.",
    bn: "আজ disciplined হলে future easy হবে।",
  },
];

const focusAreas = [
  { en: "Academic CGPA", bn: "Academic CGPA" },
  { en: "Math-2", bn: "Math-2" },
  { en: "Python Programming", bn: "Python Programming" },
  { en: "English-2", bn: "English-2" },
  { en: "Bangla-2", bn: "Bangla-2" },
  { en: "Basic Electronics", bn: "Basic Electronics" },
  { en: "Chemistry", bn: "Chemistry" },
  { en: "IELTS preparation", bn: "IELTS preparation" },
  { en: "Cloud/DevOps", bn: "Cloud/DevOps" },
  { en: "AI Automation", bn: "AI Automation" },
  { en: "Portfolio projects", bn: "Portfolio projects" },
  { en: "Debate practice", bn: "Debate practice" },
  { en: "Rover Scout leadership", bn: "Rover Scout leadership" },
  { en: "Olympiad preparation", bn: "Olympiad preparation" },
  { en: "Freelancing skill", bn: "Freelancing skill" },
  { en: "Networking", bn: "Networking" },
  { en: "Communication", bn: "Communication" },
  { en: "Certificate proof", bn: "Certificate proof" },
  { en: "Document vault", bn: "Document vault" },
  { en: "Monthly review", bn: "Monthly review" },
  { en: "Daily routine", bn: "Daily routine" },
  { en: "Weekly execution", bn: "Weekly execution" },
  { en: "Abroad preparation", bn: "Abroad preparation" },
  { en: "Scholarship profile", bn: "Scholarship profile" },
  { en: "Client-ready skill", bn: "Client-ready skill" },
  { en: "Problem solving", bn: "Problem solving" },
  { en: "Deep work", bn: "Deep work" },
  { en: "Note taking", bn: "Note taking" },
  { en: "Revision", bn: "Revision" },
  { en: "Practical work", bn: "Practical work" },
];

const actions = [
  { en: "wins when you practice before comfort", bn: "comfort-এর আগে practice করলে win করে" },
  { en: "grows when you track small progress", bn: "small progress track করলে grow করে" },
  { en: "becomes real when you save proof", bn: "proof save করলেই real হয়" },
  { en: "gets stronger when you review mistakes", bn: "mistake review করলে stronger হয়" },
  { en: "improves when you reduce random work", bn: "random কাজ কমালে improve হয়" },
  { en: "needs focus, not noise", bn: "noise না, focus লাগে" },
  { en: "needs one clear next action", bn: "একটা clear next action লাগে" },
  { en: "becomes easier after the first 20 minutes", bn: "প্রথম 20 মিনিটের পর easy লাগে" },
  { en: "is built by daily evidence", bn: "daily evidence দিয়ে build হয়" },
  { en: "needs consistency more than talent", bn: "talent-এর চেয়ে consistency বেশি লাগে" },
  { en: "gets visible when you document it", bn: "document করলে visible হয়" },
  { en: "moves faster when you remove distractions", bn: "distraction remove করলে faster move করে" },
  { en: "becomes premium when you make it organized", bn: "organized করলে premium হয়ে যায়" },
  { en: "turns into opportunity when you show proof", bn: "proof show করলে opportunity হয়" },
  { en: "needs discipline on boring days", bn: "boring day-তেও discipline লাগে" },
  { en: "is not hard when you split it into small blocks", bn: "small block করলে hard থাকে না" },
  { en: "gets powerful when you teach it to yourself", bn: "নিজেকে teach করলে powerful হয়" },
  { en: "improves through repetition, not only intention", bn: "intention না, repetition দিয়ে improve হয়" },
  { en: "needs a clean system before big ambition", bn: "big ambition-এর আগে clean system লাগে" },
  { en: "becomes your advantage when others ignore it", bn: "অন্যরা ignore করলে এটা তোমার advantage হয়" },
  { en: "becomes confidence after enough practice", bn: "enough practice-এর পর confidence হয়" },
  { en: "needs proof today, not excuses tomorrow", bn: "আগামীকালের excuse না, আজকের proof লাগে" },
  { en: "gets better when you finish one thing fully", bn: "একটা জিনিস fully finish করলে better হয়" },
  { en: "moves from dream to reality through schedule", bn: "schedule দিয়ে dream থেকে reality হয়" },
  { en: "should be measured, not guessed", bn: "guess না, measure করতে হয়" },
  { en: "becomes a story when you record the journey", bn: "journey record করলে story হয়" },
  { en: "requires patience with visible progress", bn: "visible progress সহ patience লাগে" },
  { en: "starts when you stop waiting for perfect mood", bn: "perfect mood-এর wait বন্ধ করলেই start হয়" },
  { en: "gets easier when your notes are clean", bn: "notes clean হলে easier হয়" },
  { en: "becomes professional when you add case studies", bn: "case study add করলে professional হয়" },
  { en: "needs action before motivation", bn: "motivation-এর আগে action লাগে" },
  { en: "becomes rare when you do it every week", bn: "weekly করলে rare হয়ে যায়" },
  { en: "gives results when you protect your attention", bn: "attention protect করলে result দেয়" },
  { en: "is strongest when you do the basics well", bn: "basic ভালো করলে strongest হয়" },
  { en: "gets clear when you write the next step", bn: "next step লিখলে clear হয়" },
];

const closers = [
  { en: "Start with one task now.", bn: "এখনই একটা task দিয়ে start করো।" },
  { en: "Make it visible in your dashboard.", bn: "Dashboard-এ visible করে রাখো।" },
  { en: "Save the proof before you forget it.", bn: "ভুলে যাওয়ার আগে proof save করো।" },
  { en: "Review tonight, improve tomorrow.", bn: "রাতে review করো, কাল improve করো।" },
  { en: "Small action, strong identity.", bn: "Small action, strong identity।" },
  { en: "Do it before scrolling.", bn: "Scrolling-এর আগে এটা করো।" },
  { en: "Finish one block today.", bn: "আজ একটা block finish করো।" },
  { en: "Make the next step too easy to ignore.", bn: "Next step এত easy করো যেন ignore করা না যায়।" },
  { en: "Turn effort into evidence.", bn: "Effort-কে evidence বানাও।" },
  { en: "Progress loves clarity.", bn: "Progress clarity পছন্দ করে।" },
  { en: "Your future self will thank you.", bn: "Future তুমি আজকের তোমাকে thank করবে।" },
  { en: "Do the boring work with a premium mindset.", bn: "Boring work premium mindset দিয়ে করো।" },
  { en: "No drama, just execution.", bn: "Drama না, execution।" },
  { en: "Protect the plan from random mood.", bn: "Random mood থেকে plan protect করো।" },
  { en: "One proof today changes your confidence tomorrow.", bn: "আজকের একটা proof কাল confidence বদলাবে।" },
  { en: "Do not break the chain.", bn: "Chain break করো না।" },
  { en: "Let your record speak.", bn: "তোমার record কথা বলুক।" },
  { en: "Keep it simple and finish it.", bn: "Simple রাখো, finish করো।" },
  { en: "Consistency is the real shortcut.", bn: "Consistency-ই real shortcut।" },
  { en: "Today is a profile-building day.", bn: "আজ profile-building day।" },
];

const mindsetLines = [
  { en: "You do not need to be perfect; you need to be repeatable.", bn: "Perfect হতে হবে না; repeatable হতে হবে।" },
  { en: "A serious student records serious progress.", bn: "Serious student serious progress record করে।" },
  { en: "Your roadmap should reduce confusion, not increase pressure.", bn: "Roadmap confusion কমাবে, pressure বাড়াবে না।" },
  { en: "If it matters for your future, give it a place in your system.", bn: "Future-এর জন্য important হলে system-এ জায়গা দাও।" },
  { en: "Skill grows faster when proof is organized.", bn: "Proof organized হলে skill faster grow করে।" },
  { en: "Do not collect dreams; collect completed steps.", bn: "Dream collect না, completed step collect করো।" },
  { en: "The best plan is the one you can review every week.", bn: "Best plan হলো যেটা weekly review করা যায়।" },
  { en: "You are building a life portfolio, not only a website.", bn: "তুমি শুধু website না, life portfolio build করছো।" },
  { en: "Every subject becomes easier when you define the next practice task.", bn: "Next practice task define করলে subject easier হয়।" },
  { en: "Your goal is not to look busy; your goal is to become capable.", bn: "Busy দেখানো goal না; capable হওয়া goal।" },
  { en: "A clear folder today saves one hour tomorrow.", bn: "আজকের clear folder কাল এক ঘণ্টা save করবে।" },
  { en: "A note without review is half value; review makes it powerful.", bn: "Review ছাড়া note half value; review এটাকে powerful করে।" },
  { en: "Your discipline is your silent scholarship preparation.", bn: "তোমার discipline silent scholarship preparation।" },
  { en: "The world notices consistent proof more than random talent.", bn: "World random talent-এর চেয়ে consistent proof notice করে।" },
  { en: "When you feel behind, organize one thing and move again.", bn: "Behind লাগলে একটা জিনিস organize করো, আবার move করো।" },
  { en: "A good routine protects your future from your mood.", bn: "Good routine তোমার future-কে mood থেকে protect করে।" },
  { en: "Make learning visible, measurable, and repeatable.", bn: "Learning visible, measurable, repeatable করো।" },
  { en: "Your strongest identity is built by repeated small wins.", bn: "Repeated small win দিয়েই strongest identity build হয়।" },
  { en: "Focus is a skill; train it like programming.", bn: "Focus একটা skill; programming-এর মতো train করো।" },
  { en: "Your project becomes premium when your process becomes clean.", bn: "Process clean হলে project premium হয়।" },
];

function buildGeneratedQuotes(): Localized[] {
  const generated: Localized[] = [];

  for (const focus of focusAreas) {
    for (const action of actions) {
      for (const closer of closers.slice(0, 2)) {
        generated.push({
          en: `${focus.en} ${action.en}. ${closer.en}`,
          bn: `${focus.bn} ${action.bn}. ${closer.bn}`,
        });
      }
    }
  }

  for (const focus of focusAreas) {
    for (const mindset of mindsetLines) {
      generated.push({
        en: `${focus.en}: ${mindset.en}`,
        bn: `${focus.bn}: ${mindset.bn}`,
      });
    }
  }

  for (const action of actions) {
    for (const closer of closers) {
      generated.push({
        en: `${action.en.charAt(0).toUpperCase()}${action.en.slice(1)}. ${closer.en}`,
        bn: `${action.bn}. ${closer.bn}`,
      });
    }
  }

  return generated;
}

const generatedMotivationQuotes = buildGeneratedQuotes();

export const motivationQuotes: Localized[] = [
  ...featuredMotivationQuotes,
  ...generatedMotivationQuotes,
].slice(0, 1200);

export const motivationQuoteCount = motivationQuotes.length;
