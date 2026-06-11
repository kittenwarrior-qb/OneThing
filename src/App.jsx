import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  ScrollShadow,
  Separator,
} from "@heroui/react";
import {
  BookOpen,
  Brain,
  Check,
  Flame,
  Gift,
  ImagePlus,
  KeyRound,
  Languages,
  ListChecks,
  Moon,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  TimerReset,
  WandSparkles,
} from "lucide-react";

const STORAGE_KEY = "onething.state.v2";
const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultPaths = [
  {
    id: "coding-patterns",
    title: "Coding Interview Patterns",
    source: "Alex Xu + LeetCode 200",
    imageUrl: "",
    tone: "success",
    dailyMinutes: 70,
    toc: "Chapter 1 - Two Pointers\nChapter 2 - Sliding Window\nChapter 3 - Fast and Slow Pointers\nChapter 4 - Merge Intervals",
    lessons: [
      {
        id: "two-pointers",
        title: "Chapter 1 - Two Pointers",
        goal: "Understand why Two Pointers exists and solve one representative problem.",
        minutes: 70,
        checks: [
          "Explain why brute force becomes wasteful here.",
          "Write the invariant: what do left and right mean?",
          "Solve LeetCode 167 or 125 without reading solution first.",
          "Write one recall answer: when should I try Two Pointers?",
        ],
      },
      {
        id: "sliding-window",
        title: "Chapter 2 - Sliding Window",
        goal: "Recognize fixed vs dynamic windows and solve one small problem.",
        minutes: 70,
        checks: [
          "Explain what the window stores.",
          "Solve one easy/medium window problem.",
          "Write the shrink condition in plain language.",
        ],
      },
    ],
  },
  {
    id: "system-design",
    title: "Read System Design Patterns",
    source: "System Design Interview + notes",
    imageUrl: "",
    tone: "warning",
    dailyMinutes: 60,
    toc: "Scale From Zero To Millions\nBack-of-the-envelope Estimation\nFramework For System Design Interviews\nRate Limiter",
    lessons: [
      {
        id: "scale-zero",
        title: "Scale From Zero To Millions",
        goal: "Build a mental map for basic scaling stages.",
        minutes: 60,
        checks: [
          "Draw single server -> DB split -> cache -> load balancer.",
          "Answer: what bottleneck appears first?",
          "Write 3 tradeoffs in your own words.",
        ],
      },
    ],
  },
];

const rarityTable = [
  { rarity: "Common", weight: 58 },
  { rarity: "Rare", weight: 28 },
  { rarity: "Epic", weight: 11 },
  { rarity: "Legend", weight: 3 },
];

const cardArchetypes = [
  {
    id: "quiet-builder",
    name: "Quiet Builder",
    type: "Mindset",
    allowedRarities: ["Common", "Rare"],
    art: "Original symbolic card",
    visualPrompt: "minimal trading card art, calm builder silhouette, warm desk light, no copyrighted character",
    gradient: "from-emerald-300 via-teal-100 to-stone-100",
  },
  {
    id: "two-pointer-sensei",
    name: "Two Pointer Sensei",
    type: "Algorithm",
    allowedRarities: ["Rare", "Epic"],
    art: "Anime-inspired abstract mentor",
    visualPrompt: "original anime-inspired mentor with two glowing pointer trails, algorithm card, no existing IP",
    gradient: "from-sky-300 via-cyan-100 to-white",
  },
  {
    id: "einstein-note",
    name: "Einstein Note",
    type: "Physics",
    allowedRarities: ["Epic", "Legend"],
    art: "Science legend homage",
    visualPrompt: "abstract chalkboard physics card with wild hair silhouette, homage not portrait, no real likeness",
    gradient: "from-amber-300 via-yellow-100 to-stone-50",
  },
  {
    id: "comeback-card",
    name: "Comeback Proof",
    type: "Identity",
    allowedRarities: ["Common", "Rare", "Epic"],
    art: "Return arc card",
    visualPrompt: "heroic comeback trading card, doorway of light, original character, no existing IP",
    gradient: "from-rose-300 via-orange-100 to-white",
  },
  {
    id: "meme-energy",
    name: "Modern Reaction",
    type: "Reaction",
    allowedRarities: ["Common", "Rare"],
    art: "Original reaction card",
    visualPrompt: "modern cinematic reaction meme card, expressive original character, premium lighting, no copyrighted character, no text",
    gradient: "from-violet-300 via-fuchsia-100 to-white",
  },
  {
    id: "power-card",
    name: "Power Contract",
    type: "Heroic",
    allowedRarities: ["Rare", "Epic", "Legend"],
    art: "Original hero card",
    visualPrompt: "original superhero-inspired trading card, dramatic cape silhouette, no Marvel or DC character",
    gradient: "from-red-300 via-orange-100 to-stone-50",
  },
];

const linePacks = {
  Common: [
    { line: "Back to task.", source: "Original OneThing line", verified: true },
    { line: "Small wins compound.", source: "Original OneThing line", verified: true },
    { line: "Show up before you feel ready.", source: "Original OneThing line", verified: true },
  ],
  Rare: [
    { line: "Returned before the loop won.", source: "Original OneThing line", verified: true },
    { line: "Move with intent.", source: "Original OneThing line", verified: true },
    { line: "You do not need momentum to begin.", source: "Original OneThing line", verified: true },
  ],
  Epic: [
    { line: "Power needs practice.", source: "Original OneThing line", verified: true },
    { line: "Simplify, then verify.", source: "Original OneThing line", verified: true },
    { line: "The pattern is the reward for noticing.", source: "Original OneThing line", verified: true },
  ],
  Legend: [
    { line: "The future version of you remembers this pull.", source: "Original OneThing line", verified: true },
    { line: "A clean thought still needs evidence.", source: "Original OneThing line", verified: true },
  ],
};

const flavorPacks = {
  Mindset: [
    "You did the boring part. That is where the real edge lives.",
    "No fireworks. Just proof that you can return.",
  ],
  Algorithm: [
    "Left and right do not wander. They squeeze the problem until it tells the truth.",
    "A pattern is a shortcut you earned by paying attention.",
  ],
  Physics: [
    "Write the proof, not the vibe.",
    "The universe respects clarity. Interviews do too.",
  ],
  Identity: [
    "Missing once is data. Returning is character.",
    "This card exists because you did not negotiate with the old loop.",
  ],
  Meme: [
    "The distraction tried to be funny. You were funnier.",
    "A very serious card for a very unserious urge to procrastinate.",
  ],
  Reaction: [
    "The urge to procrastinate got caught on camera.",
    "A modern reaction for an old pattern you just beat.",
  ],
  Heroic: [
    "No origin story today. Just one completed checkbox.",
    "Great power, tiny checklist.",
  ],
};

const raritySerialPrefix = {
  Common: "C",
  Rare: "R",
  Epic: "E",
  Legend: "L",
};

