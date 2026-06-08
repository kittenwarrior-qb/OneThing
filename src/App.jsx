import React, { useEffect, useMemo, useRef, useState } from "react";
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
    name: "Oi Oi Oi",
    type: "Meme",
    allowedRarities: ["Common", "Rare"],
    art: "Meme energy card",
    visualPrompt: "absurd original meme card, bold reaction pose, playful, no copyrighted meme image",
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

const navTabs = [
  { key: "today", label: "Today", icon: <ListChecks size={16} /> },
  { key: "paths", label: "Paths", icon: <BookOpen size={16} /> },
  { key: "vault", label: "Vault", icon: <Gift size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const copy = {
  en: {
    rescue: "personal rescue system",
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
    testPull: "Test pull",
    previewOnly: "Preview only. This card is not saved.",
    previewEmpty: "Use Test pull to preview the generator before you earn a real card.",
    pipeline: "card pipeline",
    pipelineBody: "Current cards are assembled locally: weighted rarity -> matching archetype -> verified OneThing line -> flavor text -> art prompt. No meme image API is called yet.",
    quoteNote: "Famous quotes should come from a verified quote pack. AI-generated lines are allowed later, but must be marked unverified.",
    openrouter: "openrouter",
    taskCoach: "Task coach key",
    apiKey: "API key",
    model: "Model",
    keyHint: "Key is stored only in this browser's localStorage for now. Do not use this on a shared machine.",
    backup: "backup",
    backupTitle: "Do not lose the data",
    backupHint: "LocalStorage is enough for MVP, but browser cleanup can wipe it. Export JSON after serious progress.",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    antiCheat: "A real anti-cheat system needs backend auth. This local version prevents accidental farming, not devtools tampering.",
  },
  vi: {
    rescue: "hệ thống cứu focus cá nhân",
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
    testPull: "Test rút thẻ",
    previewOnly: "Chỉ xem thử. Thẻ này không được lưu.",
    previewEmpty: "Bấm Test rút thẻ để xem generator trước khi nhận thẻ thật.",
    pipeline: "logic tạo thẻ",
    pipelineBody: "Hiện tại thẻ được lắp local: roll rarity theo tỉ lệ -> chọn archetype hợp rarity -> lấy câu OneThing đã verify -> flavor text -> art prompt. Chưa call API lấy hình meme.",
    quoteNote: "Quote người nổi tiếng nên lấy từ quote pack đã verify. Câu do AI tạo sau này phải đánh dấu là chưa kiểm chứng.",
    openrouter: "openrouter",
    taskCoach: "Key cho task coach",
    apiKey: "API key",
    model: "Model",
    keyHint: "Key hiện chỉ lưu trong localStorage của browser này. Đừng dùng trên máy chung.",
    backup: "sao lưu",
    backupTitle: "Đừng để mất dữ liệu",
    backupHint: "LocalStorage đủ cho MVP, nhưng dọn browser có thể mất. Học nghiêm túc thì export JSON định kỳ.",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    antiCheat: "Chống ăn gian thật cần backend auth. Bản local này chống farm vô tình, không chống sửa devtools.",
  },
};

function createDefaultState() {
  const firstLesson = defaultPaths[0].lessons[0];
  return {
    version: 2,
    settings: {
      openRouterKey: "",
      openRouterModel: "openai/gpt-oss-20b:free",
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
      parsed.settings.openRouterKey = "";
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
    const card = await generateCardForLesson({
      lesson: activeLesson,
      path: activePath,
      settings: state.settings,
      preview: false,
    });
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
    setActiveTab("vault");
  };

  const testPullCard = async () => {
    setAiStatus("Pulling a preview card...");
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
    setAiStatus(card.generatedBy === "openrouter" ? "Preview card generated with OpenRouter." : "Preview card used local fallback.");
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
      setAiStatus("Add OpenRouter key in Settings first.");
      return;
    }
    setAiStatus("Generating a stricter task...");
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
            <button className="gift-button" type="button" onClick={claimReward} disabled={!canClaim}>
              <Gift size={19} />
              {canClaim && <span />}
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
              <TabTitle icon={tab.icon} label={tab.label} />
            </button>
          ))}
        </nav>

        {activeTab === "today" && (
          <section className="grid flex-1 gap-5 lg:grid-cols-[1.25fr_.75fr]">
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
                    <button
                      className={`task-row ${state.today.checked[index] ? "task-row-done task-pop" : ""}`}
                      key={`${activeLesson.id}-${task}`}
                      onClick={() => toggleCheck(index)}
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
                    </button>
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
                    startContent={<Sparkles size={18} />}
                    isDisabled={!canClaim}
                    onPress={claimReward}
                  >
                    {canClaim ? t.openGacha : state.today.rewardId ? t.minted : t.finishFirst}
                  </Button>
                  <Button
                    size="lg"
                    radius="full"
                    variant="flat"
                    startContent={<WandSparkles size={18} />}
                    onPress={generateLessonWithOpenRouter}
                  >
                    {t.askAI}
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

            <aside className="grid gap-5">
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
            </aside>
          </section>
        )}

        {activeTab === "paths" && (
          <section className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
            <div className="grid gap-4">
              {state.paths.map((path) => {
                const completed = path.lessons.filter((lesson) => state.history[lesson.id]?.completedAt).length;
                const percent = path.lessons.length ? Math.round((completed / path.lessons.length) * 100) : 0;
                return (
                  <Card className="soft-card" key={path.id}>
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
                          <button
                            className="lesson-row"
                            key={lesson.id}
                            onClick={() => setTodayQuest(path.id, lesson.id)}
                          >
                            <span>{lesson.title}</span>
                            <Chip size="sm" variant="flat">
                              {state.history[lesson.id]?.completedAt ? "done" : `${lesson.minutes}m`}
                            </Chip>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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
          </section>
        )}

        {activeTab === "vault" && (
          <section className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">{t.vault}</p>
                <h2 className="serif-title text-4xl font-semibold">{t.collect}</h2>
                <p className="text-[var(--muted)]">{t.vaultHint}</p>
                <Button
                  color="warning"
                  radius="full"
                  startContent={<Sparkles size={18} />}
                  isDisabled={!canClaim}
                  onPress={claimReward}
                >
                  {canClaim ? t.pull : t.noPull}
                </Button>
                <Button radius="full" variant="flat" startContent={<Gift size={18} />} onPress={testPullCard}>
                  {t.testPull}
                </Button>
                <Separator />
                <div>
                  <p className="mono-label">{t.pipeline}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{t.pipelineBody}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{t.quoteNote}</p>
                </div>
                <Separator />
                <div className="grid gap-3">
                  <p className="mono-label">{t.previewOnly}</p>
                  {previewCard ? (
                    <CollectibleCard card={previewCard} />
                  ) : (
                    <p className="text-sm text-[var(--muted)]">{t.previewEmpty}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <ScrollShadow className="max-h-[620px]">
              <div className="grid gap-4 sm:grid-cols-2">
                {state.collection.length === 0 && (
                  <Card className="soft-card">
                    <CardContent className="p-6">
                      <p className="text-[var(--muted)]">{t.noCards}</p>
                    </CardContent>
                  </Card>
                )}
                {state.collection.map((card) => (
                  <CollectibleCard card={card} key={card.uid} />
                ))}
              </div>
            </ScrollShadow>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="grid gap-5 lg:grid-cols-2">
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
                <p className="text-sm text-[var(--muted)]">
                  {t.keyHint}
                </p>
              </CardContent>
            </Card>

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
          </section>
        )}
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

function CollectibleCard({ card }) {
  return (
    <article className={`collect-card bg-gradient-to-br ${card.gradient}`}>
      <div className="collect-card-top">
        <span>{card.serial || card.rarity}</span>
        <span>{card.rarity}</span>
      </div>
      <div className="collect-card-art">
        {card.imageUrl ? (
          <>
            <img className="collect-card-backdrop" src={card.imageUrl} alt="" />
            <img className="collect-card-image" src={card.imageUrl} alt={card.imageName || card.name} />
          </>
        ) : (
          <Sparkles size={38} />
        )}
        <div className="collect-quote">
          <span>{card.line}</span>
        </div>
      </div>
      <div className="collect-title-strip">
        <h3>{card.name}</h3>
        <p>{card.type} · {card.imageName || card.art}</p>
      </div>
      <div className="collect-card-foot">from {card.sourceLessonTitle}</div>
    </article>
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
  const memeImage = await fetchMemeImage();
  const fallback = {
    ...localCard,
    imageUrl: memeImage?.url || "",
    imageName: memeImage?.name || "",
    imageSource: memeImage ? "Imgflip meme template API" : "No image source",
    generatedBy: "local",
  };

  if (!settings.openRouterKey?.trim()) return fallback;

  try {
    const prompt = [
      "Create one collectible study reward card recipe.",
      "Return strict JSON only with this shape:",
      '{"name":"...","type":"Meme|Algorithm|Mindset|Heroic|Science","line":"short punchy line","flavor":"1 sentence flavor text","art":"short art tag","visualPrompt":"image prompt, no copyrighted characters","verified":false}',
      "The card can be meme-ish, cool, philosophical, or anime-inspired, but do not claim a famous quote unless you provide exact source. Prefer original lines.",
      "Keep it suitable for a personal study app.",
      `Current path: ${path?.title || "Unknown"}`,
      `Current lesson: ${lesson?.title || "Preview"}`,
      `Lesson goal: ${lesson?.goal || ""}`,
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

    return {
      ...fallback,
      name: String(recipe.name || fallback.name).slice(0, 42),
      type: String(recipe.type || fallback.type).slice(0, 18),
      art: String(recipe.art || fallback.art).slice(0, 56),
      line: String(recipe.line || fallback.line).slice(0, 90),
      flavor: String(recipe.flavor || fallback.flavor).slice(0, 180),
      visualPrompt: String(recipe.visualPrompt || fallback.visualPrompt).slice(0, 220),
      verified: Boolean(recipe.verified),
      lineSource: recipe.verified ? "OpenRouter generated, marked verified" : "OpenRouter generated, unverified",
      generatedBy: "openrouter",
    };
  } catch {
    return fallback;
  }
}

async function fetchMemeImage() {
  try {
    const response = await fetch("https://api.imgflip.com/get_memes");
    if (!response.ok) return null;
    const data = await response.json();
    const memes = data.data?.memes || [];
    const landscapeSafe = memes.filter((meme) => meme.url && meme.width >= 400 && meme.height >= 300);
    const chosen = pickOne(landscapeSafe.length ? landscapeSafe : memes);
    return chosen ? { url: chosen.url, name: chosen.name } : null;
  } catch {
    return null;
  }
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

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export default App;
