
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  credits: number;
}

// Initial free tokens for new users
export const INITIAL_FREE_TOKENS = 10;

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1,
    features: [
      '10 AI content generations',
      'Basic SEO optimization',
      'Grammar checking',
      'Content scheduling'
    ],
    credits: 10
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499,
    features: [
      '50 AI content generations',
      'Advanced SEO tools',
      'Plagiarism checking',
      'Priority content scheduling',
      'Multiple content formats'
    ],
    credits: 30
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    features: [
      'Unlimited AI content generations',
      'Premium SEO tools',
      'Real-time content optimization',
      'Advanced analytics',
      'Priority support',
      'Custom content formats'
    ],
    credits: 100
  }
];

// Initialize user with free tokens
export async function initializeUserCredits(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        credits: INITIAL_FREE_TOKENS,
        createdAt: new Date(),
        lastTokenReset: new Date()
      });
      return INITIAL_FREE_TOKENS;
    }
    
    return userDoc.data().credits || 0;
  } catch (error) {
    console.error('Error initializing user credits:', error);
    throw error;
  }
}

// Get user credits
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return initializeUserCredits(userId);
    }
    
    return userDoc.data().credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
}



// Deduct credits from user
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const currentCredits = userDoc.data().credits || 0;
    
    if (currentCredits < amount) {
      return false;
    }
    
    await updateDoc(userRef, {
      credits: currentCredits - amount,
      lastUsed: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
}

// Load Razorpay script
let razorpayPromise: Promise<boolean> | null = null;

export const loadRazorpay = () => {
  if (!razorpayPromise) {
    razorpayPromise = new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
};

// New function to update user credits after successful payment
async function updateUserCreditsAfterPayment(userId: string, planId: string): Promise<void> {
  try {
    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Invalid plan');

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const currentCredits = userDoc.data().credits || 0;
    const newCredits = currentCredits + plan.credits;

    await updateDoc(userRef, {
      credits: newCredits,
      lastPurchase: new Date(),
      planId: planId
    });
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
}



// Process payment
export async function processPayment(userId: string, planId: string): Promise<void> {
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    throw new Error('Failed to load payment system');
  }

  const plan = pricingPlans.find(p => p.id === planId);
  if (!plan) throw new Error('Invalid plan selected');

  try {
    // Create order in Firestore first
    const order = await addDoc(collection(db, 'orders'), {
      userId,
      planId,
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      status: 'created',
      credits: plan.credits, // Store credits in order for webhook reference
      createdAt: new Date()
    });

    // Initialize Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: plan.price * 100,
      currency: 'INR',
      name: 'Content AI',
      description: `${plan.name} Plan Purchase`,
      prefill: {
        name: 'User',
        email: '',
        contact: ''
      },
      notes: {
        orderId: order.id // Store Firestore order ID in notes
      },
      theme: {
        color: '#4F46E5'
      },
      handler:async function(response: any) {
         // Update order status
         await updateDoc(doc(db, 'orders', order.id), {
          status: 'completed',
          paymentId: response.razorpay_payment_id,
          updatedAt: new Date()
        });

        // Update user credits
        await updateUserCreditsAfterPayment(userId, planId);
        // Just redirect to success page
        // The webhook will handle the actual payment verification and credit update
        window.location.href = 'https://contentai-v2-0.onrender.com/dashboard?payment=success';
      },
      modal: {
        ondismiss: function() {
          // Update order status to cancelled
          updateDoc(doc(db, 'orders', order.id), {
            status: 'cancelled',
            updatedAt: new Date()
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    // Handle payment failure
    rzp.on('payment.failed', function(response: any) {
      // Update order status to failed
      updateDoc(doc(db, 'orders', order.id), {
        status: 'failed',
        error: response.error.description,
        updatedAt: new Date()
      });
      window.location.href = 'https://contentai-v2-0.onrender.com/dashboard?payment=failed';
    });

    rzp.open();
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
}

// Add this function to verify credit deduction
export async function verifyDeduction(userId: string, initialCredits: number): Promise<boolean> {
  try {
    const afterDeduction = await getUserCredits(userId);
    return afterDeduction === initialCredits - 1;
  } catch (error) {
    console.error('Error verifying deduction:', error);
    return false;
  }
}
