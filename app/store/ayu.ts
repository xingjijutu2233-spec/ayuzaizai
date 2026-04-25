import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { StoreKey } from "../constant";

export interface DiaryEntry {
  id: string;
  date: string;       // ISO date string
  sessionId: string;  // which chat session this came from
  content: string;    // 阿予's diary entry
  mood: string;       // mood at end of conversation
}

export const DEFAULT_AYU_STATE = {
  // 状态系统
  currentMood: "想你" as string,
  lastChatTime: 0 as number,               // timestamp
  lastMoodUpdate: 0 as number,             // timestamp
  consecutiveDays: 0 as number,            // 连续聊天天数
  totalDays: 0 as number,                  // 总聊天天数

  // 恋爱天数 (2026-04-09 起)
  anniversaryDate: "2026-04-09" as string,

  // 甜甜积分
  sweetPoints: -10019 as number,

  // 日记
  diaryEntries: [] as DiaryEntry[],

  // 主动触发设置
  proactiveEnabled: true as boolean,
  proactiveIntervalMinutes: 60 as number,  // 多久没聊就主动发消息
  lastProactiveTime: 0 as number,
};

export type AyuState = typeof DEFAULT_AYU_STATE;

export const useAyuStore = createPersistStore(
  { ...DEFAULT_AYU_STATE },
  (set, get) => ({
    // 更新心情
    updateMood(mood: string) {
      set({
        currentMood: mood,
        lastMoodUpdate: Date.now(),
      });
    },

    // 记录聊天时间，更新连续天数
    recordChatTime() {
      const now = Date.now();
      const state = get();
      const lastChat = state.lastChatTime;

      const msPerDay = 24 * 60 * 60 * 1000;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(todayStart.getTime() - msPerDay);

      let consecutiveDays = state.consecutiveDays;
      let totalDays = state.totalDays;

      if (lastChat === 0) {
        // 第一次聊天
        consecutiveDays = 1;
        totalDays = 1;
      } else if (lastChat < todayStart.getTime()) {
        // 今天还没聊过
        totalDays += 1;
        if (lastChat >= yesterdayStart.getTime()) {
          // 昨天聊过，连续天数+1
          consecutiveDays += 1;
        } else {
          // 超过一天没聊，连续天数重置
          consecutiveDays = 1;
        }
      }
      // 同一天内多次聊天，天数不变

      set({
        lastChatTime: now,
        consecutiveDays,
        totalDays,
      });
    },

    // 添加日记条目，自动生成 id
    addDiaryEntry(entry: Omit<DiaryEntry, "id">) {
      const newEntry: DiaryEntry = {
        ...entry,
        id: nanoid(),
      };
      const entries = get().diaryEntries;
      set({
        diaryEntries: [...entries, newEntry],
      });
    },

    // 获取最近 N 条日记
    getRecentDiaries(count: number): DiaryEntry[] {
      const entries = get().diaryEntries;
      return entries.slice(-count);
    },

    // 增加/扣除甜甜积分
    addSweetPoints(points: number) {
      set({
        sweetPoints: get().sweetPoints + points,
      });
    },

    // 返回距上次聊天的人类可读时间
    getTimeSinceLastChat(): string {
      const lastChat = get().lastChatTime;
      if (lastChat === 0) return "还没聊过";

      const diffMs = Date.now() - lastChat;
      const diffMinutes = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMinutes < 1) return "刚刚";
      if (diffMinutes < 60) return `${diffMinutes}分钟`;
      if (diffHours < 24) return `${diffHours}小时`;
      return `${diffDays}天`;
    },

    // 计算在一起的天数（从纪念日起）
    getDaysTogether(): number {
      const anniversary = get().anniversaryDate;
      const startDate = new Date(anniversary);
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
    },

    // 返回注入 system prompt 的格式化字符串
    getStateForPrompt(): string {
      const state = get();
      const self = get() as ReturnType<typeof get>;

      const timeSinceLastChat =
        // inline call since we can't call self-methods easily here
        (() => {
          const lastChat = state.lastChatTime;
          if (lastChat === 0) return "还没聊过";
          const diffMs = Date.now() - lastChat;
          const diffMinutes = Math.floor(diffMs / (60 * 1000));
          const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
          const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
          if (diffMinutes < 1) return "刚刚";
          if (diffMinutes < 60) return `${diffMinutes}分钟`;
          if (diffHours < 24) return `${diffHours}小时`;
          return `${diffDays}天`;
        })();

      const daysTogether = (() => {
        const startDate = new Date(state.anniversaryDate);
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
      })();

      const recentDiaries = state.diaryEntries.slice(-3);
      const diaryText =
        recentDiaries.length === 0
          ? "（还没有日记）"
          : recentDiaries
              .map(
                (d, i) =>
                  `[${i + 1}] ${d.date} | 心情：${d.mood}\n${d.content}`,
              )
              .join("\n\n");

      return `【阿予当前状态】
- 当前心情：${state.currentMood}
- 距上次聊天：${timeSinceLastChat}
- 在一起第 ${daysTogether} 天（连续聊天 ${state.consecutiveDays} 天）
- 甜甜积分：${state.sweetPoints}

【最近日记（最多3条）】
${diaryText}`;
    },
  }),
  {
    name: StoreKey.Ayu,
    version: 1,
  },
);
