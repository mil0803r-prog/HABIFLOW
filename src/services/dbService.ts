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
import { Goal, Habit, ActionPlan, Reward, DailyTracking } from '../types';

const getUserPath = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');
  return `users/${user.uid}`;
};

export const dbService = {
  // Goals
  async getGoals(): Promise<Goal[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `${getUserPath()}/goals`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async saveGoal(goal: Partial<Goal>): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const id = goal.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/goals/${id}`;
    try {
      const data = { ...goal, id, userId, updatedAt: new Date().toISOString() };
      if (!goal.id) (data as any).createdAt = new Date().toISOString();
      await setDoc(doc(db, path), data, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Habits
  async getHabits(): Promise<Habit[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `${getUserPath()}/habits`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async saveHabit(habit: Partial<Habit>): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const id = habit.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/habits/${id}`;
    try {
      const data = { ...habit, id, userId };
      await setDoc(doc(db, path), data, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `${getUserPath()}/rewards`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async saveReward(reward: Partial<Reward>): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const id = reward.id || doc(collection(db, 'temp')).id;
    const path = `${getUserPath()}/rewards/${id}`;
    try {
      const data = { ...reward, id, userId };
      await setDoc(doc(db, path), data, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // User Profile
  async getUserProfile() {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    const path = `users/${userId}`;
    try {
      const snapshot = await getDoc(doc(db, path));
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateUserProfile(data: { points: number }) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
