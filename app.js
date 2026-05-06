let lastWord = "";
let isShiritori = false;
const userCoins = {};
const words = [
  "あたり","いちげき","うちどめ","えんしゅつ","おすいち",

"かくへん","かくりつ","かいてん","かちもり","かどう",

"きたいど","きかいわり","ぎんがみ",

"くそだい","くぎ","くれじっと","ぐりーんだから","けいぞく","けいさん","けいひん","げっこうが",

"こいん","こうせってい","こうりつ","こぜに","ごっど",

"さみー","ざんげ",


"しんだい",
"じんぎ",
"すろっと","ずんだ","せってい","せっていさ","せっていろく","ぜったいち",

"せんぷく","そうさ","そうび","ぞんび",

"たいあたり","たいき","たいおう","だいいち",

"ちょうせい","ちょくげき",

"ついかとうし","つらぬき","つみ",

"てんじょう","でだま","でんさぽ",

"とうし","とくてん","どーぱ",

"なみ","なぞあたり",

"にゅうしょう","にんき",


"ねらいめ",

"のこりだま",

"はまり","はずれ","はどう","はんだん","ばか",

"ひき","ひっさつ","ひょうじ","びきに",

"ふくすう","ふくしゅう","ふだん","ぶっくおふ",

"へいそく","へんどう","べる",

"ほーる","ほうしゅう","ぼーる",

"まけ","まわり","まわる","まんだい",

"みせ","みきり","みこみ",

"むだうち",

"めだま","めりはり","もずく",


"やめどき","やくもの",
"ゆんける","よっと",
"らっしゅ","らんぷ",

"りーち","りせっと",

"るーぷ","がぽり","ろんぐ","わかめ",

"れんちゃん","れあやく",];
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
            label: "📖 ヘルプ",
            text: "/help"
          }
        },
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

        },
        {
  type: "action",
  action: {
    type: "message",
    label: "🎰 スロット",
    text: "/slot"
  }
},
        {
  type: "action",
  action: {
    type: "message",
    label: "🎮 しりとり",
    text: "/shiritori"
  }
},
{
  type: "action",
  action: {
    type: "message",
    label: "🧮 計算",
    text: "/cal 1+2"
  }
},
 
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
const userId = event.source.userId;