const visualPacks = {
  Reaction: [
    {
      name: "chaotic sticker face",
      colors: ["#ff4fd8", "#ffe66d", "#4df5ff"],
      symbol: "!",
      mood: "chaotic gen z cartoon reaction",
    },
    {
      name: "side eye energy",
      colors: ["#7c3aed", "#22d3ee", "#f8fafc"],
      symbol: "?",
      mood: "funny side eye cartoon sticker",
    },
  ],
  Algorithm: [
    {
      name: "neon cursor loop",
      colors: ["#14f195", "#0ea5e9", "#111827"],
      symbol: "</>",
      mood: "coding neon mascot sticker",
    },
    {
      name: "window swipe",
      colors: ["#38bdf8", "#a7f3d0", "#0f172a"],
      symbol: "[]",
      mood: "sliding window cartoon interface",
    },
  ],
  Mindset: [
    {
      name: "tiny comeback",
      colors: ["#fb7185", "#fde68a", "#1f2937"],
      symbol: "UP",
      mood: "soft motivational cartoon sticker",
    },
  ],
  Identity: [
    {
      name: "return arc",
      colors: ["#f97316", "#ec4899", "#111827"],
      symbol: "↺",
      mood: "comeback arc anime sticker",
    },
  ],
  Science: [
    {
      name: "brain spark",
      colors: ["#facc15", "#60a5fa", "#111827"],
      symbol: "∑",
      mood: "science doodle sticker",
    },
  ],
  Physics: [
    {
      name: "brain spark",
      colors: ["#facc15", "#60a5fa", "#111827"],
      symbol: "∑",
      mood: "science doodle sticker",
    },
  ],
  Heroic: [
    {
      name: "main character mode",
      colors: ["#ef4444", "#f59e0b", "#111827"],
      symbol: "★",
      mood: "heroic original cartoon sticker",
    },
  ],
};

const rewardThemes = [
  {
    id: "spiderman",
    match: ["spider", "spider-man", "spiderman", "peter parker", "uncle ben"],
    name: "Responsibility Arc",
    type: "Heroic",
    line: "With great power comes responsibility.",
    flavor: "A classic hero reminder for one completed checkbox.",
    art: "Spider-Man / Uncle Ben source match",
    imageQuery: "spider man uncle ben great power responsibility gif",
  },
  {
    id: "the-boys",
    match: ["the boys", "billy butcher", "butcher", "oi oi oi"],
    name: "Oi Oi Focus",
    type: "Reaction",
    line: "Oi. Back to work.",
    flavor: "Loud energy, tiny checklist.",
    art: "The Boys reaction source match",
    imageQuery: "billy butcher the boys oi gif",
  },
  {
    id: "football",
    match: ["football", "soccer", "panini", "messi", "ronaldo", "haaland", "mbappe"],
    name: "Match Winner",
    type: "Heroic",
    line: "One more win in the book.",
    flavor: "A card-pull celebration for showing up.",
    art: "Football celebration source match",
    imageQuery: "football player celebration gif",
  },
  {
    id: "anime",
    match: ["anime", "one piece", "luffy", "naruto", "gojo", "jujutsu"],
    name: "Main Arc",
    type: "Heroic",
    line: "Training arc continues.",
    flavor: "Small episode, real progress.",
    art: "Anime training reaction source match",
    imageQuery: "anime training arc reaction gif",
  },
  {
    id: "genz",
    match: ["gen z", "genz", "meme", "reaction"],
    name: "Reaction Pull",
    type: "Reaction",
    line: "Back before the scroll won.",
    flavor: "The timeline lost this round.",
    art: "Modern reaction source match",
    imageQuery: "gen z reaction meme gif focus",
  },
];

const navTabs = [
  { key: "today", labelKey: "todayTab", icon: <ListChecks size={16} /> },
  { key: "paths", labelKey: "pathsTab", icon: <BookOpen size={16} /> },
  { key: "vault", labelKey: "vaultTab", icon: <Gift size={16} /> },
  { key: "settings", labelKey: "settingsTab", icon: <Settings size={16} /> },
];

const copy = {
  en: {
    rescue: "personal rescue system",
    todayTab: "Today",
    pathsTab: "Paths",
    vaultTab: "Vault",
    settingsTab: "Settings",
    mainQuest: "Main Quest today",
    startFocus: "Start focus",
    openGacha: "Open gacha card",
    minted: "Reward already minted",
    finishFirst: "Finish checklist first",
    askAI: "Ask OpenRouter",
    focusSession: "focus session",
    focusNote: "Use this as the launch pad. Start here, study in your real tools, then come back to tick.",
    distractionPlaceholder: "Example: wanted YouTube because the problem felt hard.",
    streak: "monthly streak",
    days: "days",
    streakHint: "A day counts only after a lesson is completed and a card is minted.",
    allowedTools: "allowed tools",
    allowedTitle: "Use the web for real study",
    addPath: "add path",
    pathTitle: "Book, course, or challenge",
    pathName: "Path name, e.g. 200 LeetCode Challenges",
    source: "Source, e.g. Alex Xu / CodingInterviewPatterns",
    cover: "Cover image URL, optional",
    toc: "Paste table of contents here.\nOne chapter/topic per line.",
    createPath: "Create path",
    vault: "gacha vault",
    collect: "Collect cards, not excuses.",
    vaultHint: "One completed lesson can mint exactly one card. Reticking today's checklist will not create another reward.",
    pull: "Pull one card",
    noPull: "No pull available",
    noCards: "No cards yet. Finish today's checklist to pull your first one.",
    collectionTitle: "Collection",
    testPull: "Test pull",
    previewOnly: "Preview only. This card is not saved.",
    previewEmpty: "Use Test pull to preview the generator before you earn a real card.",
    pipeline: "card pipeline",
    pipelineBody: "Cards now use: rarity -> locked reward theme -> GIPHY image/GIF. Pop-culture cards do not mint with sticker fallback.",
    quoteNote: "Famous quotes should come from a verified quote pack. AI-generated lines are allowed later, but must be marked unverified.",
    openrouter: "openrouter",
    taskCoach: "Task coach key",
    giphy: "giphy",
    visualSearch: "Reward visual search",
    rewardTaste: "Reward taste",
    rewardTastePlaceholder: "Spider-Man, The Boys, football cards, anime reactions, Gen Z memes...",
    testGiphy: "Test GIPHY",
    testingGiphyStatus: "Testing GIPHY media search...",
    giphyOkStatus: "GIPHY is working. Spider-Man media is available.",
    apiKey: "API key",
    model: "Model",
    keyHint: "Keys are stored only in this browser's localStorage for now. Do not use this on a shared machine.",
    backup: "backup",
    backupTitle: "Do not lose the data",
    backupHint: "LocalStorage is enough for MVP, but browser cleanup can wipe it. Export JSON after serious progress.",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    antiCheat: "A real anti-cheat system needs backend auth. This local version prevents accidental farming, not devtools tampering.",
    minting: "Minting...",
    generating: "Generating...",
    thinking: "Thinking...",
    onethingReward: "OneThing reward",
    mintingStatus: "Minting your reward card...",
    previewStatus: "Pulling a preview card...",
    previewOpenRouterStatus: "Preview card generated with OpenRouter.",
    previewFallbackStatus: "Preview card used local fallback.",
    rewardMintedStatus: "Reward minted.",
    visualFallbackStatus: "Spider-Man/celeb cards need GIPHY media. Add a GIPHY key or retry after search works; no sticker was minted.",
    addOpenRouterKeyStatus: "Add OpenRouter key in Settings first.",
    generatingTaskStatus: "Generating a stricter task...",
    cardsUnit: "cards",
  },
  vi: {
    rescue: "hệ thống cứu focus cá nhân",
    todayTab: "Hôm nay",
    pathsTab: "Lộ trình",
    vaultTab: "Kho thẻ",
    settingsTab: "Cài đặt",
    mainQuest: "Nhiệm vụ chính hôm nay",
    startFocus: "Bắt đầu focus",
    openGacha: "Mở thẻ gacha",
    minted: "Đã nhận quà rồi",
    finishFirst: "Tick xong checklist trước",
    askAI: "Hỏi OpenRouter",
    focusSession: "phiên focus",
    focusNote: "Dùng đây làm trạm xuất phát. Bắt đầu ở đây, học bằng công cụ thật, rồi quay lại tick.",
    distractionPlaceholder: "Ví dụ: muốn mở YouTube vì bài khó.",
    streak: "streak trong tháng",
    days: "ngày",
    streakHint: "Một ngày chỉ được tính sau khi hoàn thành lesson và mint thẻ.",
    allowedTools: "công cụ được phép",
    allowedTitle: "Được dùng web để học thật",
    addPath: "thêm path",
    pathTitle: "Sách, khóa học, hoặc challenge",
    pathName: "Tên path, ví dụ 200 LeetCode Challenges",
    source: "Nguồn, ví dụ Alex Xu / CodingInterviewPatterns",
    cover: "URL ảnh bìa, không bắt buộc",
    toc: "Dán mục lục ở đây.\nMỗi chương/topic một dòng.",
    createPath: "Tạo path",
    vault: "kho gacha",
    collect: "Sưu tầm thẻ, không sưu tầm lý do.",
    vaultHint: "Mỗi lesson hoàn thành chỉ mint đúng một thẻ. Tick lại checklist hôm nay không tạo thêm quà.",
    pull: "Rút một thẻ",
    noPull: "Chưa có lượt rút",
    noCards: "Chưa có thẻ. Hoàn thành checklist hôm nay để rút thẻ đầu tiên.",
    collectionTitle: "Bộ sưu tập",
    testPull: "Test rút thẻ",
    previewOnly: "Chỉ xem thử. Thẻ này không được lưu.",
    previewEmpty: "Bấm Test rút thẻ để xem generator trước khi nhận thẻ thật.",
    pipeline: "logic tạo thẻ",
    pipelineBody: "Thẻ giờ đi theo: rarity -> reward theme đã khóa -> ảnh/GIF GIPHY. Thẻ pop-culture sẽ không mint bằng sticker fallback.",
    quoteNote: "Quote người nổi tiếng nên lấy từ quote pack đã verify. Câu do AI tạo sau này phải đánh dấu là chưa kiểm chứng.",
    openrouter: "openrouter",
    taskCoach: "Key cho task coach",
    giphy: "giphy",
    visualSearch: "Tìm ảnh/GIF thẻ thưởng",
    rewardTaste: "Gu phần thưởng",
    rewardTastePlaceholder: "Spider-Man, The Boys, thẻ bóng đá, anime reaction, meme Gen Z...",
    testGiphy: "Test GIPHY",
    testingGiphyStatus: "Đang test GIPHY media search...",
    giphyOkStatus: "GIPHY chạy được. Có media Spider-Man.",
    apiKey: "API key",
    model: "Model",
    keyHint: "Key hiện chỉ lưu trong localStorage của browser này. Đừng dùng trên máy chung.",
    backup: "sao lưu",
    backupTitle: "Đừng để mất dữ liệu",
    backupHint: "LocalStorage đủ cho MVP, nhưng dọn browser có thể mất. Học nghiêm túc thì export JSON định kỳ.",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    antiCheat: "Chống ăn gian thật cần backend auth. Bản local này chống farm vô tình, không chống sửa devtools.",
    minting: "Đang mint...",
    generating: "Đang tạo...",
    thinking: "Đang nghĩ...",
    onethingReward: "Phần thưởng OneThing",
    mintingStatus: "Đang mint thẻ thưởng...",
    previewStatus: "Đang rút thử một thẻ...",
    previewOpenRouterStatus: "Thẻ preview được tạo bằng OpenRouter.",
    previewFallbackStatus: "Thẻ preview dùng fallback local.",
    rewardMintedStatus: "Đã mint thẻ thưởng.",
    visualFallbackStatus: "Thẻ Spider-Man/celeb cần media từ GIPHY. Thêm GIPHY key hoặc retry khi search chạy được; không mint sticker.",
    addOpenRouterKeyStatus: "Thêm OpenRouter key trong Cài đặt trước.",
    generatingTaskStatus: "Đang tạo task chặt hơn...",
    cardsUnit: "thẻ",
  },
};

