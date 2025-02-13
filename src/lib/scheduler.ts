import { db } from './firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

export interface ScheduledContent {
  id?: string;
  userId: string;
  content: string;
  title: string;
  publishDate: Date;
  platform: string;
  status: 'scheduled' | 'published' | 'failed';
}

export async function scheduleContent(content: ScheduledContent) {
  try {
    const docRef = await addDoc(collection(db, 'scheduledContent'), {
      ...content,
      publishDate: Timestamp.fromDate(content.publishDate),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error scheduling content:', error);
    throw error;
  }
}

export async function getScheduledContent(userId: string) {
  const q = query(
    collection(db, 'scheduledContent'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}