import { database, StreakData, UserXPData, UserAchievementRecord } from './firebase';
import { ref, get, set, update } from 'firebase/database';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: 'test' | 'streak' | 'homework' | 'performance';
  icon: string;
  xpReward: number;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'first-test',
    title: 'First Test',
    description: 'Attempt and successfully submit your very first mock assessment',
    category: 'test',
    icon: 'target',
    xpReward: 100
  },
  {
    id: 'streak-3',
    title: 'Streak Starter',
    description: 'Maintain an active daily learning streak for 3 consecutive days',
    category: 'streak',
    icon: 'flame',
    xpReward: 75
  },
  {
    id: 'streak-7',
    title: '7 Day Streak',
    description: 'Maintain an unbroken daily learning streak for 7 consecutive days',
    category: 'streak',
    icon: 'zap',
    xpReward: 150
  },
  {
    id: '10-tests',
    title: '10 Tests Completed',
    description: 'Complete 10 comprehensive chapter & full-syllabus mock assessments',
    category: 'test',
    icon: 'trophy',
    xpReward: 250
  },
  {
    id: 'score-90',
    title: '90%+ Score',
    description: 'Achieve a score of 90% or higher in any mock examination',
    category: 'performance',
    icon: 'award',
    xpReward: 150
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Score a flawless 100% total marks in an official mock test',
    category: 'performance',
    icon: 'crown',
    xpReward: 300
  },
  {
    id: 'homework-ace',
    title: 'Homework Ace',
    description: 'Solve and mark completed an assigned Daily Practice Problem (DPP)',
    category: 'homework',
    icon: 'check-circle-2',
    xpReward: 50
  }
];

export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(d = new Date()): string {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return getTodayDateString(prev);
}

// Calculate level and XP progress
export function calculateUserLevel(totalXP: number) {
  const safeXP = Math.max(0, totalXP || 0);
  // Level threshold: 250 XP per level
  const xpPerLevel = 250;
  const level = Math.floor(safeXP / xpPerLevel) + 1;
  const currentLevelBase = (level - 1) * xpPerLevel;
  const nextLevelBase = level * xpPerLevel;
  const progressInLevel = safeXP - currentLevelBase;
  const percentToNext = Math.min(100, Math.round((progressInLevel / xpPerLevel) * 100));

  let rankTitle = 'Mathematics Novice';
  if (level >= 10) rankTitle = 'Mathematics Grandmaster';
  else if (level >= 7) rankTitle = 'Master Problem Solver';
  else if (level >= 5) rankTitle = 'Advanced Mathematician';
  else if (level >= 3) rankTitle = 'Aspiring Scholar';
  else if (level >= 2) rankTitle = 'Focused Learner';

  return {
    level,
    rankTitle,
    currentXP: safeXP,
    xpToNextLevel: nextLevelBase - safeXP,
    percentToNext,
    xpPerLevel
  };
}

export interface RecordActivityOptions {
  userId: string;
  activityType: 'test_attempt' | 'homework_completed' | 'attendance_present';
  metadata?: {
    testId?: string;
    homeworkId?: string;
    score?: number;
    totalMarks?: number;
    percentage?: number;
    totalTestsCompleted?: number;
  };
}

export interface RecordActivityResult {
  streakUpdated: boolean;
  currentStreak: number;
  longestStreak: number;
  isTodayActive: boolean;
  xpEarned: number;
  newTotalXP: number;
  newAchievements: AchievementDef[];
}