function createDefaultState() {
  const firstLesson = defaultPaths[0].lessons[0];
  return {
    version: 2,
    settings: {
      openRouterKey: getClientApiKey("", ["VITE_OPENROUTER_KEY"]),
      openRouterModel: "openai/gpt-oss-20b:free",
      giphyKey: getClientApiKey("", ["VITE_GIPHY_KEY", "VITE_GIPHY_API_KEY"]),
      rewardTaste: "Spider-Man, superhero quotes, The Boys reactions, football card energy, anime reactions, Gen Z memes",
      dailyMinutes: 70,
      language: "en",
      theme: "light",
    },
    paths: defaultPaths,
    today: {
      date: todayKey(),
      pathId: defaultPaths[0].id,
      lessonId: firstLesson.id,
      checked: {},
      completedAt: "",
      rewardId: "",
    },
    history: {},
    collection: [],
    distractions: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2) return createDefaultState();
    parsed.settings = {
      ...createDefaultState().settings,
      ...parsed.settings,
    };
    if (parsed.settings.geminiKey && !parsed.settings.openRouterKey) {
      parsed.settings.openRouterKey = getClientApiKey("", ["VITE_OPENROUTER_KEY"]);
    }
    if (!parsed.settings.openRouterKey) {
      parsed.settings.openRouterKey = getClientApiKey("", ["VITE_OPENROUTER_KEY"]);
    }
    if (!parsed.settings.giphyKey) {
      parsed.settings.giphyKey = getClientApiKey("", ["VITE_GIPHY_KEY", "VITE_GIPHY_API_KEY"]);
    }
    if (parsed.today.date !== todayKey()) {
      return {
        ...parsed,
        today: {
          ...pickNextQuest(parsed.paths, parsed.history),
          date: todayKey(),
          checked: {},
          completedAt: "",
          rewardId: "",
        },
      };
    }
    return parsed;
  } catch {
    return createDefaultState();
  }
}

function pickNextQuest(paths, history) {
  for (const path of paths) {
    for (const lesson of path.lessons) {
      if (!history[lesson.id]?.completedAt) {
        return { pathId: path.id, lessonId: lesson.id };
      }
    }
  }
  const fallback = paths[0]?.lessons[0];
  return { pathId: paths[0]?.id || "", lessonId: fallback?.id || "" };
}

