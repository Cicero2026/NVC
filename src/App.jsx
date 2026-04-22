import React, { useEffect, useMemo, useState } from "react";

const PLACEHOLDER_PREVIEW = "你輸入的內容會顯示在這裡，方便學生即時看到自己是否真的完成了四步驟。";
const BOARD_KEY = "nvcLeaderboard";

const quizItems = [
  { text: "你這週已經三次在上課後 10 分鐘才進教室。", answer: "observation", explanation: "這句描述了可被看見與計算的行為，沒有直接下評價。" },
  { text: "你真的很沒責任感。", answer: "judgment", explanation: "這是貼標籤與評價，不是具體可觀察的描述。" },
  { text: "昨天開會時，你在我發言的時候看了三次手機。", answer: "observation", explanation: "有時間、場景、具體行為，屬於觀察。" },
  { text: "你根本不尊重我。", answer: "judgment", explanation: "這是對動機與人格的推斷，不是事實陳述。" },
  { text: "這週你有兩次沒有回覆我傳的訊息。", answer: "observation", explanation: "這是可驗證的行為描述。" },
  { text: "你講話總是很煩。", answer: "judgment", explanation: "『很煩』屬於主觀評價，不是具體觀察。" },
  { text: "你今天在我說話時打斷了我兩次。", answer: "observation", explanation: "可觀察、可計數，是具體行為。" },
  { text: "你就是故意不理人。", answer: "judgment", explanation: "這是在推測對方內在意圖。" },
  { text: "這次小組作業，你沒有參加上週三的討論，也沒有上傳你的部分。", answer: "observation", explanation: "這是針對具體行為與時間點的描述。" },
  { text: "你根本沒有團隊精神。", answer: "judgment", explanation: "這是概括性評價，不是事實陳述。" },
  { text: "昨天我傳給你的訊息到現在還顯示已讀未回。", answer: "observation", explanation: "這是對訊息狀態的描述，可被驗證。" },
  { text: "你每次都愛找藉口。", answer: "judgment", explanation: "這是在下結論與貼標籤。" },
];

const roleStyles = {
  teacher: {
    emoji: "🧑‍🏫",
    badge: "老師",
    card: "from-violet-500/20 to-fuchsia-500/10",
    ring: "ring-violet-200",
  },
  student: {
    emoji: "🧑‍🎓",
    badge: "學生",
    card: "from-cyan-500/20 to-sky-500/10",
    ring: "ring-cyan-200",
  },
  teammate: {
    emoji: "🤝",
    badge: "組員",
    card: "from-emerald-500/20 to-teal-500/10",
    ring: "ring-emerald-200",
  },
  friend: {
    emoji: "💬",
    badge: "朋友",
    card: "from-amber-500/20 to-orange-500/10",
    ring: "ring-amber-200",
  },
};

const scenarios = [
  {
    title: "上課遲到",
    role: "teacher",
    scene: "課堂管理",
    situation: "學生連續兩週上課都晚到，老師很不高興。",
    observation: "你這兩週有三次在上課開始後約 10 分鐘才進教室。",
    feeling: "我有些焦慮，也有點挫折。",
    need: "因為我很重視課堂秩序與彼此尊重。",
    request: "你下次願意在上課前先到教室嗎？如果真的會晚到，也先傳訊息告訴我。",
  },
  {
    title: "開會滑手機",
    role: "student",
    scene: "團隊討論",
    situation: "開會時，同學一直看手機，報告者覺得不被重視。",
    observation: "剛剛我報告時，你大約看了四次手機。",
    feeling: "我有點分心，也有些失落。",
    need: "因為我希望被專心聆聽，也希望討論有效率。",
    request: "接下來 10 分鐘，你願意先把手機放下，等我講完後再一起討論嗎？",
  },
  {
    title: "分組不合作",
    role: "teammate",
    scene: "小組作業",
    situation: "小組作業快截止了，但有組員一直沒有交出自己的部分。",
    observation: "我們上週三討論後，你原本答應週五上傳內容，但到現在還沒看到你的檔案。",
    feeling: "我有些緊張，也有點壓力。",
    need: "因為我希望分工清楚，也希望大家共同承擔責任。",
    request: "你願意告訴我你現在的進度，並在今晚 8 點前先交出初稿嗎？",
  },
  {
    title: "已讀不回",
    role: "friend",
    scene: "人際互動",
    situation: "朋友已讀不回，另一方心裡很不舒服。",
    observation: "我昨天晚上傳了兩則訊息，到現在還沒有收到你的回覆。",
    feeling: "我有點不安，也有些失望。",
    need: "因為我希望我們之間的聯繫是清楚的，也想知道你是否平安。",
    request: "你現在方便告訴我，你是忙碌、需要空間，還是只是忘了回嗎？",
  },
  {
    title: "打斷發言",
    role: "student",
    scene: "課堂討論",
    situation: "討論時，有人頻繁打斷別人的發言。",
    observation: "剛剛我講話的時候，你有兩次在我還沒說完前就插話。",
    feeling: "我有點挫折，也覺得有些急。",
    need: "因為我希望自己能完整表達，也希望討論有輪流的空間。",
    request: "你願意先讓我把這一段說完，再回應我嗎？",
  },
  {
    title: "報告時竊笑",
    role: "student",
    scene: "上台報告",
    situation: "台上同學報告時，台下有人竊笑，讓報告者很不自在。",
    observation: "剛才我報告時，後排有幾位同學在我講到一半時笑出聲。",
    feeling: "我有點尷尬，也有些受傷。",
    need: "因為我希望在報告時被尊重，也希望自己能安心完成表達。",
    request: "接下來你們願意先把想法記下來，等我報告完再討論嗎？",
  },
  {
    title: "作業抄襲",
    role: "teacher",
    scene: "學術誠信",
    situation: "老師發現兩份作業內容高度相似。",
    observation: "我看到你這份作業有多處段落和另一位同學的內容幾乎一樣。",
    feeling: "我有些擔心，也有些困惑。",
    need: "因為我重視學術誠信，也希望評分是公平的。",
    request: "你願意和我說明這份作業的完成過程嗎？",
  },
  {
    title: "隊友臨時缺席",
    role: "teammate",
    scene: "報告現場",
    situation: "分組上台前，隊友沒有事先告知就缺席。",
    observation: "今天報告前，你沒有到現場，也沒有先在群組裡說明。",
    feeling: "我有些慌張，也很有壓力。",
    need: "因為我希望團隊能互相通知，也希望臨時變動可以提前協調。",
    request: "下次若你不能來，願意至少提前一小時在群組裡告知嗎？",
  },
];

