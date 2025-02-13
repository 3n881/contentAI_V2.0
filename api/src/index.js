import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = getFirestore(app);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const server = express();

// Middleware
server.use(express.json());
server.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Razorpay webhook endpoint
server.post('/webhook', async (req, res) => {
  console.log('Received webhook:', {
    body: req.body,
    signature: req.headers['x-razorpay-signature']
  });

  try {
    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      const { payload } = req.body;
      const payment = payload.payment.entity;
      
      console.log('Payment details:', payment);

      // Get order details from notes
      const orderId = payment.notes.orderId;
      console.log('Processing order:', orderId);

      // Update order status
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        console.log('Order data:', orderData);

        // Update order status
        await orderRef.update({
          status: 'completed',
          paymentId: payment.id,
          updatedAt: new Date()
        });

        // // Add credits to user
        // const userRef = db.collection('users').doc(orderData.userId);
        // const userDoc = await userRef.get();

        // if (userDoc.exists) {
        //   const currentCredits = userDoc.data().credits || 0;
        //   const newCredits = currentCredits + orderData.credits;
          
        //   console.log('Updating user credits:', {
        //     userId: orderData.userId,
        //     currentCredits,
        //     addingCredits: orderData.credits,
        //     newCredits
        //   });

        //   await userRef.update({
        //     credits: newCredits,
        //     lastPurchase: new Date(),
        //     planId: orderData.planId
        //   });
        const userRef = db.collection('users').doc(orderData.userId);
const userDoc = await userRef.get();

if (userDoc.exists) {
  const currentCredits = userDoc.data().credits || 0;
  await userRef.update({
    credits: currentCredits + orderData.credits,
    lastPurchase: new Date(),
    planId: orderData.planId
  });

          console.log('Credits updated successfully');
        } else {
          console.error('User document not found:', orderData.userId);
          throw new Error('User not found');
        }
      } else {
        console.error('Order not found:', orderId);
        throw new Error('Order not found');
      }

      res.json({ status: 'ok' });
    } else {
      console.error('Invalid webhook signature');
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});