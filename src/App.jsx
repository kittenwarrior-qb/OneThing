import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
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
  ListChecks,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
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

const gachaPool = [
  {
    id: "quiet-builder",
    name: "Quiet Builder",
    rarity: "Rare",
    type: "Mindset",
    line: "Small wins compound.",
    flavor: "You did the boring part. That is where the real edge lives.",
    gradient: "from-emerald-300 via-teal-100 to-stone-100",
  },
  {
    id: "two-pointer-sensei",
    name: "Two Pointer Sensei",
    rarity: "Epic",
    type: "Algorithm",
    line: "Move with intent.",
    flavor: "Left and right do not wander. They squeeze the problem until it tells the truth.",
    gradient: "from-sky-300 via-cyan-100 to-white",
  },
  {
    id: "einstein-note",
    name: "Einstein Note",
    rarity: "Legend",
    type: "Physics",
    line: "Simplify, then verify.",
    flavor: "A clean thought still needs evidence. Write the proof, not the vibe.",
    gradient: "from-amber-300 via-yellow-100 to-stone-50",
  },
  {
    id: "comeback-card",
    name: "Comeback Proof",
    rarity: "Rare",
    type: "Identity",
    line: "Returned before the loop won.",
    flavor: "Missing once is data. Returning is character.",
    gradient: "from-rose-300 via-orange-100 to-white",
  },
  {
    id: "meme-energy",
    name: "Oi Oi Oi",
    rarity: "Common",
    type: "Meme",
    line: "Back to task.",
    flavor: "The distraction tried to be funny. You were funnier.",
    gradient: "from-violet-300 via-fuchsia-100 to-white",
  },
  {
    id: "power-card",
    name: "Power Contract",
    rarity: "Epic",
    type: "Heroic",
    line: "Power needs practice.",
    flavor: "No origin story today. Just one completed checkbox.",
    gradient: "from-red-300 via-orange-100 to-stone-50",
  },
];

const navTabs = [
  { key: "today", label: "Today", icon: <ListChecks size={16} /> },
  { key: "focus", label: "Focus", icon: <TimerReset size={16} /> },
  { key: "paths", label: "Paths", icon: <BookOpen size={16} /> },
  { key: "vault", label: "Vault", icon: <Gift size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> },
];