function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [state, setState] = useState(loadState);
  const [newPath, setNewPath] = useState({
    title: "",
    source: "",
    imageUrl: "",
    toc: "",
    dailyMinutes: 60,
  });
  const [aiStatus, setAiStatus] = useState("");
  const [previewCard, setPreviewCard] = useState(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const importRef = useRef(null);
  const lang = state.settings.language || "en";
  const t = copy[lang];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme || "light";
  }, [state.settings.theme]);

  const activePath = state.paths.find((path) => path.id === state.today.pathId) || state.paths[0];
  const activeLesson =
    activePath?.lessons.find((lesson) => lesson.id === state.today.lessonId) || activePath?.lessons[0];
  const checks = activeLesson?.checks || [];
  const completedCount = checks.filter((_, index) => state.today.checked[index]).length;
  const progress = checks.length ? Math.round((completedCount / checks.length) * 100) : 0;
  const isComplete = checks.length > 0 && completedCount === checks.length;
  const canClaim = isComplete && !state.today.rewardId;
  const streak = computeStreak(state.history);
  const monthDays = getMonthDays(state.history);

  const focusCopy = useMemo(() => {
    if (!activeLesson) return lang === "vi" ? "Tạo path đầu tiên trước." : "Create a path first.";
    if (isComplete) {
      return lang === "vi"
        ? "Đủ cho hôm nay. Nhận thẻ một lần rồi dừng farm app."
        : "Enough for today. Claim the card once, then stop farming the app.";
    }
    return lang === "vi"
      ? "Làm checkbox tiếp theo trong công cụ học thật, rồi quay lại tick."
      : "Do the next checkbox in your real study tool, then come back here to mark it.";
  }, [activeLesson, isComplete, lang]);

  const updateState = (updater) => setState((current) => updater(structuredClone(current)));

  const setTodayQuest = (pathId, lessonId) => {
    updateState((draft) => {
      draft.today = {
        date: todayKey(),
        pathId,
        lessonId,
        checked: {},
        completedAt: "",
        rewardId: "",
      };
      return draft;
    });
    setActiveTab("today");
  };

  const toggleCheck = (index) => {
    if (!activeLesson || state.today.rewardId) return;
    updateState((draft) => {
      draft.today.checked[index] = !draft.today.checked[index];
      return draft;
    });
  };

  const claimReward = async () => {
    if (!canClaim || !activeLesson) return;
    const alreadyCompleted = state.history[activeLesson.id]?.rewardId;
    if (alreadyCompleted) return;
    setIsPulling(true);
    setAiStatus(t.mintingStatus);
    try {
      const card = await generateCardForLesson({
        lesson: activeLesson,
        path: activePath,
        settings: state.settings,
        preview: false,
      });
      if (card.mediaRequired) {
        setAiStatus(t.visualFallbackStatus);
        setActiveTab("settings");
        return;
      }
      const mintedCard = {
        ...card,
        uid: createId("card"),
        mintedAt: new Date().toISOString(),
        sourceLessonId: activeLesson.id,
        sourceLessonTitle: activeLesson.title,
      };
      updateState((draft) => {
        draft.today.completedAt = mintedCard.mintedAt;
        draft.today.rewardId = mintedCard.uid;
        draft.history[activeLesson.id] = {
          completedAt: mintedCard.mintedAt,
          pathId: activePath.id,
          lessonTitle: activeLesson.title,
          rewardId: mintedCard.uid,
        };
        draft.collection.unshift(mintedCard);
        return draft;
      });
      setAiStatus(mintedCard.imageSource === "GIPHY GIF Search" ? t.rewardMintedStatus : t.visualFallbackStatus);
      setActiveTab("vault");
    } finally {
      setIsPulling(false);
    }
  };

  const testPullCard = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    setPreviewCard(null);
    setAiStatus(t.previewStatus);
    try {
      const card = await generateCardForLesson({
        lesson: activeLesson,
        path: activePath,
        settings: state.settings,
        preview: true,
      });
      setPreviewCard({
        ...card,
        uid: createId("preview"),
        mintedAt: new Date().toISOString(),
        sourceLessonId: activeLesson?.id || "preview",
        sourceLessonTitle: activeLesson?.title || "Preview Pull",
      });
      if (card.imageSource !== "GIPHY GIF Search") {
        setAiStatus(t.visualFallbackStatus);
      } else {
        setAiStatus(card.generatedBy?.includes("openrouter") ? t.previewOpenRouterStatus : t.previewFallbackStatus);
      }
    } finally {
      setIsPreviewing(false);
    }
  };

  const testGiphy = async () => {
    setAiStatus(t.testingGiphyStatus);
    const result = await searchGiphy(
      state.settings,
      "spider man uncle ben great power responsibility gif",
      "settings-test",
      true,
    );
    setAiStatus(result?.url ? t.giphyOkStatus : result?.error || t.visualFallbackStatus);
  };

  const addPath = () => {
    if (!newPath.title.trim()) return;
    const lessons = buildLessonsFromToc(newPath.toc, Number(newPath.dailyMinutes) || 60);
    updateState((draft) => {
      draft.paths.unshift({
        id: createId("path"),
        title: newPath.title.trim(),
        source: newPath.source.trim() || "Personal path",
        imageUrl: newPath.imageUrl.trim(),
        tone: "primary",
        dailyMinutes: Number(newPath.dailyMinutes) || 60,
        toc: newPath.toc,
        lessons,
      });
      return draft;
    });
    setNewPath({ title: "", source: "", imageUrl: "", toc: "", dailyMinutes: 60 });
  };

  const generateLessonWithOpenRouter = async () => {
    if (!state.settings.openRouterKey.trim() || !activeLesson) {
      setAiStatus(t.addOpenRouterKeyStatus);
      return;
    }
    setIsGeneratingTask(true);
    setAiStatus(t.generatingTaskStatus);
    try {
      const prompt = [
        "You are a strict but kind study coach.",
        "Return only JSON with this shape:",
        '{"goal":"...","minutes":60,"checks":["...","...","..."]}',
        "Make the checks concrete, small, and verifiable.",
        `Path: ${activePath.title}`,
        `Source: ${activePath.source}`,
        `Table of contents: ${activePath.toc}`,
        `Current lesson: ${activeLesson.title}`,
      ].join("\n");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.settings.openRouterKey.trim()}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "OneThing",
        },
        body: JSON.stringify({
          model: state.settings.openRouterModel,
          messages: [
            {
              role: "system",
              content: "You return strict JSON only. No markdown fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.35,
        }),
      });
      if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      const generated = JSON.parse(text.replace(/```json|```/g, "").trim());
      updateState((draft) => {
        const path = draft.paths.find((item) => item.id === activePath.id);
        const lesson = path.lessons.find((item) => item.id === activeLesson.id);
        lesson.goal = generated.goal || lesson.goal;
        lesson.minutes = Number(generated.minutes) || lesson.minutes;
        lesson.checks = Array.isArray(generated.checks) ? generated.checks.slice(0, 5) : lesson.checks;
        draft.today.checked = {};
        return draft;
      });
      setAiStatus("OpenRouter updated today's checklist.");
    } catch (error) {
      setAiStatus(`Could not generate: ${error.message}`);
    } finally {
      setIsGeneratingTask(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onething-backup-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.version === 2) setState(parsed);
      } catch {
        setAiStatus("Import failed. JSON is invalid.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="app-header py-3">
          <div>
            <p className="mono-label text-[var(--rust)]">{t.rescue}</p>
            <h1 className="serif-title text-3xl font-semibold leading-none sm:text-4xl">OneThing</h1>
          </div>
          <div className="quick-actions">
            <button
              className="quick-button"
              type="button"
              aria-label="Toggle theme"
              onClick={() =>
                updateState((draft) => {
                  draft.settings.theme = draft.settings.theme === "dark" ? "light" : "dark";
                  return draft;
                })
              }
            >
              {state.settings.theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="quick-button quick-button-text"
              type="button"
              aria-label="Toggle language"
              onClick={() =>
                updateState((draft) => {
                  draft.settings.language = draft.settings.language === "vi" ? "en" : "vi";
                  return draft;
                })
              }
            >
              <Languages size={16} />
              {lang === "vi" ? "VI" : "EN"}
            </button>
            <button className="gift-button" type="button" onClick={claimReward} disabled={!canClaim || isPulling}>
              {isPulling ? <span className="spinner-dot" /> : <Gift size={19} />}
              {canClaim && !isPulling && <span className="gift-badge" />}
            </button>
          </div>
        </header>

        <nav className="segmented-nav" aria-label="OneThing sections">
          {navTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={activeTab === tab.key ? "segmented-item segmented-item-active" : "segmented-item"}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              <TabTitle icon={tab.icon} label={t[tab.labelKey]} />
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
        {activeTab === "today" && (
          <MotionSection key="today" className="grid flex-1 gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <MotionCard>
            <Card className="soft-card">
              <CardContent className="gap-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Chip variant="flat" color="success" startContent={<ShieldCheck size={14} />}>
                      {t.mainQuest}
                    </Chip>
                    <h2 className="serif-title mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                      {activeLesson?.title || "Create your first path"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[var(--muted)]">{activeLesson?.goal}</p>
                  </div>
                  <div className="rounded-full bg-[var(--cream)] p-2">
                    <div className="progress-ring" style={{ "--progress": `${progress}%` }} aria-label="Daily progress">
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {checks.map((task, index) => (
                    <motion.button
                      className={`task-row ${state.today.checked[index] ? "task-row-done task-pop" : ""}`}
                      key={`${activeLesson.id}-${task}`}
                      onClick={() => toggleCheck(index)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.035 }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.992 }}
                    >
                      <Checkbox
                        isSelected={Boolean(state.today.checked[index])}
                        color="success"
                        radius="full"
                        isDisabled={Boolean(state.today.rewardId)}
                        onValueChange={() => toggleCheck(index)}
                      />
                      <span>{task}</span>
                      {state.today.checked[index] && <Check className="ml-auto text-emerald-600" size={18} />}
                    </motion.button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    color="success"
                    size="lg"
                    radius="full"
                    startContent={<TimerReset size={18} />}
                  >
                    {t.startFocus} {activeLesson?.minutes || state.settings.dailyMinutes}m
                  </Button>
                  <Button
                    size="lg"
                    radius="full"
                    variant="flat"
                    color="warning"
                    startContent={isPulling ? <SpinnerMini /> : <Sparkles size={18} />}
                    isDisabled={!canClaim || isPulling}
                    onPress={claimReward}
                  >
                    {isPulling ? t.minting : canClaim ? t.openGacha : state.today.rewardId ? t.minted : t.finishFirst}
                  </Button>
                  <Button
                    size="lg"
                    radius="full"
                    variant="flat"
                    startContent={isGeneratingTask ? <SpinnerMini /> : <WandSparkles size={18} />}
                    isDisabled={isGeneratingTask}
                    onPress={generateLessonWithOpenRouter}
                  >
                    {isGeneratingTask ? t.thinking : t.askAI}
                  </Button>
                </div>
                {aiStatus && <p className="text-sm text-[var(--muted)]">{aiStatus}</p>}
                <div className="focus-inline">
                  <div>
                    <p className="mono-label text-[var(--rust)]">{t.focusSession}</p>
                    <h3 className="text-xl font-semibold">{activeLesson?.minutes || state.settings.dailyMinutes}:00</h3>
                  </div>
                  <p>{t.focusNote} {focusCopy}</p>
                </div>
                <textarea
                  className="plain-textarea"
                  rows={2}
                  placeholder={t.distractionPlaceholder}
                  onBlur={(event) => {
                    if (!event.target.value.trim()) return;
                    updateState((draft) => {
                      draft.distractions.unshift({ at: new Date().toISOString(), text: event.target.value.trim() });
                      return draft;
                    });
                    event.target.value = "";
                  }}
                />
              </CardContent>
            </Card>
            </MotionCard>

            <aside className="grid gap-5">
              <MotionCard delay={0.08}>
              <Card className="soft-card">
                <CardContent className="gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="icon-bubble bg-orange-100 text-orange-700">
                      <Flame size={19} />
                    </div>
                    <div>
                      <p className="mono-label">{t.streak}</p>
                      <h3 className="text-2xl font-semibold">{streak} {t.days}</h3>
                    </div>
                  </div>
                  <MonthGrid days={monthDays} />
                  <p className="text-sm text-[var(--muted)]">{t.streakHint}</p>
                </CardContent>
              </Card>
              </MotionCard>

              <MotionCard delay={0.14}>
              <Card className="soft-card">
                <CardContent className="gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="icon-bubble bg-emerald-100 text-emerald-700">
                      <Brain size={19} />
                    </div>
                    <div>
                      <p className="mono-label">{t.allowedTools}</p>
                      <h3 className="text-xl font-semibold">{t.allowedTitle}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["LeetCode", "VS Code", "YouPass", "Dictionary", "Notes"].map((tool) => (
                      <Chip key={tool} variant="flat" className="bg-[var(--cream)]">
                        {tool}
                      </Chip>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </MotionCard>
            </aside>
          </MotionSection>
        )}

        {activeTab === "paths" && (
          <MotionSection key="paths" className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
            <div className="grid gap-4">
              {state.paths.map((path) => {
                const completed = path.lessons.filter((lesson) => state.history[lesson.id]?.completedAt).length;
                const percent = path.lessons.length ? Math.round((completed / path.lessons.length) * 100) : 0;
                return (
                  <MotionCard key={path.id}>
                  <Card className="soft-card">
                    <CardContent className="gap-4 p-6">
                      <div className="flex gap-4">
                        <Cover path={path} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-semibold">{path.title}</h3>
                              <p className="text-sm text-[var(--muted)]">{path.source}</p>
                            </div>
                            <Chip color={path.tone} variant="flat">
                              {percent}%
                            </Chip>
                          </div>
                          <Bar value={percent} tone={path.tone} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {path.lessons.slice(0, 4).map((lesson) => (
                          <motion.button
                            className="lesson-row"
                            key={lesson.id}
                            onClick={() => setTodayQuest(path.id, lesson.id)}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.992 }}
                          >
                            <span>{lesson.title}</span>
                            <Chip size="sm" variant="flat">
                              {state.history[lesson.id]?.completedAt ? "done" : `${lesson.minutes}m`}
                            </Chip>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  </MotionCard>
                );
              })}
            </div>

            <MotionCard delay={0.08}>
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">{t.addPath}</p>
                <h2 className="serif-title text-3xl font-semibold">{t.pathTitle}</h2>
                <input
                  className="plain-input"
                  placeholder={t.pathName}
                  value={newPath.title}
                  onChange={(event) => setNewPath({ ...newPath, title: event.target.value })}
                />
                <input
                  className="plain-input"
                  placeholder={t.source}
                  value={newPath.source}
                  onChange={(event) => setNewPath({ ...newPath, source: event.target.value })}
                />
                <input
                  className="plain-input"
                  placeholder={t.cover}
                  value={newPath.imageUrl}
                  onChange={(event) => setNewPath({ ...newPath, imageUrl: event.target.value })}
                />
                <textarea
                  className="plain-textarea"
                  rows={8}
                  placeholder={t.toc}
                  value={newPath.toc}
                  onChange={(event) => setNewPath({ ...newPath, toc: event.target.value })}
                />
                <Button color="success" radius="full" startContent={<Plus size={17} />} onPress={addPath}>
                  {t.createPath}
                </Button>
              </CardContent>
            </Card>
            </MotionCard>
          </MotionSection>
        )}

        {activeTab === "vault" && (
          <MotionSection key="vault" className="vault-page">
            <MotionCard>
            <Card className="soft-card vault-hero">
              <CardContent className="vault-hero-content p-6">
                <div className="vault-copy">
                  <p className="mono-label text-[var(--rust)]">{t.vault}</p>
                  <h2 className="serif-title text-4xl font-semibold">{t.collect}</h2>
                  <p className="text-[var(--muted)]">{t.vaultHint}</p>
                  <div className="vault-actions">
                    <Button
                      color="warning"
                      radius="full"
                      startContent={isPulling ? <SpinnerMini /> : <Sparkles size={18} />}
                      isDisabled={!canClaim || isPulling}
                      onPress={claimReward}
                    >
                      {isPulling ? t.minting : canClaim ? t.pull : t.noPull}
                    </Button>
                    <Button
                      radius="full"
                      variant="flat"
                      startContent={isPreviewing ? <SpinnerMini /> : <Gift size={18} />}
                      isDisabled={isPreviewing}
                      onPress={testPullCard}
                    >
                      {isPreviewing ? t.generating : t.testPull}
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <p className="mono-label">{t.pipeline}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{t.pipelineBody}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{t.quoteNote}</p>
                  </div>
                </div>

                <div className="vault-preview">
                  <p className="mono-label">{t.previewOnly}</p>
                  <div className="vault-preview-frame">
                    <AnimatePresence mode="wait">
                      {isPreviewing ? (
                        <CardSkeleton key="preview-loading" />
                      ) : previewCard ? (
                        <CollectibleCard card={previewCard} key={previewCard.uid} rewardLabel={t.onethingReward} />
                      ) : (
                        <motion.p
                          key="preview-empty"
                          className="text-sm text-[var(--muted)]"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          {t.previewEmpty}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
            </MotionCard>

            <section className="collection-section">
              <div className="collection-header">
                <div>
                  <p className="mono-label text-[var(--rust)]">{t.collectionTitle}</p>
                  <h3 className="serif-title text-3xl font-semibold">{state.collection.length} {t.cardsUnit}</h3>
                </div>
              </div>
              <div className="collection-grid">
                {state.collection.length === 0 && (
                  <Card className="soft-card empty-collection">
                    <CardContent className="p-6">
                      <p className="text-[var(--muted)]">{t.noCards}</p>
                    </CardContent>
                  </Card>
                )}
                {state.collection.map((card) => (
                  <CollectibleCard card={card} key={card.uid} rewardLabel={t.onethingReward} />
                ))}
              </div>
            </section>
          </MotionSection>
        )}

        {activeTab === "settings" && (
          <MotionSection key="settings" className="grid gap-5 lg:grid-cols-2">
            <MotionCard>
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">{t.openrouter}</p>
                <h2 className="serif-title text-3xl font-semibold">{t.taskCoach}</h2>
                <label className="field-label">{t.apiKey}</label>
                <input
                  className="plain-input"
                  type="password"
                  placeholder="Paste OpenRouter API key"
                  value={state.settings.openRouterKey}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.openRouterKey = event.target.value;
                      return draft;
                    })
                  }
                />
                <label className="field-label">{t.model}</label>
                <input
                  className="plain-input"
                  value={state.settings.openRouterModel}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.openRouterModel = event.target.value;
                      return draft;
                    })
                  }
                />
                <Separator />
                <p className="mono-label text-[var(--rust)]">{t.giphy}</p>
                <h2 className="serif-title text-3xl font-semibold">{t.visualSearch}</h2>
                <label className="field-label">{t.apiKey}</label>
                <input
                  className="plain-input"
                  type="password"
                  placeholder="Paste GIPHY API key"
                  value={state.settings.giphyKey}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.giphyKey = event.target.value;
                      return draft;
                    })
                  }
                />
                <label className="field-label">{t.rewardTaste}</label>
                <textarea
                  className="plain-textarea"
                  rows={4}
                  placeholder={t.rewardTastePlaceholder}
                  value={state.settings.rewardTaste}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.rewardTaste = event.target.value;
                      return draft;
                    })
                  }
                />
                <Button radius="full" variant="flat" startContent={<ImagePlus size={17} />} onPress={testGiphy}>
                  {t.testGiphy}
                </Button>
                <p className="text-sm text-[var(--muted)]">
                  {t.keyHint}
                </p>
              </CardContent>
            </Card>
            </MotionCard>

            <MotionCard delay={0.08}>
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">{t.backup}</p>
                <h2 className="serif-title text-3xl font-semibold">{t.backupTitle}</h2>
                <p className="text-[var(--muted)]">{t.backupHint}</p>
                <div className="flex flex-wrap gap-3">
                  <Button color="success" radius="full" startContent={<Save size={17} />} onPress={exportJson}>
                    {t.exportJson}
                  </Button>
                  <Button radius="full" variant="flat" startContent={<ImagePlus size={17} />} onPress={() => importRef.current?.click()}>
                    {t.importJson}
                  </Button>
                </div>
                <input ref={importRef} type="file" accept="application/json" hidden onChange={importJson} />
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="icon-bubble bg-stone-100 text-stone-700">
                    <KeyRound size={19} />
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {t.antiCheat}
                  </p>
                </div>
              </CardContent>
            </Card>
            </MotionCard>
          </MotionSection>
        )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function TabTitle({ icon, label }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {label}
    </span>
  );
}

