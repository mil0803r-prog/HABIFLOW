import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  collectionGroup
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Goal, Habit, ActionPlan, Reward, DailyTracking, ChatMessage } from '../types';

const withTimeout = <T>(promise: Promise<T>, ms: number = 1500): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout de conexión a Firestore"));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
};

const getUserPath = () => {
  const user = auth.currentUser;
  const uid = user ? user.uid : 'guest_user';
  return `users/${uid}`;
};

export const dbService = {
  isLocalOnly: (() => {
    try {
      return localStorage.getItem('force_local_mode') === 'true';
    } catch (e) {
      return false;
    }
  })(),

  // Goals
  async getGoals(): Promise<Goal[]> {
    const userId = auth.currentUser?.uid || 'guest_user';
    if (this.isLocalOnly || !auth.currentUser) {
      try {
        const cached = localStorage.getItem(`goals_fallback_${userId}`);
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    const path = `${getUserPath()}/goals`;
    try {
      const q = query(collection(db, path));
      const snapshot = await withTimeout(getDocs(q), 1500);
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      try {
        localStorage.setItem(`goals_fallback_${userId}`, JSON.stringify(goals));
      } catch (e) {
        console.warn('Failed to cache goals in localStorage:', e);
      }
      return goals;
    } catch (error) {
      console.warn('Firestore getGoals failed, loading from local cache:', error);
      try {
        const cached = localStorage.getItem(`goals_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  },

  async saveGoal(goal: Partial<Goal>): Promise<string> {
    const userId = auth.currentUser?.uid || 'guest_user';
    const id = goal.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/goals/${id}`;
    
    const data = { ...goal, id, userId, updatedAt: new Date().toISOString() };
    if (!goal.id) (data as any).createdAt = new Date().toISOString();

    // 1. Update localStorage cache immediately
    try {
      const cached = localStorage.getItem(`goals_fallback_${userId}`);
      let goalsList: Goal[] = cached ? JSON.parse(cached) : [];
      const index = goalsList.findIndex(g => g.id === id);
      if (index > -1) {
        goalsList[index] = { ...goalsList[index], ...data } as Goal;
      } else {
        goalsList.push(data as Goal);
      }
      localStorage.setItem(`goals_fallback_${userId}`, JSON.stringify(goalsList));
    } catch (e) {
      console.warn('Failed to update local cache for goal:', e);
    }

    if (this.isLocalOnly || !auth.currentUser) {
      return id;
    }

    // 2. Try to save to Firestore
    try {
      await withTimeout(setDoc(doc(db, path), data, { merge: true }), 1500);
      return id;
    } catch (error) {
      console.warn('Firestore saveGoal failed, stored locally:', error);
      return id;
    }
  },

  // Habits
  async getHabits(): Promise<Habit[]> {
    const userId = auth.currentUser?.uid || 'guest_user';
    if (this.isLocalOnly || !auth.currentUser) {
      try {
        const cached = localStorage.getItem(`habits_fallback_${userId}`);
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    const path = `${getUserPath()}/habits`;
    try {
      const q = query(collection(db, path));
      const snapshot = await withTimeout(getDocs(q), 1500);
      const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      try {
        localStorage.setItem(`habits_fallback_${userId}`, JSON.stringify(habits));
      } catch (e) {
        console.warn('Failed to cache habits in localStorage:', e);
      }
      return habits;
    } catch (error) {
      console.warn('Firestore getHabits failed, loading from local cache:', error);
      try {
        const cached = localStorage.getItem(`habits_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  },

  async saveHabit(habit: Partial<Habit>): Promise<string> {
    const userId = auth.currentUser?.uid || 'guest_user';
    const id = habit.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/habits/${id}`;
    const data = { ...habit, id, userId };

    // Update local cache
    try {
      const cached = localStorage.getItem(`habits_fallback_${userId}`);
      let habitsList: Habit[] = cached ? JSON.parse(cached) : [];
      const index = habitsList.findIndex(h => h.id === id);
      if (index > -1) {
        habitsList[index] = { ...habitsList[index], ...data } as Habit;
      } else {
        habitsList.push(data as Habit);
      }
      localStorage.setItem(`habits_fallback_${userId}`, JSON.stringify(habitsList));
    } catch (e) {}

    if (this.isLocalOnly || !auth.currentUser) {
      return id;
    }

    try {
      await withTimeout(setDoc(doc(db, path), data, { merge: true }), 1500);
      return id;
    } catch (error) {
      console.warn('Firestore saveHabit failed, stored locally:', error);
      return id;
    }
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const userId = auth.currentUser?.uid || 'guest_user';
    if (this.isLocalOnly || !auth.currentUser) {
      try {
        const cached = localStorage.getItem(`rewards_fallback_${userId}`);
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    const path = `${getUserPath()}/rewards`;
    try {
      const q = query(collection(db, path));
      const snapshot = await withTimeout(getDocs(q), 1500);
      const rewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
      try {
        localStorage.setItem(`rewards_fallback_${userId}`, JSON.stringify(rewards));
      } catch (e) {
        console.warn('Failed to cache rewards in localStorage:', e);
      }
      return rewards;
    } catch (error) {
      console.warn('Firestore getRewards failed, loading from local cache:', error);
      try {
        const cached = localStorage.getItem(`rewards_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  },

  async saveReward(reward: Partial<Reward>): Promise<string> {
    const userId = auth.currentUser?.uid || 'guest_user';
    const id = reward.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/rewards/${id}`;
    const data = { ...reward, id, userId };

    // Update local cache
    try {
      const cached = localStorage.getItem(`rewards_fallback_${userId}`);
      let rewardsList: Reward[] = cached ? JSON.parse(cached) : [];
      const index = rewardsList.findIndex(r => r.id === id);
      if (index > -1) {
        rewardsList[index] = { ...rewardsList[index], ...data } as Reward;
      } else {
        rewardsList.push(data as Reward);
      }
      localStorage.setItem(`rewards_fallback_${userId}`, JSON.stringify(rewardsList));
    } catch (e) {}

    if (this.isLocalOnly || !auth.currentUser) {
      return id;
    }

    try {
      await withTimeout(setDoc(doc(db, path), data, { merge: true }), 1500);
      return id;
    } catch (error) {
      console.warn('Firestore saveReward failed, stored locally:', error);
      return id;
    }
  },

  // User Profile
  async getUserProfile() {
    const userId = auth.currentUser?.uid || 'guest_user';
    if (this.isLocalOnly || !auth.currentUser) {
      try {
        const cached = localStorage.getItem(`profile_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    }
    const path = `users/${userId}`;
    try {
      const snapshot = await withTimeout(getDoc(doc(db, path)), 1500);
      const data = snapshot.exists() ? snapshot.data() : null;
      if (data) {
        try {
          localStorage.setItem(`profile_fallback_${userId}`, JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    } catch (error) {
      console.warn('Firestore getUserProfile failed, loading from cache:', error);
      try {
        const cached = localStorage.getItem(`profile_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    }
  },

  async updateUserProfile(data: { points: number }) {
    const userId = auth.currentUser?.uid || 'guest_user';
    const path = `users/${userId}`;

    // Update local cache
    try {
      const cached = localStorage.getItem(`profile_fallback_${userId}`);
      let profile = cached ? JSON.parse(cached) : {};
      profile = { ...profile, ...data };
      localStorage.setItem(`profile_fallback_${userId}`, JSON.stringify(profile));
      localStorage.setItem(`points_fallback_${userId}`, String(data.points));
    } catch (e) {}

    if (this.isLocalOnly || !auth.currentUser) {
      return;
    }

    try {
      await withTimeout(setDoc(doc(db, path), data, { merge: true }), 1500);
    } catch (error) {
      console.warn('Firestore updateUserProfile failed, stored locally:', error);
    }
  },

  // Chat Messages for AI Coach
  async getChatMessages(): Promise<ChatMessage[]> {
    const userId = auth.currentUser?.uid || 'guest_user';
    if (this.isLocalOnly || !auth.currentUser) {
      try {
        const cached = localStorage.getItem(`chat_fallback_${userId}`);
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    const path = `${getUserPath()}/chat_messages`;
    try {
      const q = query(collection(db, path));
      const snapshot = await withTimeout(getDocs(q), 1500);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      const sorted = msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      try {
        localStorage.setItem(`chat_fallback_${userId}`, JSON.stringify(sorted));
      } catch (e) {}
      return sorted;
    } catch (error) {
      console.warn('Firestore getChatMessages failed, loading from local cache:', error);
      try {
        const cached = localStorage.getItem(`chat_fallback_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  },

  async saveChatMessage(message: ChatMessage): Promise<void> {
    const userId = auth.currentUser?.uid || 'guest_user';
    const path = `${getUserPath()}/chat_messages/${message.id}`;

    // Update local cache
    try {
      const cached = localStorage.getItem(`chat_fallback_${userId}`);
      let msgs: ChatMessage[] = cached ? JSON.parse(cached) : [];
      msgs.push(message);
      localStorage.setItem(`chat_fallback_${userId}`, JSON.stringify(msgs));
    } catch (e) {}

    if (this.isLocalOnly || !auth.currentUser) {
      return;
    }

    try {
      await withTimeout(setDoc(doc(db, path), message), 1500);
    } catch (error) {
      console.warn('Firestore saveChatMessage failed, stored locally:', error);
    }
  },

  async clearChatMessages(): Promise<void> {
    const userId = auth.currentUser?.uid || 'guest_user';
    const path = `${getUserPath()}/chat_messages`;
    
    // Clear local cache
    try {
      localStorage.removeItem(`chat_fallback_${userId}`);
    } catch (e) {}

    if (this.isLocalOnly || !auth.currentUser) {
      return;
    }

    try {
      const q = query(collection(db, path));
      const snapshot = await withTimeout(getDocs(q), 1500);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('Firestore clearChatMessages failed:', error);
    }
  }
};
