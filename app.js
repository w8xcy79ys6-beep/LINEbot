const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

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

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.post('/webhook', async (req, res) => {
  if (!req.body.events || req.body.events.length === 0) {
  return res.sendStatus(200);
}
  const event = req.body.events[0];

  if (event.type === 'message') {
    const replyToken = event.replyToken;
    const userText = event.message.text;

if (userText.trim() === "/help") {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text: "使い方ガイド😎" }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
 else if (userText.trim() === "/news") {

  const apiKey = process.env.NEWS_API_KEY;

  try {
    // 🌍 世界ニュース
    const worldRes = await axios.get(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=1&apiKey=${apiKey}`
    );

    // 🇯🇵 日本ニュース
    const jpRes = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=jp&pageSize=1&apiKey=${apiKey}`
    );

    const world = worldRes.data.articles[0];
    const japan = jpRes.data.articles[0];

    const text =
`【今日のニュース📰】

🌍 世界
${world?.title || "取得失敗"}
${world?.url || ""}

🇯🇵 日本
${japan?.title || "取得失敗"}
${japan?.url || ""}
`;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

  } catch (error) {
    console.error(error);

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: "ニュース取得失敗😢" }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  }
}
else if (is575(userText)) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: replyToken,
      messages: [{
        type: "text",
        text: "五七五！ナイス川柳👍"
      }]
    },
    
    
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  }
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