function MotionSection({ children, className }) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function MotionCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SpinnerMini() {
  return <span className="spinner-dot" aria-hidden="true" />;
}

function CardSkeleton() {
  return (
    <motion.div
      className="card-skeleton"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-skeleton-top" />
      <div className="card-skeleton-art" />
      <div className="card-skeleton-title" />
    </motion.div>
  );
}

function Cover({ path }) {
  if (path.imageUrl) {
    return <img className="path-cover" src={path.imageUrl} alt="" />;
  }
  return (
    <div className="path-cover path-cover-empty">
      <BookOpen size={24} />
    </div>
  );
}

function CollectibleCard({ card, rewardLabel = "OneThing reward" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = card.imageUrl && !imageFailed;
  const missingMedia = card.mediaRequired || card.imageSource === "Missing GIPHY media";

  return (
    <motion.article
      className="collect-card"
      data-rarity={card.rarity}
      data-visual-source={missingMedia ? "missing" : card.imageSource === "OneThing sticker pack" ? "sticker" : "media"}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, rotateX: 1.2, rotateY: -1.2 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="collect-bg">
        {showImage && <img src={card.imageUrl} alt="" onError={() => setImageFailed(true)} />}
      </div>
      <div className="collect-card-top">
        <span>{card.serial || card.rarity}</span>
        <span>{card.rarity}</span>
      </div>
      <div className="collect-card-art">
        {showImage ? (
          <motion.img
            className="collect-card-image"
            src={card.imageUrl}
            alt={card.imageName || card.name}
            onError={() => setImageFailed(true)}
            initial={{ scale: 1.04, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ) : missingMedia ? (
          <div className="collect-missing-art">
            <ImagePlus size={34} />
            <strong>Needs GIPHY media</strong>
            <span>{card.imageQuery}</span>
            {card.imageError && <em>{card.imageError}</em>}
          </div>
        ) : (
          <div className="collect-fallback-art">
            <Sparkles size={42} />
          </div>
        )}
        <motion.div
          className="collect-quote"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.26 }}
        >
          <span>{card.line}</span>
        </motion.div>
      </div>
      <div className="collect-title-strip">
        <h3>{card.name}</h3>
        <p>{card.type} / {card.imageName || card.art}</p>
      </div>
      <div className="collect-card-foot">{rewardLabel}</div>
    </motion.article>
  );
}

function Bar({ value, tone = "primary" }) {
  return (
    <div className="bar-track" data-tone={tone}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function MonthGrid({ days }) {
  return (
    <div className="month-grid" aria-label="Monthly streak">
      {days.map((day) => (
        <div className={day.completed ? "month-day month-day-done" : "month-day"} key={day.key}>
          <span>{day.day}</span>
        </div>
      ))}
    </div>
  );
}

function buildLessonsFromToc(toc, minutes) {
  const lines = toc
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const source = lines.length ? lines : ["First lesson"];
  return source.map((line, index) => ({
    id: createId(`lesson-${index}`),
    title: line,
    goal: `Study ${line} with one concrete output.`,
    minutes,
    checks: [
      "Explain why this topic exists in your own words.",
      "Do one example, exercise, or LeetCode-style problem.",
      "Answer one recall question without looking at notes.",
    ],
  }));
}

function computeStreak(history) {
  const days = new Set(Object.values(history).map((item) => item.completedAt?.slice(0, 10)).filter(Boolean));
  let count = 0;
  const cursor = new Date(`${todayKey()}T00:00:00`);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function getMonthDays(history) {
  const completedDays = new Set(Object.values(history).map((item) => item.completedAt?.slice(0, 10)).filter(Boolean));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: total }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = date.toISOString().slice(0, 10);
    return { key, day: index + 1, completed: completedDays.has(key) };
  });
}

async function generateCardForLesson({ lesson, path, settings, preview }) {
  const localCard = drawCard();
  const rewardTheme = pickRewardTheme(settings, localCard.serial);
  const themedLocalCard = rewardTheme ? applyRewardTheme(localCard, rewardTheme) : localCard;
  const fallbackVisual = pickVisualForType(themedLocalCard.type, themedLocalCard.serial);
  const fallbackImagePrompt = enhanceCardImagePrompt(fallbackVisual.mood, themedLocalCard.line);
  const fallbackImageQuery = buildFallbackImageQuery(themedLocalCard, lesson, path, settings, rewardTheme);
  const fallback = {
    ...themedLocalCard,
    imageUrl: buildStickerDataUrl(fallbackVisual, localCard.rarity, localCard.serial),
    imageName: fallbackVisual.name,
    imageSource: "OneThing sticker pack",
    imageQuery: fallbackImageQuery,
    visualPrompt: fallbackImagePrompt,
    generatedBy: "local",
  };

  if (!settings.openRouterKey?.trim()) {
    return applyGiphyVisual(fallback, settings, fallbackImageQuery);
  }

  try {
    const prompt = [
      "Create one collectible study reward card recipe.",
      "Return strict JSON only with this shape:",
      '{"name":"...","type":"Reaction|Algorithm|Mindset|Heroic|Science","line":"short punchy line","flavor":"1 sentence flavor text","art":"short art tag","imageQuery":"search query for a matching GIF or meme image","visualPrompt":"fallback sticker mood","verified":false}',
      "The card can be meme-ish, cool, philosophical, anime-inspired, or pop-culture aware.",
      "Do not generate an image. Create a precise imageQuery for finding an existing GIF/image.",
      "If you use a famous quote or catchphrase, the imageQuery must match the speaker/source. Example: line about great power -> imageQuery should mention spider man uncle ben responsibility.",
      "Prefer widely understandable modern reaction, anime, superhero, football, or Gen Z meme references.",
      "Keep it suitable for a personal study app.",
      `Current path: ${path?.title || "Unknown"}`,
      `Current lesson: ${lesson?.title || "Preview"}`,
      `Lesson goal: ${lesson?.goal || ""}`,
      `User reward taste: ${settings.rewardTaste || "Gen Z memes, anime reactions, superheroes, football cards"}`,
      rewardTheme
        ? `Selected locked visual theme: ${rewardTheme.name}. Use this exact source family. Required imageQuery: ${rewardTheme.imageQuery}. Required quote direction: ${rewardTheme.line}.`
        : "No locked visual theme was selected.",
      "Keep line short because it overlays on the image. Avoid long explanations.",
      preview ? "This is a preview pull, not a real reward." : "This is an earned reward.",
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.openRouterKey.trim()}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "OneThing",
      },
      body: JSON.stringify({
        model: settings.openRouterModel,
        messages: [
          { role: "system", content: "You return strict JSON only. No markdown fences." },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const recipe = JSON.parse(text.replace(/```json|```/g, "").trim());

    const cardType = rewardTheme ? rewardTheme.type : normalizeCardType(recipe.type || fallback.type);
    const visual = pickVisualForType(cardType, `${fallback.serial}-${recipe.name || ""}-${recipe.line || ""}`);
    const visualPrompt = enhanceCardImagePrompt(
      String(recipe.visualPrompt || fallback.visualPrompt).slice(0, 220),
      String(rewardTheme?.line || recipe.line || fallback.line).slice(0, 90),
    );

    const generatedCard = {
      ...fallback,
      name: String(rewardTheme?.name || recipe.name || fallback.name).slice(0, 42),
      type: cardType,
      art: String(rewardTheme?.art || recipe.art || fallback.art).slice(0, 56),
      line: String(rewardTheme?.line || recipe.line || fallback.line).slice(0, 90),
      flavor: String(rewardTheme?.flavor || recipe.flavor || fallback.flavor).slice(0, 180),
      visualPrompt,
      imageQuery: String(rewardTheme?.imageQuery || recipe.imageQuery || fallback.imageQuery).slice(0, 140),
      imageUrl: buildStickerDataUrl(visual, fallback.rarity, fallback.serial),
      imageName: visual.name,
      imageSource: "OneThing sticker pack",
      verified: Boolean(recipe.verified),
      lineSource: recipe.verified ? "OpenRouter generated, marked verified" : "OpenRouter generated, unverified",
      generatedBy: "openrouter",
    };

    return applyGiphyVisual(generatedCard, settings, generatedCard.imageQuery);
  } catch {
    return applyGiphyVisual(fallback, settings, fallbackImageQuery);
  }
}

async function applyGiphyVisual(card, settings, query) {
  const giphy = await searchGiphy(settings, query, card.serial, Boolean(card.pipeline?.themeSource));
  if (!giphy?.url && card.pipeline?.themeSource) {
    return {
      ...card,
      imageUrl: "",
      imageName: "Needs GIPHY media",
      imageSource: "Missing GIPHY media",
      imageQuery: query,
      imageError: giphy?.error || "GIPHY search did not return media.",
      mediaRequired: true,
    };
  }
  if (!giphy?.url) return card;
  return {
    ...card,
    imageUrl: giphy.url,
    imageName: giphy.title || card.imageName,
    imageSource: "GIPHY GIF Search",
    imageQuery: query,
    generatedBy: card.generatedBy === "openrouter" ? "openrouter+giphy" : "giphy",
  };
}

async function searchGiphy(settings, query, seedSource, preferTopResult = false) {
  const apiKey = getClientApiKey(settings.giphyKey, ["VITE_GIPHY_KEY", "VITE_GIPHY_API_KEY"]);
  if (!apiKey) return { error: "Missing GIPHY key in Settings or VITE_GIPHY_KEY." };
  if (!query?.trim()) return { error: "Missing image query." };

  try {
    const results = [];
    const queries = buildGiphyQueryVariants(query);
    for (const itemQuery of queries) {
      const url = new URL("https://api.giphy.com/v1/gifs/search");
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("q", itemQuery);
      url.searchParams.set("limit", "12");
      url.searchParams.set("rating", "pg-13");
      url.searchParams.set("lang", "en");

      const response = await fetch(url);
      if (!response.ok) return { error: `GIPHY HTTP ${response.status}. Check that the key is valid.` };
      const data = await response.json();
      const found = Array.isArray(data.data) ? data.data.filter((item) => item?.images) : [];
      if (found.length) {
        results.push(...found);
        break;
      }
    }

    if (!results.length) return { error: `No GIPHY results for "${query}".` };

    const index = preferTopResult ? 0 : hashSeed(String(seedSource || query)) % Math.min(results.length, 8);
    const item = results[index];
    const image =
      item.images.downsized_large?.url ||
      item.images.downsized_medium?.url ||
      item.images.original?.webp ||
      item.images.original?.url;
    if (!image) return { error: "GIPHY result had no usable image URL." };

    return {
      url: image,
      title: String(item.title || query).replace(/\s*GIF$/i, "").slice(0, 56),
    };
  } catch {
    return { error: "GIPHY request failed. Check network/CORS/key." };
  }
}

function getClientApiKey(settingValue, envNames) {
  const settingKey = String(settingValue || "").trim();
  if (settingKey) return settingKey;
  for (const envName of envNames) {
    const envKey = String(import.meta.env?.[envName] || "").trim();
    if (envKey) return envKey;
  }
  return "";
}

function buildGiphyQueryVariants(query) {
  const clean = String(query || "").trim();
  const variants = [clean];
  if (/spider[\s-]?man|uncle ben/i.test(clean)) {
    variants.push("spider man responsibility gif", "spiderman uncle ben gif", "spider man quote gif");
  }
  if (/billy butcher|the boys|oi/i.test(clean)) {
    variants.push("billy butcher gif", "the boys butcher reaction gif");
  }
  return [...new Set(variants.filter(Boolean))];
}

function pickRewardTheme(settings, seedSource) {
  const taste = String(settings.rewardTaste || "").toLowerCase();
  const matches = rewardThemes.filter((theme) => theme.match.some((token) => taste.includes(token)));
  if (!matches.length) return null;
  return matches[hashSeed(String(seedSource || taste)) % matches.length];
}

function applyRewardTheme(card, theme) {
  return {
    ...card,
    id: theme.id,
    name: theme.name,
    type: theme.type,
    art: theme.art,
    line: theme.line,
    lineSource: `Locked ${theme.name} theme`,
    verified: true,
    flavor: theme.flavor,
    visualPrompt: theme.art,
    imageQuery: theme.imageQuery,
    pipeline: {
      ...card.pipeline,
      themeSource: "locked reward taste",
      imageQuerySource: theme.imageQuery,
    },
  };
}

function buildFallbackImageQuery(card, lesson, path, settings = {}, rewardTheme = null) {
  if (rewardTheme?.imageQuery) return rewardTheme.imageQuery;
  return [
    settings.rewardTaste,
    card.type,
    card.line,
    lesson?.title && "study win",
    path?.title && "reaction",
    "reaction gif meme",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 140);
}

function enhanceCardImagePrompt(prompt, line) {
  return [
    prompt,
    "personal OneThing cartoon reward sticker",
    "modern gen z colors, bold readable shape, no random landscape photo",
    "no blank white area, no watermark",
    `mood inspired by: ${line}`,
  ].join(", ");
}

function normalizeCardType(type) {
  const normalized = String(type || "").trim();
  if (normalized === "Meme") return "Reaction";
  return visualPacks[normalized] ? normalized : "Mindset";
}

function pickVisualForType(type, seedSource) {
  const pack = visualPacks[normalizeCardType(type)] || visualPacks.Mindset;
  const seed = hashSeed(String(seedSource || type || "onething"));
  return pack[seed % pack.length];
}

function buildStickerDataUrl(visual, rarity, seedSource) {
  const seed = hashSeed(String(seedSource || visual.name));
  const [primary, accent, ink] = visual.colors;
  const tilt = (seed % 13) - 6;
  const eyeShift = (seed % 9) - 4;
  const rarityGlow = {
    Common: "#d7d0c5",
    Rare: "#50f2bf",
    Epic: "#c084fc",
    Legend: "#fbbf24",
  }[rarity] || "#d7d0c5";
  const title = escapeSvgText(visual.name.toUpperCase());
  const symbol = escapeSvgText(visual.symbol);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 1024">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="0.52" stop-color="${accent}"/>
          <stop offset="1" stop-color="${ink}"/>
        </linearGradient>
        <radialGradient id="shine" cx="36%" cy="22%" r="72%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.88"/>
          <stop offset="0.34" stop-color="#ffffff" stop-opacity="0.2"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="26" stdDeviation="18" flood-color="#000000" flood-opacity="0.28"/>
        </filter>
        <pattern id="dots" width="42" height="42" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.2" fill="#ffffff" opacity="0.22"/>
        </pattern>
      </defs>
      <rect width="768" height="1024" fill="url(#bg)"/>
      <rect width="768" height="1024" fill="url(#dots)" opacity="0.52"/>
      <circle cx="144" cy="128" r="176" fill="#ffffff" opacity="0.18"/>
      <circle cx="666" cy="262" r="212" fill="#000000" opacity="0.16"/>
      <circle cx="624" cy="846" r="260" fill="${rarityGlow}" opacity="0.2"/>
      <g transform="translate(84 88) scale(0.78)">
      <g filter="url(#shadow)" transform="rotate(${tilt} 384 472)">
        <path d="M168 248 C166 178 224 126 302 146 C342 72 468 76 500 160 C594 152 652 220 624 306 C700 354 680 470 596 494 C606 584 520 646 444 600 C386 676 268 640 268 546 C176 538 126 456 176 382 C126 332 126 274 168 248 Z" fill="#fffdf8"/>
        <path d="M188 268 C188 210 238 168 310 184 C350 118 452 122 482 188 C564 182 610 238 588 310 C652 350 634 444 562 464 C570 540 500 592 438 552 C386 616 292 586 290 510 C214 500 174 434 214 376 C174 334 176 292 188 268 Z" fill="#111827" opacity="0.08"/>
        <ellipse cx="318" cy="382" rx="36" ry="46" fill="#111827"/>
        <ellipse cx="${450 + eyeShift}" cy="382" rx="36" ry="46" fill="#111827"/>
        <circle cx="330" cy="366" r="10" fill="#ffffff"/>
        <circle cx="${462 + eyeShift}" cy="366" r="10" fill="#ffffff"/>
        <path d="M332 482 C370 522 426 522 468 482" fill="none" stroke="#111827" stroke-width="20" stroke-linecap="round"/>
        <text x="384" y="284" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900" fill="#111827">${symbol}</text>
      </g>
      </g>
      <rect x="58" y="822" width="652" height="118" rx="34" fill="#070707" opacity="0.72"/>
      <text x="384" y="872" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="900" fill="#fffdf8">${title}</text>
      <text x="384" y="912" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700" fill="#fffdf8" opacity="0.72">PERSONAL STICKER VISUAL</text>
      <rect width="768" height="1024" fill="url(#shine)"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function drawCard() {
  const rarity = weightedPick(rarityTable).rarity;
  const archetype = pickOne(cardArchetypes.filter((card) => card.allowedRarities.includes(rarity))) || cardArchetypes[0];
  const line = pickOne(linePacks[rarity]) || linePacks.Common[0];
  const flavor = pickOne(flavorPacks[archetype.type]) || "You completed the task, so this card exists.";
  return {
    id: `${archetype.id}-${rarity.toLowerCase()}`,
    name: archetype.name,
    rarity,
    type: archetype.type,
    art: archetype.art,
    visualPrompt: archetype.visualPrompt,
    line: line.line,
    lineSource: line.source,
    verified: line.verified,
    flavor,
    gradient: archetype.gradient,
    serial: createSerial(rarity),
    pipeline: {
      raritySource: "weighted local roll",
      archetypeSource: "local archetype pack",
      lineSource: line.source,
      flavorSource: "local flavor pack",
      artSource: "local prompt, no image API",
    },
  };
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[0];
}

function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createSerial(rarity) {
  const prefix = raritySerialPrefix[rarity] || "C";
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const roll = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${stamp}-${roll}`;
}

function hashSeed(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export default App;
