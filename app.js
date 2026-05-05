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
      messages: [{ type: "text", text: `使い方ガイド😎
/help 使い方ガイド表示
/news 日本、世界のニュース表示` }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
 else if (userText.trim() === "/news") {

  try {
    const worldRes = await axios.get(
      "https://news.yahoo.co.jp/rss/topics/world.xml"
    );

    const jpRes = await axios.get(
      "https://news.yahoo.co.jp/rss/topics/domestic.xml"
    );

    const worldTitles = worldRes.data.match(/<title>(.*?)<\/title>/g);
const worldLinks = worldRes.data.match(/<link>(.*?)<\/link>/g);

const jpTitles = jpRes.data.match(/<title>(.*?)<\/title>/g);
const jpLinks = jpRes.data.match(/<link>(.*?)<\/link>/g);

const worldTitle = worldTitles?.[1]?.replace(/<\/?title>/g, "") || "取得失敗";
const worldLink = worldLinks?.[1]?.replace(/<\/?link>/g, "") || "";

const jpTitle = jpTitles?.[1]?.replace(/<\/?title>/g, "") || "取得失敗";
const jpLink = jpLinks?.[1]?.replace(/<\/?link>/g, "") || "";

    const text =
`【今日のニュース📰】

🌍 世界
${worldTitle}
${worldLink}

🇯🇵 日本
${jpTitle}
${jpLink}
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
