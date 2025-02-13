// src/lib/credits.ts
import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function addCredits(userId: string, amount: number): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      credits: increment(amount),
      lastUpdated: new Date()
    });

    // Get updated credits
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data()?.credits || 0;
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentCredits = userDoc.data()?.credits || 0;

    if (currentCredits < amount) {
      return false;
    }

    await updateDoc(userRef, {
      credits: increment(-amount),
      lastUpdated: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}

export async function checkCredits(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data()?.credits || 0;
  } catch (error) {
    console.error('Error checking credits:', error);
    return 0;
  }
}
