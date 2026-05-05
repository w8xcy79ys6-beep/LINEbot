const express = require('express');
const axios = require('axios');

const app = express();
function toHiragana(text) {
  return text.replace(/[ァ-ン]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function is575(text) {
  const hira = toHiragana(text).replace(/[^ぁ-ん]/g, '');
  
  if (hira.length !== 17) return false;

  const first = hira.slice(0, 5);
  const second = hira.slice(5, 12);
  const third = hira.slice(12, 17);

  return first.length === 5 && second.length === 7 && third.length === 5;
}
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.post('/webhook', async (req, res) => {
  const event = req.body.events[0];

  if (event.type === 'message') {
    const replyToken = event.replyToken;
    const userText = event.message.text;

    const message = {
      type: "text",
     let replyText;

if (is575(userText)) {
  replyText = "五七五！ナイス川柳👍";
} else {
  replyText = "五七五じゃないかも🤔";
}

const message = {
  type: "text",
  text: replyText
};
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
