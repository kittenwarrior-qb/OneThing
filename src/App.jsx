import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  ScrollShadow,
  Separator,
  Tabs,
  Tab,
  TextArea,
} from "@heroui/react";
import {
  BookOpen,
  Brain,
  Check,
  Flame,
  Gift,
  ListChecks,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const microTasks = [
  "Mở đúng 1 bài Sliding Window trong LeetCode",
  "Tự viết brute force hoặc ý tưởng trong 7 phút",
  "Code solution, tick done khi pass sample",
];

const paths = [
  { name: "IELTS / English", done: 34, color: "primary", note: "Reading + vocab + grammar" },
  { name: "LeetCode 200", done: 18, color: "success", note: "Patterns cho phỏng vấn" },
  { name: "System Design", done: 22, color: "warning", note: "Alex Xu + notes" },
  { name: "Design Patterns", done: 11, color: "secondary", note: "OO patterns + examples" },
];

const secretRewards = [
  {
    title: "Quiet Builder",
    body: "Bạn vừa thắng một phiên mà không cần biến nó thành drama. Đây là kiểu tiến bộ có thật.",
    condition: "Hoàn thành 3 micro-task trong Main Quest",
  },
  {
    title: "Comeback Proof",
    body: "Một ngày quay lại đáng giá hơn một streak hoàn hảo trên giấy.",
    condition: "Mở app sau một ngày miss",
  },
  {
    title: "No-switch Win",
    body: "Hôm nay bạn không học tất cả mọi thứ. Bạn học đúng thứ cần học.",
    condition: "Không đổi path chính trong phiên đầu",
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [checked, setChecked] = useState([false, false, false]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [distraction, setDistraction] = useState("");
  const [openedRewards, setOpenedRewards] = useState([]);

  const completed = checked.filter(Boolean).length;
  const progress = Math.round((completed / microTasks.length) * 100);
  const hasGift = completed === microTasks.length && !openedRewards.includes(0);

  const focusCopy = useMemo(() => {
    if (!sessionStarted) return "Chọn 1 việc nhỏ, bấm Start, rồi rời app để học thật.";
    if (completed === microTasks.length) return "Đủ rồi. Quay lại nhận quà và đóng phiên.";
    return "Đang trong phiên. App chỉ giữ nhịp, bạn học ở LeetCode/YouPass/VS Code.";
  }, [completed, sessionStarted]);

  const toggleTask = (index) => {
    setChecked((value) => value.map((item, itemIndex) => (itemIndex === index ? !item : item)));
  };

  const openReward = (index) => {
    setOpenedRewards((value) => [...new Set([...value, index])]);
    setActiveTab("vault");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <div>
            <p className="mono-label text-[var(--rust)]">personal rescue system</p>
            <h1 className="serif-title text-3xl font-semibold leading-none sm:text-4xl">OneThing</h1>
          </div>
          <Badge content={hasGift ? "1" : ""} color="danger" shape="circle" isInvisible={!hasGift}>
            <Button isIconOnly variant="flat" radius="full" className="bg-white/80" onPress={() => setActiveTab("vault")}>
              <Gift size={19} />
            </Button>
          </Badge>
        </header>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          radius="full"
          classNames={{
            base: "sticky top-3 z-20 mb-5",
            tabList: "w-full bg-white/70 p-1 shadow-sm backdrop-blur-xl sm:w-auto",
            tab: "h-10 px-4",
            cursor: "bg-[var(--ink)]",
            tabContent: "group-data-[selected=true]:text-white",
          }}
        >
          <Tab key="today" title={<TabTitle icon={<ListChecks size={16} />} label="Today" />} />
          <Tab key="focus" title={<TabTitle icon={<TimerReset size={16} />} label="Focus" />} />
          <Tab key="paths" title={<TabTitle icon={<BookOpen size={16} />} label="Paths" />} />
          <Tab key="vault" title={<TabTitle icon={<Gift size={16} />} label="Vault" />} />
        </Tabs>

        {activeTab === "today" && (
          <section className="grid flex-1 gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <Card className="soft-card">
              <CardContent className="gap-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Chip variant="flat" color="success" startContent={<ShieldCheck size={14} />}>
                      Main Quest hôm nay
                    </Chip>
                    <h2 className="serif-title mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                      LeetCode Pattern, không nhảy sang thứ khác.
                    </h2>
                  </div>
                  <div className="rounded-full bg-[var(--cream)] p-2">
                    <div className="progress-ring" style={{ "--progress": `${progress}%` }} aria-label="Daily progress">
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {microTasks.map((task, index) => (
                    <button
                      className={`task-row ${checked[index] ? "task-row-done" : ""}`}
                      key={task}
                      onClick={() => toggleTask(index)}
                    >
                      <Checkbox
                        isSelected={checked[index]}
                        color="success"
                        radius="full"
                        onValueChange={() => toggleTask(index)}
                      />
                      <span>{task}</span>
                      {checked[index] && <Check className="ml-auto text-emerald-600" size={18} />}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    color="success"
                    size="lg"
                    radius="full"
                    startContent={sessionStarted ? <Pause size={18} /> : <Play size={18} />}
                    onPress={() => {
                      setSessionStarted((value) => !value);
                      setActiveTab("focus");
                    }}
                  >
                    {sessionStarted ? "Session đang chạy" : "Start Focus"}
                  </Button>
                  {hasGift && (
                    <Button
                      size="lg"
                      radius="full"
                      variant="flat"
                      color="warning"
                      startContent={<Sparkles size={18} />}
                      onPress={() => openReward(0)}
                    >
                      Có quà bí mật
                    </Button>
                  )}
                </div>
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
                      <h3 className="text-2xl font-semibold">4 ngày cứu mình</h3>
                    </div>
                  </div>
                  <Bar value={74} tone="gold" />
                  <p className="text-sm text-[var(--muted)]">Minimum day chỉ cần 20 phút. Không cần hoàn hảo để được tính là quay lại.</p>
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
                      <h3 className="text-xl font-semibold">Không cấm học trên web</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["LeetCode", "VS Code", "Docs", "Dictionary", "Notes"].map((tool) => (
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
                  <span>42:00</span>
                </div>
                <h2 className="serif-title max-w-xl text-3xl font-semibold">Làm đúng micro-task tiếp theo.</h2>
                <p className="max-w-lg text-[var(--muted)]">{focusCopy}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["LeetCode", "VS Code", "Docs", "Dictionary"].map((tool) => (
                    <Chip key={tool} color="success" variant="flat">
                      {tool}
                    </Chip>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mono-label">distraction log</p>
                    <h3 className="text-xl font-semibold">Ghi ra để kéo attention về</h3>
                  </div>
                  <Button variant="flat" radius="full" startContent={<Check size={16} />}>
                    Stayed inside tools
                  </Button>
                </div>
                <TextArea
                  minRows={2}
                  value={distraction}
                  onValueChange={setDistraction}
                  placeholder="Ví dụ: muốn mở YouTube vì bài khó, không phải vì cần học."
                />
              </CardContent>
            </Card>
          </section>
        )}

        {activeTab === "paths" && (
          <section className="grid gap-4 md:grid-cols-2">
            {paths.map((path) => (
              <Card className="soft-card" key={path.name}>
                <CardContent className="gap-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{path.name}</h3>
                      <p className="text-sm text-[var(--muted)]">{path.note}</p>
                    </div>
                    <Chip color={path.color} variant="flat">
                      {path.done}%
                    </Chip>
                  </div>
                  <Bar value={path.done} tone={path.color} />
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {activeTab === "vault" && (
          <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <Card className="soft-card">
              <CardContent className="gap-4 p-6">
                <p className="mono-label text-[var(--rust)]">sealed rewards</p>
                <h2 className="serif-title text-4xl font-semibold">Bạn không biết trước quà là gì.</h2>
                <p className="text-[var(--muted)]">Quà chỉ mở sau khi bạn thực sự quay lại học. Không spam, không biến app thành mạng xã hội.</p>
                <Button
                  color="warning"
                  radius="full"
                  startContent={<Sparkles size={18} />}
                  isDisabled={!hasGift}
                  onPress={() => openReward(0)}
                >
                  {hasGift ? "Mở quà hôm nay" : "Chưa có quà mới"}
                </Button>
              </CardContent>
            </Card>

            <ScrollShadow className="max-h-[520px]">
              <div className="grid gap-4">
                {secretRewards.map((reward, index) => {
                  const opened = openedRewards.includes(index);
                  return (
                    <Card className={`soft-card ${opened ? "reward-open" : "reward-sealed"}`} key={reward.title}>
                      <CardContent className="gap-3 p-6">
                        <div className="flex items-center justify-between">
                          <Chip variant="flat" color={opened ? "success" : "default"}>
                            {opened ? "Unlocked" : "Sealed"}
                          </Chip>
                          <Gift size={18} />
                        </div>
                        <Separator />
                        <h3 className="serif-title text-2xl font-semibold">{opened ? reward.title : "Hidden gift"}</h3>
                        <p className="text-[var(--muted)]">{opened ? reward.body : "Hoàn thành một điều kiện thật trong lúc học để mở."}</p>
                        {opened && <p className="mono-label">{reward.condition}</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollShadow>
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

function Bar({ value, tone = "primary" }) {
  return (
    <div className="bar-track" data-tone={tone}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export default App;
