const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.post('/webhook', async (req, res) => {
  const event = req.body.events[0];

  if (event.type === 'message') {
    const replyToken = event.replyToken;
    const userText = event.message.text;

    const message = {
      type: "text",
      text: "受信：" + userText
    };

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: replyToken,
        messages: [message]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