if (!userCoins[userId]) {
  userCoins[userId] = 1000;
}
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
/weather 地名　大阪、熊本、東京に対応
/news 日本、世界のニュース表示
/shiritori しりとりスタート
/slot スロット開始
/cal 1+4 電卓
/rand A B AからBまでの乱数表示
/en 英単語　英語→日本語翻訳`)]
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
else if (userText.startsWith("/en")) {

  const word = userText.replace("/en", "").trim();

  if (!word) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "使い方：/en apple"
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
    const resTrans = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|ja`
    );

    const translated = resTrans.data.responseData.translatedText;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(`📖 翻訳結果\n\n${word} → ${translated}`)]
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
          text: "翻訳失敗😢"
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
else if (userText.trim() === "/shiritori") {

  isShiritori = true;
  lastWord = "";

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage("しりとりスタート！好きな言葉をどうぞ")]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (isShiritori) {

  const word = toHiragana(userText.trim()).replace(/[^ぁ-ん]/g, '');
  if (!word) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("ひらがなで入力して！")]
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
  // んで終了
  if (word.endsWith("ん")) {
    isShiritori = false;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("『ん』で終わったのであなたの負け！😢")]
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

  // 最初
  if (!lastWord) {
    lastWord = word;

    const nextChar = word.slice(-1);

    const candidates = words.filter(w => w.startsWith(nextChar));
if (candidates.length === 0) {
  isShiritori = false;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage("思いつかなかった…あなたの勝ち！🎉")]
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
const botWord = candidates[Math.floor(Math.random() * candidates.length)];
lastWord = botWord;

await axios.post(
  "https://api.line.me/v2/bot/message/reply",
  {
    replyToken,
    messages: [createQuickReplyMessage(`🤖 ${botWord}`)]
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

  // 文字チェック
  const lastChar = lastWord.slice(-1);
  if (!word.startsWith(lastChar)) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(`「${lastChar}」から始めて！`)]
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

  const nextChar = word.slice(-1);

  // Bot候補
  const candidates = words.filter(w => w.startsWith(nextChar));
if (candidates.length === 0) {
  isShiritori = false;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage("思いつかなかった…あなたの勝ち！🎉")]
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

  const botWord = candidates[Math.floor(Math.random() * candidates.length)];

  // Botが負け
  if (botWord.endsWith("ん")) {
    isShiritori = false;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(`🤖 ${botWord}\n…あ、『ん』で負けた😢`)]
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

  lastWord = botWord;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(`🤖 ${botWord}`)]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (userText.startsWith("/cal")) {
  const exp = userText.replace("/cal", "").trim();

  if (!exp) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: "使い方：/cal 1+2*3" }]
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

  // 🔒 安全フィルター（数字と基本演算子だけ）
  if (!/^[0-9+\-*/(). ]+$/.test(exp)) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: "数字と + - * / ( ) だけ使って！" }]
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
    const result = Function('"use strict"; return (' + exp + ')')();

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage(`🧮 ${exp} = ${result}`)]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  } catch {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: "計算できない😢" }]
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
else if (userText.startsWith("/rand")) {
  const args = userText.replace("/rand", "").trim().split(" ");

  if (args.length < 2) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "使い方：/rand 最小 最大\n例：/rand 1 100"
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

  let min = parseInt(args[0]);
  let max = parseInt(args[1]);

  if (isNaN(min) || isNaN(max)) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: "数字で入力して！" }]
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

  if (min > max) {
    [min, max] = [max, min]; // 入れ替え
  }

  const result = Math.floor(Math.random() * (max - min + 1)) + min;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(`🎲 ${min}〜${max} → ${result}`)]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (userText === "/slot") {

  const cost = 50;

  // 💰 コイン足りる？
  if (userCoins[userId] < cost) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("コイン足りない😢（50必要）")]
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

  // 🎰 回す（コイン消費）
  userCoins[userId] -= cost;

  const items = ["🍒","🔔","7️⃣","🍉","⭐"];

  let a = items[Math.floor(Math.random()*items.length)];
  let b = items[Math.floor(Math.random()*items.length)];
  let c = items[Math.floor(Math.random()*items.length)];

  let result = "ハズレ😢";
let reward = 0;
// 🔥 救済（ハズレを減らす）
if (Math.random() < 0.3) { // ← 30%で強制的に当たり寄り
  if (Math.random() < 0.5) {
    // 2つ揃いにする
    a = b;
  } else {
    // チェリーを1個入れる
    a = "🍒";
  }
}
// 🎰 役判定
if (a === b && b === c) {
  // 3つ揃い
  if (a === "7️⃣") {
    result = "🎉🎉 激アツ！777揃い！";
    reward = 500;
  } else if (a === "⭐") {
    result = "🌟 レア役！スター揃い！";
    reward = 300;
  } else {
    result = "🎉 当たり！（3つ揃い）";
    reward = 150;
  }

} else if (a === b || b === c || a === c) {
  // 2つ揃い
  result = "✨ 2つ揃い！";
  reward = 50;

} else if (a === "🍒" || b === "🍒" || c === "🍒") {
  // チェリー救済
  result = "🍒 チェリー！";
  reward = 20;
}

  // 💰 報酬追加
  userCoins[userId] += reward;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [
        createQuickReplyMessage(
          `${a} | ${b} | ${c}
${result}

💰 +${reward}コイン
🪙 残り：${userCoins[userId]}`
        )
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (userText === "/coin") {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(`🪙 あなたのコイン：${userCoins[userId]}`)]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
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