function createDefaultState() {
  const firstLesson = defaultPaths[0].lessons[0];
  return {
    version: 2,
    settings: {
      geminiKey: "",
      geminiModel: "gemini-2.5-flash",
      dailyMinutes: 70,
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
  const importRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activePath = state.paths.find((path) => path.id === state.today.pathId) || state.paths[0];
  const activeLesson =
    activePath?.lessons.find((lesson) => lesson.id === state.today.lessonId) || activePath?.lessons[0];
  const checks = activeLesson?.checks || [];
  const completedCount = checks.filter((_, index) => state.today.checked[index]).length;
  const progress = checks.length ? Math.round((completedCount / checks.length) * 100) : 0;
  const isComplete = checks.length > 0 && completedCount === checks.length;
  const canClaim = isComplete && !state.today.rewardId;
  const streak = computeStreak(state.history);

  const focusCopy = useMemo(() => {
    if (!activeLesson) return "Create a path first.";
    if (isComplete) return "Enough for today. Claim the card once, then stop farming the app.";
    return "Do the next checkbox in your real study tool, then come back here to mark it.";
  }, [activeLesson, isComplete]);

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

  const claimReward = () => {
    if (!canClaim || !activeLesson) return;
    const alreadyCompleted = state.history[activeLesson.id]?.rewardId;
    if (alreadyCompleted) return;
    const card = drawCard();
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

  const generateLessonWithGemini = async () => {
    if (!state.settings.geminiKey.trim() || !activeLesson) {
      setAiStatus("Add Gemini key in Settings first.");
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${state.settings.geminiModel}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": state.settings.geminiKey.trim(),
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );
      if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
      setAiStatus("Gemini updated today's checklist.");
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
        <header className="flex items-center justify-between py-3">
          <div>
            <p className="mono-label text-[var(--rust)]">personal rescue system</p>
            <h1 className="serif-title text-3xl font-semibold leading-none sm:text-4xl">OneThing</h1>
          </div>
          <Badge content={canClaim ? "1" : ""} color="danger" shape="circle" isInvisible={!canClaim}>
            <Button isIconOnly variant="flat" radius="full" className="bg-white/80" onPress={claimReward}>
              <Gift size={19} />
            </Button>
          </Badge>
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
                      Main Quest today
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
                    onPress={() => setActiveTab("focus")}
                  >
                    Start {activeLesson?.minutes || state.settings.dailyMinutes} min focus
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
                    {canClaim ? "Open gacha card" : state.today.rewardId ? "Reward already minted" : "Finish checklist first"}
                  </Button>
                  <Button
                    size="lg"
                    radius="full"
                    variant="flat"
                    startContent={<WandSparkles size={18} />}
                    onPress={generateLessonWithGemini}
                  >
                    Ask Gemini
                  </Button>
                </div>
                {aiStatus && <p className="text-sm text-[var(--muted)]">{aiStatus}</p>}
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
                      <p className="mono-label">streak</p>
                      <h3 className="text-2xl font-semibold">{streak} days</h3>
                    </div>
                  </div>
                  <Bar value={Math.min(100, streak * 14)} tone="gold" />
                  <p className="text-sm text-[var(--muted)]">
                    A day counts only after a lesson is completed and a card is minted.
                  </p>
                </CardContent>
              </Card>

              <Card className="soft-card">
                <CardContent className="gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="icon-bubble bg-emerald-100 text-emerald-700">
                      <Brain size={19} />
                    </div>
                    <div>
                      <p className="mono-label">allowed tools</p>
                      <h3 className="text-xl font-semibold">Use the web for real study</h3>
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

        {activeTab === "focus" && (
          <section className="mx-auto grid w-full max-w-4xl gap-5">
            <Card className="soft-card">
              <CardContent className="items-center gap-6 p-8 text-center">
                <p className="mono-label text-[var(--rust)]">focus session</p>
                <div className="timer-face">
                  <span>{activeLesson?.minutes || state.settings.dailyMinutes}:00</span>
                </div>
                <h2 className="serif-title max-w-xl text-3xl font-semibold">{activeLesson?.title}</h2>
                <p className="max-w-lg text-[var(--muted)]">{focusCopy}</p>
              </CardContent>
            </Card>

            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mono-label">distraction log</p>
                    <h3 className="text-xl font-semibold">Write it down, then return</h3>
                  </div>
                  <Button variant="flat" radius="full" startContent={<Check size={16} />}>
                    Stayed inside tools
                  </Button>
                </div>
                <textarea
                  className="plain-textarea"
                  rows={3}
                  placeholder="Example: wanted YouTube because the problem felt hard."
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
                <p className="mono-label text-[var(--rust)]">add path</p>
                <h2 className="serif-title text-3xl font-semibold">Book, course, or challenge</h2>
                <input
                  className="plain-input"
                  placeholder="Path name, e.g. 200 LeetCode Challenges"
                  value={newPath.title}
                  onChange={(event) => setNewPath({ ...newPath, title: event.target.value })}
                />
                <input
                  className="plain-input"
                  placeholder="Source, e.g. Alex Xu / CodingInterviewPatterns"
                  value={newPath.source}
                  onChange={(event) => setNewPath({ ...newPath, source: event.target.value })}
                />
                <input
                  className="plain-input"
                  placeholder="Cover image URL, optional"
                  value={newPath.imageUrl}
                  onChange={(event) => setNewPath({ ...newPath, imageUrl: event.target.value })}
                />
                <textarea
                  className="plain-textarea"
                  rows={8}
                  placeholder={"Paste table of contents here.\nOne chapter/topic per line."}
                  value={newPath.toc}
                  onChange={(event) => setNewPath({ ...newPath, toc: event.target.value })}
                />
                <Button color="success" radius="full" startContent={<Plus size={17} />} onPress={addPath}>
                  Create path
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {activeTab === "vault" && (
          <section className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">gacha vault</p>
                <h2 className="serif-title text-4xl font-semibold">Collect cards, not excuses.</h2>
                <p className="text-[var(--muted)]">
                  One completed lesson can mint exactly one card. Reticking today's checklist will not create another reward.
                </p>
                <Button
                  color="warning"
                  radius="full"
                  startContent={<Sparkles size={18} />}
                  isDisabled={!canClaim}
                  onPress={claimReward}
                >
                  {canClaim ? "Pull one card" : "No pull available"}
                </Button>
              </CardContent>
            </Card>

            <ScrollShadow className="max-h-[620px]">
              <div className="grid gap-4 sm:grid-cols-2">
                {state.collection.length === 0 && (
                  <Card className="soft-card">
                    <CardContent className="p-6">
                      <p className="text-[var(--muted)]">No cards yet. Finish today's checklist to pull your first one.</p>
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
                <p className="mono-label text-[var(--rust)]">gemini</p>
                <h2 className="serif-title text-3xl font-semibold">Task coach key</h2>
                <label className="field-label">API key</label>
                <input
                  className="plain-input"
                  type="password"
                  placeholder="Paste Gemini API key"
                  value={state.settings.geminiKey}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.geminiKey = event.target.value;
                      return draft;
                    })
                  }
                />
                <label className="field-label">Model</label>
                <input
                  className="plain-input"
                  value={state.settings.geminiModel}
                  onChange={(event) =>
                    updateState((draft) => {
                      draft.settings.geminiModel = event.target.value;
                      return draft;
                    })
                  }
                />
                <p className="text-sm text-[var(--muted)]">
                  Key is stored only in this browser's localStorage for now. Do not use this on a shared machine.
                </p>
              </CardContent>
            </Card>

            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">backup</p>
                <h2 className="serif-title text-3xl font-semibold">Do not lose the data</h2>
                <p className="text-[var(--muted)]">
                  LocalStorage is enough for MVP, but browser cleanup can wipe it. Export JSON after serious progress.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button color="success" radius="full" startContent={<Save size={17} />} onPress={exportJson}>
                    Export JSON
                  </Button>
                  <Button radius="full" variant="flat" startContent={<ImagePlus size={17} />} onPress={() => importRef.current?.click()}>
                    Import JSON
                  </Button>
                </div>
                <input ref={importRef} type="file" accept="application/json" hidden onChange={importJson} />
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="icon-bubble bg-stone-100 text-stone-700">
                    <KeyRound size={19} />
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    A real anti-cheat system needs backend auth. This local version prevents accidental farming, not devtools tampering.
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
        <span>{card.rarity}</span>
        <span>{card.type}</span>
      </div>
      <div className="collect-card-art">
        <Sparkles size={38} />
      </div>
      <div>
        <h3>{card.name}</h3>
        <p className="collect-line">{card.line}</p>
        <p className="collect-flavor">{card.flavor}</p>
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

function drawCard() {
  const weights = { Common: 58, Rare: 28, Epic: 11, Legend: 3 };
  const total = gachaPool.reduce((sum, card) => sum + weights[card.rarity], 0);
  let roll = Math.random() * total;
  for (const card of gachaPool) {
    roll -= weights[card.rarity];
    if (roll <= 0) return card;
  }
  return gachaPool[0];
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export default App;
