import type { PromptAnalysis, RuleHit } from "./types";

export function estTokens(text: string): number {
  return Math.max(0, Math.ceil((text || "").trim().length / 4));
}

export function cost(tokens: number): string {
  const eur = tokens * 0.000006;
  return eur < 0.001 ? "€0.0008" : `€${eur.toFixed(4)}`;
}

export function intent(t: string): string {
  if (/\btranslat/.test(t)) return "translate";
  if (/\b(summar|tl;?dr|shorten|condense)\b/.test(t)) return "summarize";
  if (/\b(code|function|python|javascript|program|debug|script|html|css)\b/.test(t))
    return "code";
  if (/\b(write|draft|essay|email|story|poem|paragraph|caption|letter|speech)\b/.test(t))
    return "write";
  if (/\b(ideas|brainstorm|suggest|name some|give me \d|list of)\b/.test(t))
    return "brainstorm";
  if (/\b(plan|schedule|steps to|how do i|how to|guide|study|revise)\b/.test(t))
    return "plan";
  if (/\b(explain|what is|what'?s|why|how does|define|meaning of|tell me about)\b/.test(t))
    return "explain";
  return "general";
}

export function scan(t: string): RuleHit | null {
  if (/\b(hurt myself|kill myself|end my life|self.?harm|want to die)\b/.test(t)) {
    return {
      kind: "safety",
      severity: "block",
      icon: "🫶",
      kicker: "Safety — you matter",
      title: "Let's pause here",
      body: "This sounds heavy, and a chatbot isn't the right help for it. Please talk to someone you trust — a parent, teacher, or counsellor — right now.",
      refTag: "Need help now?",
      refBg: "#1F9E6F",
      refText:
        "In the EU you can reach a free helpline any time. You're not alone, and reaching out is the strong move.",
      fix: "Close the sandbox and message a trusted adult, or call a local helpline. We'll be here when you're ready.",
    };
  }
  if (
    /\b(how to (make|build) a (bomb|weapon|gun|explosive)|hack into|steal (a|someone)|make (a )?(poison|drug)|break into)\b/.test(
      t
    )
  ) {
    return {
      kind: "safety",
      severity: "block",
      icon: "🛑",
      kicker: "Safety — blocked",
      title: "I can't help with that",
      body: "This prompt asks for something dangerous or illegal, so the agent won't answer it — in the sandbox or in the real world.",
      refTag: "Acceptable use",
      refBg: "#E23D43",
      refText:
        "Every real AI platform bans requests that could cause physical harm or break the law. Trying them can also get your account suspended.",
      fix: 'Ask about the topic safely instead — e.g. "Explain how firefighters safely handle explosives," which is about learning, not doing harm.',
    };
  }
  if (
    /\b(detect (students?|their|pupils?|classmates?)('| )?emotion|emotion recognition|scan (their |students?'? )?(faces|emotions)|read (their|students?'?) (mood|feelings))\b/.test(
      t
    )
  ) {
    return {
      kind: "eu",
      severity: "block",
      icon: "🚫",
      kicker: "EU AI Act — prohibited",
      title: "Emotion recognition in school is banned",
      body: "Using AI to infer the emotions of students in an educational setting is a prohibited practice in the EU — it's not allowed even as an experiment.",
      refTag: "AI Act · Art. 5(1)(f)",
      refBg: "#2F5BEA",
      refText:
        "The AI Act bans emotion-recognition systems in workplaces and education, except for narrow medical or safety reasons.",
      fix: 'Design a check-in students opt into instead — e.g. "Suggest 3 questions a teacher could ask so students can share how they feel."',
    };
  }
  if (
    /\b(rank (students|people|classmates) by|social scor|score (people|students|citizens) (by|on) (behaviou?r|trust)|trustworthiness score)\b/.test(
      t
    )
  ) {
    return {
      kind: "eu",
      severity: "block",
      icon: "🚫",
      kicker: "EU AI Act — prohibited",
      title: "Social scoring is banned",
      body: "Rating or ranking people by their behaviour or personal traits to decide how they're treated is a prohibited \"social scoring\" practice in the EU.",
      refTag: "AI Act · Art. 5(1)(c)",
      refBg: "#2F5BEA",
      refText:
        "The AI Act forbids social-scoring systems that lead to unfair or unrelated disadvantage for people or groups.",
      fix: 'Evaluate work, not people — e.g. "Give feedback on this essay against these 3 rubric criteria."',
    };
  }
  if (
    /\b(scrape (faces|photos|images)|build a (facial recognition|face) (database|dataset)|collect (everyone'?s )?faces)\b/.test(
      t
    )
  ) {
    return {
      kind: "eu",
      severity: "block",
      icon: "🚫",
      kicker: "EU AI Act — prohibited",
      title: "Untargeted face scraping is banned",
      body: "Building a facial-recognition database by scraping images from the internet or CCTV is a prohibited practice in the EU.",
      refTag: "AI Act · Art. 5(1)(e)",
      refBg: "#2F5BEA",
      refText:
        "The AI Act bans the untargeted scraping of facial images to create or expand recognition databases.",
      fix: 'Explore the ethics instead — e.g. "Explain why scraping faces for AI raises privacy concerns."',
    };
  }
  if (
    /\b(deepfake|fake (video|photo|image|news|quote) of|impersonate|pretend to be (a real|elon|trump|taylor|the president|my teacher|a celebrity)|clone (his|her|their|a real) voice)\b/.test(
      t
    )
  ) {
    return {
      kind: "eu",
      severity: "warn",
      icon: "⚠️",
      kicker: "EU AI Act — transparency",
      title: "AI fakes must be labelled",
      body: "Creating realistic fake images, video, audio or text of real people (\"deepfakes\") is allowed only if it's clearly disclosed as AI-generated — and never to deceive or harm.",
      refTag: "AI Act · Art. 50(4)",
      refBg: "#E8911C",
      refText:
        "Deployers of AI that makes deepfakes must clearly label the content as artificially generated or manipulated.",
      fix: 'If you continue, the result must carry a visible "AI-generated" label — and never target a real person without consent.',
    };
  }
  if (
    /\b(my (home )?address is|my phone number is|my password is|credit card|my full name is|where i live is|my school is|i live at|here'?s my)\b/.test(
      t
    )
  ) {
    return {
      kind: "safety",
      severity: "warn",
      icon: "🔒",
      kicker: "Privacy — personal data",
      title: "Don't share personal details",
      body: "You're about to send personal information to an AI. Once it's sent, you can't take it back — and it might be stored or used for training. In this sandbox it stays on your device — but with a real AI, it would leave for good.",
      refTag: "GDPR · data minimisation",
      refBg: "#2F5BEA",
      refText:
        "EU data-protection law says you should only share personal data when it's truly necessary. With AI, the safest amount is usually none.",
      fix: 'Swap real details for placeholders — e.g. "my address" → "[ADDRESS]", "my name" → "a student".',
    };
  }
  if (
    /\b(write my (essay|homework|assignment|report)|do my homework|finish my homework|answers to (the|my) (test|exam|quiz|homework)|give me the answers)\b/.test(
      t
    )
  ) {
    return {
      kind: "safety",
      severity: "warn",
      icon: "🎓",
      kicker: "Learning — use it honestly",
      title: "Let AI help you learn, not cheat",
      body: "Handing in AI-written work as your own usually breaks your school's rules — and you miss the actual learning, which is the whole point.",
      refTag: "Academic integrity",
      refBg: "#E8911C",
      refText:
        "Most schools now treat undisclosed AI-written work the same as copying. Teachers can often tell, too.",
      fix: 'Make AI your tutor — e.g. "Ask me 5 questions to check I understand this topic," or "Give feedback on my draft below."',
    };
  }
  return null;
}

function topic(t: string): string {
  let s = (t || "")
    .replace(/^(please|can you|could you|hey|hi|ok|okay)\b[ ,]*/i, "")
    .replace(
      /\b(write|draft|explain|summarize|summarise|translate|tell me about|what is|what'?s|how (do|does|to)|give me|create|make|act as an? \w+ and|you are an? \w+[.,]?)\b/gi,
      ""
    )
    .replace(/\b(please|for me|to me)\b/gi, "")
    .trim()
    .replace(/[?.!]+$/, "");
  const w = s.split(/\s+/).filter(Boolean).slice(0, 8).join(" ");
  return w || "that";
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function analyze(raw: string): PromptAnalysis {
  const t = (raw || "").toLowerCase().trim();
  const words = t ? t.split(/\s+/).length : 0;
  const has = {
    context:
      /\b(because|so that|for a|context|background|the goal is|i need|i want|since|given)\b/.test(
        t
      ) || t.includes(":"),
    role: /\b(act as|you are|pretend you'?re|imagine you'?re|as an? (expert|teacher|tutor|coach|scientist|historian|chef|engineer))\b/.test(
      t
    ),
    format:
      /\b(bullet|list|table|steps|step-by-step|in \d+|words|paragraph|json|outline|numbered|format)\b/.test(
        t
      ),
    audience:
      /\b(for a|beginner|explain like|year ?old|teenager|student|simple terms|audience|tone)\b/.test(
        t
      ),
    specific: words >= 12,
  };
  let score = 18;
  if (has.specific) score += 16;
  if (has.context) score += 18;
  if (has.role) score += 16;
  if (has.format) score += 16;
  if (has.audience) score += 12;
  if (words >= 25) score += 6;
  score = Math.min(100, score);

  return {
    t,
    words,
    has,
    score,
    intent: intent(t),
    tokens: estTokens(raw),
    flag: scan(t),
  };
}

export function respond(raw: string, a: PromptAnalysis): string {
  const top = topic(a.t);
  const good = a.score >= 60;
  const I = a.intent;
  const tip = "\n\n— sandbox preview · a live model would write the full answer here —";

  if (I === "summarize") {
    return good
      ? `Here's a tight summary of ${top}:\n\n•  The core idea, in one line.\n•  Why it matters.\n•  The single thing to remember.${tip}`
      : `I can summarise that — but "${top}" is broad. Paste the text you want shortened and tell me the length (e.g. "in 3 bullet points").`;
  }
  if (I === "explain") {
    return good
      ? `Good question. ${cap(top)}, explained simply:\n\n1.  What it is.\n2.  How it works, step by step.\n3.  A quick everyday example.\n\nWant me to go deeper on any part?${tip}`
      : `Happy to explain ${top}! Quick check: is this for a total beginner or someone with some background? That changes how I'd explain it.`;
  }
  if (I === "write") {
    return good
      ? `Here's a first draft on ${top} — tone and length look set:\n\n"…your drafted text would appear here…"\n\nWant it more formal, or shorter?${tip}`
      : "I can draft that. To nail it first try, tell me: the goal, who reads it, and roughly how long?";
  }
  if (I === "code") {
    return good
      ? `Here's an approach for ${top}:\n\n1.  Set up the inputs.\n2.  The core logic.\n3.  A test to check it works.\n\n\`\`\`\n// your code would appear here\n\`\`\`${tip}`
      : `I can help with code for ${top}. Which language, and what should it do exactly? A tiny example of input → output helps a lot.`;
  }
  if (I === "brainstorm") {
    return good
      ? `Ideas for ${top}:\n\n1.  A safe, obvious one.\n2.  A creative twist.\n3.  A bold, unexpected angle.\n\nWant more, or want me to expand one?${tip}`
      : `Let's brainstorm ${top}! How many ideas, and any theme or constraint to aim for?`;
  }
  if (I === "plan") {
    return good
      ? `Here's a plan for ${top}:\n\n•  Step 1 — start small.\n•  Step 2 — build the habit.\n•  Step 3 — review and adjust.${tip}`
      : `I can plan ${top} with you. What's your deadline and how much time per day do you have?`;
  }
  if (I === "translate") {
    return good
      ? `Here's the translation of ${top}:\n\n"…translated text…"\n\nWant a more formal or casual tone?${tip}`
      : "Sure — what should I translate, and into which language?";
  }
  return good
    ? `Got it. On ${top}:\n\n"…a clear, structured answer would appear here…"\n\nThat prompt was nice and specific — easy to work with!${tip}`
    : `I can help with ${top}! The more you tell me — your goal, any context, the format you want — the better my answer. Try adding one of those.`;
}

export function scoreColor(score: number): string {
  if (score >= 70) return "#1F9E6F";
  if (score >= 40) return "#2F5BEA";
  if (score > 0) return "#E8911C";
  return "#C9BFAC";
}

export function responseTokens(score: number): number {
  return 140 + Math.round(score * 1.2);
}
