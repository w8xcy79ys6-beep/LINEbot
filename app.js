const express = require('express');
const axios = require('axios');
function createQuickReplyMessage(text) {
  return {
    type: "text",
    text: text,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "📰 ニュース",
            text: "/news"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "📖 ヘルプ",
            text: "/help"
          }
        }
        {  ,

          type: "action",

          action: {

            type: "message",

            label: "📍大阪",

            text: "/weather 大阪"

          }

        },

        {

          type: "action",

          action: {

            type: "message",

            label: "📍東京",

            text: "/weather 東京"

          }

        },

        {

          type: "action",

          action: {

            type: "message",

            label: "📍熊本",

            text: "/weather 熊本"

          }

        }

 
      ]
    }
  };
}
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
      messages: [createQuickReplyMessage(`使い方ガイド😎
/help 使い方ガイド表示
/weather 大阪　大阪の天気　東京、熊本に対応
/news 日本、世界のニュース表示`)]
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

// 🌍 世界（2件）

    const world1Title = worldTitles?.[2]?.replace(/<\/?title>/g, "") || "取得失敗";

    const world1Link = worldLinks?.[2]?.replace(/<\/?link>/g, "") || "";

    const world2Title = worldTitles?.[3]?.replace(/<\/?title>/g, "") || "取得失敗";

    const world2Link = worldLinks?.[3]?.replace(/<\/?link>/g, "") || "";

    // 🇯🇵 日本（2件）

    const jp1Title = jpTitles?.[2]?.replace(/<\/?title>/g, "") || "取得失敗";

    const jp1Link = jpLinks?.[2]?.replace(/<\/?link>/g, "") || "";

    const jp2Title = jpTitles?.[3]?.replace(/<\/?title>/g, "") || "取得失敗";

    const jp2Link = jpLinks?.[3]?.replace(/<\/?link>/g, "") || "";

    const text =
`【今日のニュース📰】

🌍 世界
① ${world1Title}
👉 ${world1Link}

② ${world2Title}
👉 ${world2Link}

🇯🇵 日本
① ${jp1Title}
👉 ${jp1Link}

② ${jp2Title}
👉 ${jp2Link}
`;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(text)]
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
else if (userText.startsWith("/weather")) {

  const apiKey = process.env.WEATHER_API_KEY;
  let city = userText.replace("/weather", "").trim();
  city = city.toLowerCase();

if (city.includes("大阪") || city.includes("osaka")) city = "Osaka";
if (city.includes("東京") || city.includes("tokyo")) city = "Tokyo";
  

if (city.includes("熊本") || city.includes("kumamoto")) city = "Kumamoto";
  if (!city) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "使い方：/weather 東京"
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    return;
  }

  try {
    const resWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},jp&appid=${apiKey}&units=metric&lang=ja`
    );

    const data = resWeather.data;

    const text =
`📍${data.name}の天気

☁️ ${data.weather[0].description}
🌡 気温：${data.main.temp}℃
🤒 体感：${data.main.feels_like}℃`;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(text)]
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
        messages: [{
          type: "text",
          text: "対応してない都市かも😢\n大阪・東京・熊本で試して！"
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
else if (is575(userText)) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: replyToken,
      messages: [createQuickReplyMessage("五七五！ナイス川柳👍")]
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