const feelingsBank = ["失望", "焦慮", "挫折", "難過", "孤單", "放心", "感激", "開心", "沮喪", "困惑"];
const needsBank = ["尊重", "理解", "合作", "效率", "被看見", "信任", "安全感", "秩序", "陪伴", "清楚溝通"];
const requestBank = [
  "你可以先告訴我你的想法嗎？",
  "你下次能在 10 點前到嗎？",
  "你願意先把手機收起來 20 分鐘嗎？",
  "你可以重複一次你聽到的重點嗎？",
  "你願意今晚八點前回覆我嗎？",
  "你可不可以先聽我說完兩分鐘？",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function runSelfTests() {
  return [
    { name: "題庫至少 10 題", pass: quizItems.length >= 10 },
    { name: "每題都有 answer 與 explanation", pass: quizItems.every((q) => Boolean(q.answer) && Boolean(q.explanation)) },
    { name: "情境至少 6 則", pass: scenarios.length >= 6 },
    { name: "情緒詞庫可用", pass: feelingsBank.length > 0 },
    { name: "需要詞庫可用", pass: needsBank.length > 0 },
    { name: "請求詞庫可用", pass: requestBank.length > 0 },
    { name: "角色樣式完整", pass: scenarios.every((s) => Boolean(roleStyles[s.role])) },
    { name: "替代詞映射存在", pass: getReplacementOptions("一直").length > 0 && getReplacementOptions("滾").length > 0 },
  ];
}

function ProgressBar({ value }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/50 ring-1 ring-white/40">
      <div
        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={cn("rounded-[28px] border border-white/40 bg-white/70 p-6 shadow-[0_10px_40px_rgba(76,29,149,0.12)] backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
        active
          ? "border-violet-500 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
          : "border-white/50 bg-white/70 text-slate-700 hover:bg-white"
      )}
    >
      {children}
    </button>
  );
}

function PillButton({ children, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-200",
        active
          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/20"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
      )}
    >
      {children}
    </button>
  );
}

function ScoreBadge({ label, value, tone = "violet" }) {
  const toneClassMap = {
    violet: "from-violet-600 to-fuchsia-500",
    cyan: "from-cyan-500 to-sky-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={cn("mt-2 bg-gradient-to-r bg-clip-text text-3xl font-black text-transparent", toneClassMap[tone] || toneClassMap.violet)}>
        {value}
      </div>
    </div>
  );
}

function buildPreviewText(observationInput, feelingInput, needInput, requestInput) {
  const parts = [];
  if (observationInput.trim()) parts.push(`當我看到／聽到：${observationInput.trim()}`);
  if (feelingInput.trim()) parts.push(`我感到：${feelingInput.trim()}`);
  if (needInput.trim()) parts.push(`因為我在意：${needInput.trim()}`);
  if (requestInput.trim()) parts.push(`我想請求：${requestInput.trim()}`);
  return parts.length ? parts.join("\n") : PLACEHOLDER_PREVIEW;
}

function buildNvcScore(observationInput, feelingInput, needInput, requestInput) {
  let score = 0;
  const obs = observationInput.trim();
  const feel = feelingInput.trim();
  const need = needInput.trim();
  const req = requestInput.trim();

  if (obs) score += 1;
  if (feel) score += 1;
  if (need) score += 1;
  if (req) score += 1;
  if (obs && !/[一直都總是討厭爛故意]/.test(obs)) score += 2;
  if (feel && !/(覺得他|覺得她|找我麻煩|不尊重我|針對我)/.test(feel)) score += 2;
  if (need && need.length >= 4) score += 1;
  if (req && req.length >= 8 && /(嗎|可不可以|願意|能不能|是否)/.test(req)) score += 2;

  return Math.min(10, score);
}

