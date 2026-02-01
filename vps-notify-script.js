/**
 * Mama Oliech Restaurant - VPS Notification Script
 * ------------------------------------------------
 * This script listens for webhooks from Supabase and sends
 * notifications to Telegram.
 * 
 * Instructions:
 * 1. Host this on your VPS (Node.js required)
 * 2. Install dependencies: npm install express node-telegram-bot-api
 * 3. Set your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
 * 4. Run with: node notify-vps.js
 */

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = 3000;

// Config - Replace with your own!
const TELEGRAM_BOT_TOKEN = '8101525165:AAFqxVu7qP7hXnGjD_3mkVaBW7loQaItzvY';
const TELEGRAM_CHAT_ID = '1101508903';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

app.use(express.json());

app.post('/webhook/new-order', async (req, res) => {
    try {
        const payload = req.body;
        console.log('Received order payload:', JSON.stringify(payload, null, 2));

        // Supabase sends the data in 'record' for inserts
        const order = payload.record;

        if (!order) {
            return res.status(400).send('Invalid payload');
        }

        const message = `
🔔 *NEW ORDER RECEIVED* 🥩

*Order #:* ${order.order_number}
*Customer:* ${order.customer_name}
*Phone:* ${order.customer_phone}
*Total:* KSh ${order.total_amount.toLocaleString()}
*Status:* ${order.payment_status.toUpperCase()}

📍 *Address:* ${order.delivery_address || 'Walk-in / Pick-up'}
        `;

        await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });

        console.log(`Notification sent for order ${order.order_number}`);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Notification server running at http://localhost:${port}`);
    console.log('Point your Supabase Webhook to: http://YOUR_VPS_IP:3000/webhook/new-order');
});