// Server-authoritative activity processor
export async function recordMeaningfulActivity({
  userId,
  activityType,
  metadata = {}
}: RecordActivityOptions): Promise<RecordActivityResult> {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const now = Date.now();

  // 1. Process Streak in streaks/{userId}
  const streakRef = ref(database, `streaks/${userId}`);
  const streakSnap = await get(streakRef);
  const currentStreakData: StreakData = streakSnap.exists() 
    ? (streakSnap.val() as StreakData) 
    : { currentStreak: 0, longestStreak: 0, lastActivityDate: '' };

  let currentStreak = currentStreakData.currentStreak || 0;
  let longestStreak = currentStreakData.longestStreak || 0;
  const lastDate = currentStreakData.lastActivityDate || '';

  let streakUpdated = false;
  let streakBonusXP = 0;

  if (lastDate === todayStr) {
    // Activity already performed today; streak preserved, no duplicate day increment
    streakUpdated = false;
  } else if (lastDate === yesterdayStr) {
    // Consecutive day activity! Extend streak
    currentStreak += 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    streakUpdated = true;
    streakBonusXP = 25; // Streak continuation reward
  } else {
    // Fresh start or streak reset after missing days
    currentStreak = 1;
    longestStreak = Math.max(longestStreak, 1);
    streakUpdated = true;
  }

  // Persist updated streak
  await update(streakRef, {
    currentStreak,
    longestStreak,
    lastActivityDate: todayStr,
    updatedAt: now
  });

  // 2. Compute XP
  let activityBaseXP = 0;
  if (activityType === 'test_attempt') {
    activityBaseXP = 100;
  } else if (activityType === 'homework_completed') {
    activityBaseXP = 50;
  } else if (activityType === 'attendance_present') {
    activityBaseXP = 40; // Regular classroom attendance reward
  }

  // Performance bonuses
  let performanceBonusXP = 0;
  if (typeof metadata.percentage === 'number') {
    if (metadata.percentage >= 100) {
      performanceBonusXP += 200; // Perfect score bonus
    } else if (metadata.percentage >= 90) {
      performanceBonusXP += 100; // 90%+ bonus
    } else if (metadata.percentage >= 80) {
      performanceBonusXP += 50;  // 80%+ bonus
    }
  }

  // 3. Process Achievements in achievements/{userId}
  const achievementsRef = ref(database, `achievements/${userId}`);
  const achievementsSnap = await get(achievementsRef);
  const currentUnlocked: Record<string, UserAchievementRecord> = achievementsSnap.exists()
    ? (achievementsSnap.val() as Record<string, UserAchievementRecord>)
    : {};

  const newAchievements: AchievementDef[] = [];

  const checkAndUnlock = (achId: string) => {
    if (!currentUnlocked[achId]) {
      const def = ACHIEVEMENTS_LIST.find(a => a.id === achId);
      if (def) {
        newAchievements.push(def);
        currentUnlocked[achId] = { unlockedAt: now };
      }
    }
  };

  // Rule 1: First Test
  if (activityType === 'test_attempt') {
    checkAndUnlock('first-test');
  }

  // Rule 2: 7 Day Streak & 3 Day Streak
  if (currentStreak >= 3) {
    checkAndUnlock('streak-3');
  }
  if (currentStreak >= 7) {
    checkAndUnlock('streak-7');
  }

  // Rule 3: 10 Tests Completed
  if (metadata.totalTestsCompleted && metadata.totalTestsCompleted >= 10) {
    checkAndUnlock('10-tests');
  }

  // Rule 4: 90%+ Score
  if (typeof metadata.percentage === 'number' && metadata.percentage >= 90) {
    checkAndUnlock('score-90');
  }

  // Rule 5: Perfect Score
  if (typeof metadata.percentage === 'number' && metadata.percentage >= 100) {
    checkAndUnlock('perfect-score');
  }

  // Rule 6: Homework Ace
  if (activityType === 'homework_completed') {
    checkAndUnlock('homework-ace');
  }

  // Save newly unlocked achievements
  if (newAchievements.length > 0) {
    const achUpdates: Record<string, { unlockedAt: number }> = {};
    newAchievements.forEach((ach) => {
      achUpdates[ach.id] = { unlockedAt: now };
    });
    await update(achievementsRef, achUpdates);
  }

  // XP from new achievements
  const achievementBonusXP = newAchievements.reduce((acc, a) => acc + a.xpReward, 0);

  const totalEarnedThisEvent = activityBaseXP + streakBonusXP + performanceBonusXP + achievementBonusXP;

  // 4. Update XP in xp/{userId}
  const xpRef = ref(database, `xp/${userId}`);
  const xpSnap = await get(xpRef);
  const existingTotalXP = xpSnap.exists() ? (xpSnap.val()?.totalXP || 0) : 0;
  const newTotalXP = existingTotalXP + totalEarnedThisEvent;

  await update(xpRef, {
    totalXP: newTotalXP,
    updatedAt: now
  });

  return {
    streakUpdated,
    currentStreak,
    longestStreak,
    isTodayActive: true,
    xpEarned: totalEarnedThisEvent,
    newTotalXP,
    newAchievements
  };
}