function buildAnalysisFeedback(observationInput, feelingInput, needInput, requestInput) {
  const issues = [];

  if (observationInput && (observationInput.includes("一直") || observationInput.includes("都") || observationInput.includes("總是") || observationInput.includes("很"))) {
    issues.push("觀察中可能混入評價，建議改成可數、可見、可錄影的行為描述。比如把『一直抱怨』改成『在十分鐘內提了三次不滿』。");
  }

  if (observationInput && /(抱怨|找麻煩|不尊重|針對)/.test(observationInput)) {
    issues.push("觀察最好避免直接解讀對方意圖，建議換成客觀行為。");
  }

  if (feelingInput && (feelingInput.includes("覺得") || feelingInput.includes("他") || feelingInput.includes("她") || feelingInput.includes("找我麻煩"))) {
    issues.push("感受欄混入判斷。『我覺得他找我麻煩』不是感受，比較像解讀；可改成『我很煩躁、焦慮、受挫』。");
  }

  if (requestInput && requestInput.length > 0 && requestInput.length < 6) {
    issues.push("請求太短，容易像命令。建議加入具體時間、行為與可回應形式。");
  }

  if (requestInput && !( /(嗎|可不可以|願意|能不能|是否)/.test(requestInput) )) {
    issues.push("請求目前比較像要求，建議改成可回答的句型，例如『你願意先讓我說完嗎？』。");
  }

  if (needInput && needInput.length < 4) {
    issues.push("需要可以再抽象一點，不只是任務本身，也可寫成效率、尊重、秩序、被理解。");
  }

  return issues;
}

function buildCoachingFeedback(observationInput, feelingInput, needInput, requestInput) {
  if (!observationInput && !feelingInput && !needInput && !requestInput) return "";

  const parts = [];
  if (observationInput.trim()) {
    parts.push(`觀察建議：${/[一直都總是很]/.test(observationInput) ? "把評價字拿掉，改成具體動作與次數。" : "這一段已經有朝客觀描述前進。"}`);
  }
  if (feelingInput.trim()) {
    parts.push(`感受建議：${/(覺得他|覺得她|找我麻煩|不尊重)/.test(feelingInput) ? "改成純情緒詞，例如焦躁、煩悶、委屈。" : "這一段較接近真正的感受。"}`);
  }
  if (needInput.trim()) {
    parts.push(`需要建議：${needInput.length < 4 ? "可以往更深層的價值補充，例如效率、尊重、合作。" : "這一段已經開始指出背後在乎的價值。"}`);
  }
  if (requestInput.trim()) {
    parts.push(`請求建議：${/(嗎|可不可以|願意|能不能|是否)/.test(requestInput) ? "這個請求較容易被對方回應。" : "把命令改成可回應句型，效果會更好。"}`);
  }
  return parts.join(" ");
}

function normalizeObservation(text) {
  let value = text.trim();
  if (!value) return "你剛才出現了一些讓我分心的行為";

  value = value
    .replace(/一直/g, "在這段時間裡多次")
    .replace(/總是/g, "常常")
    .replace(/都在/g, "持續在")
    .replace(/很煩/g, "讓我難以專注")
    .replace(/在煩我/g, "多次打斷我或對我說話")
    .replace(/煩我/g, "打斷我或持續對我說話");

  return value;
}

function normalizeFeeling(text) {
  let value = text.trim();
  if (!value) return "我有些不安";

  if (/不爽|超不爽|很不爽/.test(value)) return "我感到很煩躁，也有些受打擾";
  if (/生氣|火大/.test(value)) return "我感到生氣，也有些挫折";
  if (/覺得/.test(value)) {
    value = value
      .replace(/我覺得/g, "")
      .replace(/很不爽/g, "很煩躁")
      .replace(/不爽/g, "煩躁")
      .replace(/很討厭/g, "很反感")
      .trim();
    if (!/焦慮|難過|失望|挫折|煩躁|委屈|不安|壓力/.test(value)) {
      return "我感到煩躁，也有些挫折";
    }
  }
  return value;
}

function normalizeNeed(text) {
  let value = text.trim();
  if (!value) return "我需要更清楚與有秩序的互動";

  value = value
    .replace(/希望他安靜/g, "我需要安靜與專注的空間")
    .replace(/希望他不要吵/g, "我需要安靜與專注的空間")
    .replace(/趕快完成任務/g, "效率與專注")
    .replace(/他安靜/g, "安靜與專注的空間");

  return value;
}

function normalizeRequest(text) {
  let value = text.trim();
  if (!value) return "你願意先讓我說完，再一起討論嗎？";

  if (/滾/.test(value)) return "你願意先停一下，讓我有兩分鐘安靜完成手上的事嗎？";
  if (/閉嘴/.test(value)) return "你願意先安靜一下，讓我把這段事情處理完嗎？";
  if (/聽我的/.test(value)) return "你願意先聽我把想法說完，再一起決定怎麼做嗎？";

  if (!/(嗎|可不可以|願意|能不能|是否)/.test(value)) {
    value = `你願意${value.replace(/？+$/, "").replace(/!+$/, "")}嗎？`;
  }

  return value;
}

function buildPolishedSuggestion(observationInput, feelingInput, needInput, requestInput) {
  if (!observationInput && !feelingInput && !needInput && !requestInput) return "";

  const obs = normalizeObservation(observationInput);
  const feel = normalizeFeeling(feelingInput);
  const need = normalizeNeed(needInput);
  const req = normalizeRequest(requestInput);

  return `當我看到／聽到：${obs}
我感到：${feel}
因為我在意：${need}
我想請求：${req}`;
}

function getHighlightTokens(text, type) {
  if (!text) return [];

  const rules = {
    observation: [
      { pattern: /一直|總是|都|很/g, label: "評價詞", tone: "red", reason: "這類詞容易把客觀描述變成主觀評價，建議改成具體次數、時間或行為。" },
      { pattern: /抱怨|找麻煩|不尊重|針對|煩我/g, label: "意圖解讀", tone: "amber", reason: "這是在推測對方的動機或態度，NVC 會更鼓勵描述可觀察到的行為。" },
    ],
    feeling: [
      { pattern: /我覺得|覺得/g, label: "偽感受", tone: "red", reason: "『我覺得』常常會把判斷包裝成感受，建議直接寫情緒，例如焦慮、煩躁、失望。" },
      { pattern: /他|她|找我麻煩|不尊重我|針對我/g, label: "混入判斷", tone: "amber", reason: "感受欄應聚焦自己的情緒，不要把對他人的評斷寫進來。" },
      { pattern: /不爽|火大|討厭/g, label: "可再細化", tone: "amber", reason: "這類字太籠統，可再細化成煩躁、委屈、受挫、焦慮等更具體的情緒。" },
    ],
    need: [
      { pattern: /他安靜|希望他安靜|不要吵/g, label: "偏向控制對方", tone: "amber", reason: "需要最好寫成你在意的價值，例如安靜、專注、秩序，而不是直接控制對方。" },
    ],
    request: [
      { pattern: /滾|閉嘴/g, label: "攻擊語", tone: "red", reason: "這類說法容易讓對方防衛，建議改成可回應且不帶羞辱的請求。" },
      { pattern: /聽我的/g, label: "命令式", tone: "amber", reason: "這比較像命令，NVC 的請求通常會設計成對方可以回答的句型。" },
    ],
  };

  const matches = [];
  (rules[type] || []).forEach((rule) => {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        label: rule.label,
        tone: rule.tone,
        reason: rule.reason,
      });
      if (match.index === regex.lastIndex) regex.lastIndex += 1;
    }
  });

  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered = [];
  matches.forEach((item) => {
    if (!filtered.some((f) => !(item.end <= f.start || item.start >= f.end))) {
      filtered.push(item);
    }
  });
  return filtered;
}

function getReplacementOptions(word) {
  const map = {
    "一直": ["在十分鐘內三次", "在這段時間裡多次"],
    "總是": ["在最近幾次中", "這週有三次"],
    "不爽": ["煩躁", "受挫", "有些不安"],
    "火大": ["生氣", "挫折"],
    "滾": ["你願意先停一下嗎？", "你可以先讓我安靜一下嗎？"],
    "閉嘴": ["你願意先安靜一下嗎？"],
    "聽我的": ["你願意先聽我說完嗎？"],
  };
  return map[word] || [];
}

function HighlightedText({ text, type, onReplace }) {
  const highlights = getHighlightTokens(text, type);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  if (!text) return <span className="text-slate-400">尚未輸入</span>;
  if (highlights.length === 0) return <span>{text}</span>;

  const parts = [];
  let cursor = 0;

  highlights.forEach((item, idx) => {
    if (item.start > cursor) {
      parts.push(<span key={`plain-${idx}-${cursor}`}>{text.slice(cursor, item.start)}</span>);
    }

    const toneClass = item.tone === "red"
      ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
      : "bg-amber-100 text-amber-800 ring-1 ring-amber-200";

    const word = text.slice(item.start, item.end);
    const replacements = getReplacementOptions(word);

    parts.push(
      <span key={`mark-${idx}`} className="relative inline-block">
        <span
          className={cn("mx-0.5 inline cursor-pointer rounded px-1.5 py-0.5 font-medium", toneClass)}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
          tabIndex={0}
        >
          {word}
        </span>

        {hoveredIndex === idx && (
          <span className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-slate-900 p-3 text-xs text-white shadow-2xl">
            <span className="block font-bold text-violet-300">{item.label}</span>
            <span className="mt-1 block">{item.reason}</span>
          </span>
        )}

        {activeIndex === idx && replacements.length > 0 && (
          <div className="absolute left-1/2 top-full z-30 mt-16 w-64 -translate-x-1/2 rounded-2xl border border-violet-200 bg-white p-3 text-xs shadow-xl">
            <div className="mb-2 font-bold text-violet-600">替代說法</div>
            <div className="flex flex-wrap gap-2">
              {replacements.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="cursor-pointer rounded-full bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100"
                  onClick={() => {
                    if (onReplace) onReplace(word, r, type);
                    setActiveIndex(null);
                    setHoveredIndex(null);
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </span>
    );

    cursor = item.end;
  });

  if (cursor < text.length) {
    parts.push(<span key={`plain-end-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

function LevelBadge({ streak }) {
  let label = "新手";
  if (streak >= 3) label = "🔥 熱身中";
  if (streak >= 5) label = "⚡ 連擊高手";
  if (streak >= 8) label = "👑 溝通王者";

  return (
    <div className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-lg animate-pulse">
      {label}
    </div>
  );
}

function SuccessBurst({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );
}

function TimerRing({ secondsLeft, totalSeconds }) {
  const percent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-inner ring-8 ring-white/70">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(rgb(139 92 246) ${percent * 3.6}deg, rgba(226,232,240,0.9) 0deg)`,
          maskImage: "radial-gradient(circle at center, transparent 58%, black 59%)",
          WebkitMaskImage: "radial-gradient(circle at center, transparent 58%, black 59%)",
        }}
      />
      <div className="relative text-center">
        <div className="text-2xl font-black text-violet-700">{secondsLeft}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">sec</div>
      </div>
    </div>
  );
}

function RoleSceneCard({ scenario, active, onClick }) {
  const style = roleStyles[scenario.role] || roleStyles.student;
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[24px] border p-4 text-left transition-all duration-200",
        active
          ? "border-violet-500 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
          : "border-white/50 bg-white/80 text-slate-800 hover:bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ring-1", active ? "from-white/25 to-white/10 ring-white/30" : `${style.card} ${style.ring}`)}>
          {style.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold">{scenario.title}</div>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")}>{style.badge}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", active ? "bg-white/15 text-violet-50" : "bg-violet-50 text-violet-600")}>{scenario.scene}</span>
          </div>
          <div className={cn("mt-1 text-sm leading-6", active ? "text-violet-50" : "text-slate-600")}>{scenario.situation}</div>
        </div>
      </div>
    </button>
  );
}

export default function NvcInteractiveLearningPage() {
  const [activeTab, setActiveTab] = useState("quiz");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [revealedParts, setRevealedParts] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [roundSeconds, setRoundSeconds] = useState(20);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundState, setRoundState] = useState("ready");
  const [leaderboard, setLeaderboard] = useState([]);
  const [tests] = useState(runSelfTests());

  const [observationInput, setObservationInput] = useState("");
  const [feelingInput, setFeelingInput] = useState("");
  const [needInput, setNeedInput] = useState("");
  const [requestInput, setRequestInput] = useState("");

  const currentQuiz = quizItems[quizIndex];
  const currentScenario = scenarios[selectedScenario];
  const roleStyle = roleStyles[currentScenario?.role] || roleStyles.student;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
      if (Array.isArray(saved)) setLeaderboard(saved);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(leaderboard));
    } catch {
      // ignore write failures
    }
  }, [leaderboard]);

  useEffect(() => {
    setSecondsLeft(roundSeconds);
  }, [roundSeconds]);

  useEffect(() => {
    if (!timerEnabled) return undefined;
    if (activeTab !== "quiz") return undefined;
    if (quizAnswered) return undefined;
    if (roundState === "timeout") return undefined;
    if (secondsLeft <= 0) {
      setQuizAnswered(true);
      setQuizResult(false);
      setStreak(0);
      setRoundState("timeout");
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [timerEnabled, activeTab, quizAnswered, roundState, secondsLeft]);

  const previewText = useMemo(() => buildPreviewText(observationInput, feelingInput, needInput, requestInput), [observationInput, feelingInput, needInput, requestInput]);
  const nvcScore = useMemo(() => buildNvcScore(observationInput, feelingInput, needInput, requestInput), [observationInput, feelingInput, needInput, requestInput]);
  const analysisFeedback = useMemo(() => buildAnalysisFeedback(observationInput, feelingInput, needInput, requestInput), [observationInput, feelingInput, needInput, requestInput]);
  const coachingFeedback = useMemo(() => buildCoachingFeedback(observationInput, feelingInput, needInput, requestInput), [observationInput, feelingInput, needInput, requestInput]);
  const polishedSuggestion = useMemo(() => buildPolishedSuggestion(observationInput, feelingInput, needInput, requestInput), [observationInput, feelingInput, needInput, requestInput]);
  const quizProgress = ((quizIndex + (quizAnswered ? 1 : 0)) / quizItems.length) * 100;

  function answerQuiz(choice) {
    if (quizAnswered) return;
    const correct = choice === currentQuiz.answer;
    setQuizAnswered(true);
    setQuizResult(correct);
    setRoundState(correct ? "correct" : "wrong");
    if (correct) {
      setQuizScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function nextQuiz() {
    if (quizIndex < quizItems.length - 1) {
      setQuizIndex((q) => q + 1);
      setQuizAnswered(false);
      setQuizResult(null);
      setRoundState("ready");
      setSecondsLeft(roundSeconds);
    }
  }

  function resetQuiz() {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizResult(null);
    setSecondsLeft(roundSeconds);
    setStreak(0);
    setRoundState("ready");
  }

  function togglePart(part) {
    setRevealedParts((prev) => (prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]));
  }

  function changeScenario(index) {
    setSelectedScenario(index);
    setRevealedParts([]);
  }

  function appendFeeling(item) {
    setFeelingInput((prev) => (prev ? `${prev}${item}、` : `${item}、`));
  }

  function appendNeed(item) {
    setNeedInput((prev) => (prev ? `${prev}${item}、` : `${item}、`));
  }

  function fillRequest(item) {
    setRequestInput(item);
  }

  function fillExample() {
    setObservationInput("她在十分鐘內提了三次對分工的不滿。");
    setFeelingInput("我有點煩躁，也有些焦慮。");
    setNeedInput("我需要專注與效率，也希望溝通有秩序。");
    setRequestInput("你願意先讓我把這一段任務做完，十分鐘後我們再討論嗎？");
  }

  function clearBuilder() {
    setObservationInput("");
    setFeelingInput("");
    setNeedInput("");
    setRequestInput("");
  }

  function handleInlineReplace(targetWord, replacement, fieldType) {
    if (!targetWord || !replacement) return;

    const replaceFirst = (value) => value.replace(targetWord, replacement);

    if (fieldType === "observation") {
      setObservationInput((prev) => replaceFirst(prev));
    }
    if (fieldType === "feeling") {
      setFeelingInput((prev) => replaceFirst(prev));
    }
    if (fieldType === "need") {
      setNeedInput((prev) => replaceFirst(prev));
    }
    if (fieldType === "request") {
      setRequestInput((prev) => replaceFirst(prev));
    }
  }

  function saveScore(nameFromAction) {
    const finalName = (nameFromAction || playerName || "匿名玩家").trim() || "匿名玩家";
    const item = {
      name: finalName,
      score: quizScore,
      total: quizItems.length,
      time: new Date().toLocaleString("zh-TW"),
    };

    const nextBoard = [...leaderboard, item]
      .sort((a, b) => b.score - a.score || a.time.localeCompare(b.time))
      .slice(0, 10);

    setLeaderboard(nextBoard);
    setPlayerName("");
  }

  function clearLeaderboard() {
    setLeaderboard([]);
    try {
      localStorage.removeItem(BOARD_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-4 text-slate-800 md:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-5 md:grid-cols-[1.35fr_0.8fr]">
          <GlassCard className="relative overflow-hidden">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-fuchsia-300/30 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-cyan-300/30 blur-3xl" />
            <div className="relative">
              <div className="mb-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1">期末展示版</span>
                <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1">互動教學系統</span>
                <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1">NVC × 遊戲化</span>
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-500 bg-clip-text text-4xl font-black leading-tight text-transparent md:text-6xl">
                非暴力溝通練習室
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                這不是單純的定義頁，而是一個讓學生透過判斷、拆解、改寫、排行榜與診斷回饋，實際學會
                <strong>觀察、感受、需要、請求</strong> 的互動教學系統。
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {[
                  ["觀察", "先描述看得見的行為，而不是貼標籤。"],
                  ["感受", "說出自己的情緒，不把判斷偽裝成感受。"],
                  ["需要", "往下看見真正重視的價值與需求。"],
                  ["請求", "提出具體、可回答、可執行的請求。"],
                ].map(([title, desc], idx) => (
                  <div key={title} className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-sm">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-500">Step 0{idx + 1}</div>
                    <div className="font-semibold text-slate-900">{title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-3 text-xl font-bold text-slate-900">系統狀態</h2>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBadge label="題目數" value={quizItems.length} tone="violet" />
              <ScoreBadge label="情境數" value={scenarios.length} tone="cyan" />
              <ScoreBadge label="判斷得分" value={quizScore} tone="emerald" />
              <ScoreBadge label="連擊數" value={bestStreak} tone="amber" />
            </div>
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-7 text-amber-900">
              <div className="font-semibold">內建自我測試</div>
              <ul className="mt-2 list-disc pl-5">
                {tests.map((t) => (
                  <li key={t.name}>{t.name}：{t.pass ? "通過" : "未通過"}</li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </section>

        <div className="grid gap-2 md:grid-cols-4">
          <TabButton active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")}>互動一｜判斷題</TabButton>
          <TabButton active={activeTab === "analyze"} onClick={() => setActiveTab("analyze")}>互動二｜拆解示例</TabButton>
          <TabButton active={activeTab === "build"} onClick={() => setActiveTab("build")}>互動三｜自己改寫</TabButton>
          <TabButton active={activeTab === "board"} onClick={() => setActiveTab("board")}>排行榜</TabButton>
        </div>

        {activeTab === "quiz" && (
          <div className="grid gap-5 md:grid-cols-[1fr_360px]">
            <GlassCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">這一句是觀察，還是評論？</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">加上倒數與連擊後，這一區更像闖關遊戲。</p>
                </div>
                <div className="rounded-2xl bg-violet-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-violet-500">進度</div>
                  <div className="text-lg font-bold text-violet-700">{Math.min(quizIndex + 1, quizItems.length)} / {quizItems.length}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <ProgressBar value={quizProgress} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">目前連擊：{streak}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">最佳連擊：{bestStreak}</span>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", roundState === "correct" ? "bg-emerald-50 text-emerald-700" : roundState === "wrong" || roundState === "timeout" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600")}>
                      {roundState === "correct" ? "本題答對" : roundState === "wrong" ? "本題答錯" : roundState === "timeout" ? "時間到" : "準備中"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TimerRing secondsLeft={secondsLeft} totalSeconds={roundSeconds} />
                  <LevelBadge streak={streak} />
                </div>
              </div>

              <div className="relative my-5 rounded-[30px] border border-white/50 bg-white/90 p-6 text-2xl leading-10 shadow-sm md:text-3xl">
                {currentQuiz.text}
                <SuccessBurst show={roundState === "correct"} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-500/20" onClick={() => answerQuiz("observation")}>這是觀察</button>
                <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50" onClick={() => answerQuiz("judgment")}>這是評論</button>
              </div>

              {quizAnswered && (
                <div className={cn("mt-5 rounded-[28px] border p-5", quizResult ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
                  <div className="text-lg font-bold">{roundState === "timeout" ? "時間到了" : quizResult ? "答對了" : "這題答錯了"}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-700">正確答案：{currentQuiz.answer === "observation" ? "觀察" : "評論"}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-700">{currentQuiz.explanation}</div>
                  <div className="mt-4">
                    {quizIndex < quizItems.length - 1 ? (
                      <button className="rounded-2xl bg-slate-900 px-4 py-2 text-white" onClick={nextQuiz}>下一題</button>
                    ) : (
                      <div className="rounded-2xl bg-white/80 p-4 text-sm leading-7 text-slate-700">你本輪得分為 {quizScore} / {quizItems.length}，可以把分數存入排行榜。</div>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold text-slate-900">闖關設定</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-700">倒數模式</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <PillButton active={timerEnabled} onClick={() => setTimerEnabled(true)}>開啟</PillButton>
                    <PillButton active={!timerEnabled} onClick={() => setTimerEnabled(false)}>關閉</PillButton>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-700">每題秒數</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[10, 15, 20, 30].map((s) => (
                      <PillButton key={s} active={roundSeconds === s} onClick={() => setRoundSeconds(s)}>{s} 秒</PillButton>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreBadge label="目前分數" value={quizScore} tone="emerald" />
                  <ScoreBadge label="連擊數" value={streak} tone="amber" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-700" onClick={resetQuiz}>重新開始</button>
                  <button className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800" onClick={() => saveScore(window.prompt("請輸入學生名稱／暱稱") || "")}>儲存到排行榜</button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === "analyze" && (
          <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
            <GlassCard>
              <h2 className="text-2xl font-bold text-slate-900">選一個教室情境</h2>
              <div className="mt-4 grid gap-3">
                {scenarios.map((s, index) => (
                  <RoleSceneCard key={s.title} scenario={s} active={selectedScenario === index} onClick={() => changeScenario(index)} />
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-slate-900">拆解成四步驟</h2>
              <div className="mt-4 rounded-[26px] border border-white/50 bg-white/80 p-5">
                <div className="flex items-start gap-4">
                  <div className={cn("flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br text-5xl ring-1", `${roleStyle.card} ${roleStyle.ring}`)}>
                    {roleStyle.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{roleStyle.badge}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{currentScenario.scene}</span>
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">情境</div>
                    <div className="mt-2 text-lg leading-8">{currentScenario.situation}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <PillButton active={revealedParts.includes("observation")} onClick={() => togglePart("observation")}>觀察</PillButton>
                <PillButton active={revealedParts.includes("feeling")} onClick={() => togglePart("feeling")}>感受</PillButton>
                <PillButton active={revealedParts.includes("need")} onClick={() => togglePart("need")}>需要</PillButton>
                <PillButton active={revealedParts.includes("request")} onClick={() => togglePart("request")}>請求</PillButton>
              </div>
              <div className="mt-4 grid gap-3">
                {revealedParts.includes("observation") && <div className="rounded-[22px] border border-dashed border-violet-200 bg-violet-50/70 p-4"><strong>觀察：</strong> {currentScenario.observation}</div>}
                {revealedParts.includes("feeling") && <div className="rounded-[22px] border border-dashed border-cyan-200 bg-cyan-50/70 p-4"><strong>感受：</strong> {currentScenario.feeling}</div>}
                {revealedParts.includes("need") && <div className="rounded-[22px] border border-dashed border-amber-200 bg-amber-50/70 p-4"><strong>需要：</strong> {currentScenario.need}</div>}
                {revealedParts.includes("request") && <div className="rounded-[22px] border border-dashed border-emerald-200 bg-emerald-50/70 p-4"><strong>請求：</strong> {currentScenario.request}</div>}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === "build" && (
          <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
            <GlassCard>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">把衝突句改寫成 NVC</h2>
                  <div className="mt-1 text-sm leading-7 text-slate-600">這一頁是展示核心：學生不只輸入，還會得到分數、診斷與優化建議。</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-700" onClick={fillExample}>載入範例</button>
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-700" onClick={clearBuilder}>清空</button>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">1. 觀察：發生了什麼？</label>
                  <textarea value={observationInput} onChange={(e) => setObservationInput(e.target.value)} className="min-h-24 w-full rounded-[22px] border border-slate-200 bg-white p-4 outline-none ring-0 transition focus:border-violet-400" placeholder="例如：她在十分鐘內提了三次對工作的不滿。" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">2. 感受：你感到什麼？</label>
                  <textarea value={feelingInput} onChange={(e) => setFeelingInput(e.target.value)} className="min-h-24 w-full rounded-[22px] border border-slate-200 bg-white p-4 outline-none transition focus:border-violet-400" placeholder="例如：我有點煩躁，也有些焦慮。" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feelingsBank.map((item) => (
                      <PillButton key={item} onClick={() => appendFeeling(item)}>{item}</PillButton>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">3. 需要：你在意什麼？</label>
                  <textarea value={needInput} onChange={(e) => setNeedInput(e.target.value)} className="min-h-24 w-full rounded-[22px] border border-slate-200 bg-white p-4 outline-none transition focus:border-violet-400" placeholder="例如：我需要專注、效率與合作秩序。" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {needsBank.map((item) => (
                      <PillButton key={item} onClick={() => appendNeed(item)}>{item}</PillButton>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">4. 請求：你希望對方怎麼做？</label>
                  <textarea value={requestInput} onChange={(e) => setRequestInput(e.target.value)} className="min-h-24 w-full rounded-[22px] border border-slate-200 bg-white p-4 outline-none transition focus:border-violet-400" placeholder="例如：你願意先讓我完成這段任務，十分鐘後再討論嗎？" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {requestBank.map((item) => (
                      <PillButton key={item} onClick={() => fillRequest(item)}>{item}</PillButton>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="space-y-5">
              <GlassCard>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">即時預覽</h2>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">NVC 分數：{nvcScore} / 10</div>
                </div>
                <div className="mt-4 min-h-[220px] whitespace-pre-line rounded-[26px] border border-white/50 bg-white/85 p-5 text-base leading-8 shadow-sm">{previewText}</div>
              </GlassCard>

              {analysisFeedback.length > 0 ? (
                <GlassCard className="border-rose-200/60 bg-rose-50/80">
                  <div className="text-lg font-bold text-rose-800">⚠️ 診斷回饋</div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-rose-900">
                    {analysisFeedback.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </GlassCard>
              ) : (
                previewText !== PLACEHOLDER_PREVIEW && (
                  <GlassCard className="border-emerald-200/60 bg-emerald-50/80">
                    <div className="text-lg font-bold text-emerald-800">✅ 結構良好</div>
                    <div className="mt-2 text-sm leading-7 text-emerald-900">這段表達已接近非暴力溝通，可以再微調語氣與具體性。</div>
                  </GlassCard>
                )
              )}

              {coachingFeedback && (
                <GlassCard>
                  <div className="text-lg font-bold text-slate-900">逐步教練回饋</div>
                  <div className="mt-3 text-sm leading-7 text-slate-700">{coachingFeedback}</div>
                </GlassCard>
              )}

              {polishedSuggestion && (
                <GlassCard>
                  <div className="text-lg font-bold text-slate-900">優化版本建議</div>
                  <div className="mt-3 whitespace-pre-line rounded-[22px] bg-slate-50 p-4 text-sm leading-7 text-slate-700">{polishedSuggestion}</div>
                </GlassCard>
              )}

              {(observationInput || feelingInput || needInput || requestInput) && (
                <GlassCard>
                  <div className="text-lg font-bold text-slate-900">錯誤標記高亮</div>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">觀察</div>
                      <HighlightedText text={observationInput} type="observation" onReplace={handleInlineReplace} />
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">感受</div>
                      <HighlightedText text={feelingInput} type="feeling" onReplace={handleInlineReplace} />
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">需要</div>
                      <HighlightedText text={needInput} type="need" onReplace={handleInlineReplace} />
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">請求</div>
                      <HighlightedText text={requestInput} type="request" onReplace={handleInlineReplace} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-800 ring-1 ring-rose-200">紅色：問題較明顯</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 ring-1 ring-amber-200">黃色：可再優化</span>
                  </div>
                </GlassCard>
              )}

              <GlassCard className="bg-slate-900 text-slate-100">
                <div className="text-lg font-bold">教師提醒</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  • 觀察不要偷塞評價，例如「她一直在抱怨」。<br />
                  • 感受不要寫成判斷，例如「我覺得他找我麻煩」。<br />
                  • 需要要往更深層價值走，例如效率、秩序、尊重。<br />
                  • 請求要可回應、可執行、最好帶有時間與行為。
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === "board" && (
          <div className="grid gap-5 md:grid-cols-[1fr_360px]">
            <GlassCard>
              <h2 className="text-2xl font-bold text-slate-900">本機排行榜</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">適合課堂競賽。可用暱稱登入；資料只保存在這台裝置的瀏覽器 localStorage。</p>
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">學生名稱／暱稱</label>
                  <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full rounded-[22px] border border-slate-200 bg-white p-4 outline-none transition focus:border-violet-400" placeholder="例如：第3組-小安" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 font-medium text-white" onClick={() => saveScore("")}>儲存目前分數</button>
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-700" onClick={clearLeaderboard}>清除排行榜</button>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-slate-900">排行榜前十名</h2>
              {leaderboard.length === 0 ? (
                <div className="mt-3 text-sm text-slate-500">目前還沒有分數紀錄。</div>
              ) : (
                <ol className="mt-4 space-y-3">
                  {leaderboard.map((item, index) => (
                    <li key={`${item.name}-${item.time}-${index}`} className="flex items-start gap-3 rounded-[22px] border border-white/50 bg-white/80 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-sm font-bold text-white">{index + 1}</div>
                      <div className="flex-1 leading-7">
                        <div><strong>{item.name}</strong> — {item.score} / {item.total}</div>
                        <div className="text-sm text-slate-500">{item.time}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
