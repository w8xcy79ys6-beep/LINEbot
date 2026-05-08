let lastWord = "";
let isShiritori = false;
let userCoins = {};
let userTitles = {};
let userOwnedTitles = {};
const userNames = {};

const titles = [
  { name: "見習い冒険者", rarity: "N", chance: 40 },
  { name: "夜ふかし常習犯", rarity: "N", chance: 30 },

  { name: "深夜テンション", rarity: "R", chance: 10 },
  { name: "選ばれし者", rarity: "R", chance: 10 },

  { name: "世界線の観測者", rarity: "SR", chance: 4 },
  { name: "神引きの化身", rarity: "SR", chance: 4 },

  { name: "終焉を告げる者", rarity: "SSR", chance: 1.5 },
  { name: "運営に愛された者", rarity: "SSR", chance: 0.4 },

  { name: "宇宙の管理者", rarity: "UR", chance: 0.1 }
];
function spinSlot() {
  const items = ["🍒","🔔","7️⃣","🍉","⭐"];

  let a = items[Math.floor(Math.random()*items.length)];
  let b = items[Math.floor(Math.random()*items.length)];
  let c = items[Math.floor(Math.random()*items.length)];

  let result = "ハズレ😢";
  let reward = 0;

  // 救済
  if (Math.random() < 0.00001) {
    if (Math.random() < 0.5) {
      a = b;
    } else {
      a = "🍒";
    }
  }

  // 判定
  if (a === b && b === c) {
    if (a === "7️⃣") {
      result = "🎉🎉777揃い！";
      reward = 3000;
    } else if (a === "⭐") {
      result = "🌟スター揃い！";
      reward = 1500;
    } else {
      result = "🎉3つ揃い！";
      reward = 500;
    }
  } else if (a === b || b === c || a === c) {
    result = "✨2つ揃い！";
    reward = 25;
  }

  return {
    text: `${a} | ${b} | ${c}\n${result}`,
    reward
  };
}
function pullTitleGacha() {
  const rand = Math.random() * 100;

  let total = 0;

  for (const title of titles) {
    total += title.chance;

    if (rand <= total) {
      return title;
    }
  }

  return titles[0];
}
const userLastAd = {};
// HIGH&LOW用データ
const highLowData = {};
const userBetCoins = {};

// BLACKJACK用
const blackjackData = {};
async function getUserName(userId) {
  if (userNames[userId]) return userNames[userId];

  try {
    const res = await axios.get(
      `https://api.line.me/v2/bot/profile/${userId}`,
      {
        headers: {
          "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    const name = res.data.displayName;
    userNames[userId] = name;
    return name;

  } catch {
    return "名無し";
  }
}

async function getRankingWithMe(userId) {
  const ranking = Object.entries(userCoins)
    .sort((a, b) => b[1] - a[1]);

  let text = "🏆 コインランキング\n\n";

  for (let i = 0; i < Math.min(5, ranking.length); i++) {
    const [id, coins] = ranking[i];
    const name = await getUserName(id);
    const title = userTitles[id] || "称号なし";

text += `${i + 1}位：【${title}】${name}（${coins}コイン）\n`;
  }

  const myRank = ranking.findIndex(u => u[0] === userId);

  if (myRank !== -1) {
    const myCoins = ranking[myRank][1];
    text += `\n👤 あなた：${myRank + 1}位（${myCoins}コイン）`;
  }

  return text;
}
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
const admin = require("firebase-admin");

const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();
async function getUserData(userId) {
  const doc = await db.collection("users").doc(userId).get();

  if (!doc.exists) {
    return {
      lastDaily: 0
    };
  }

  return doc.data();
}

async function saveUserData(userId, data) {
  await db.collection("users").doc(userId).set(data, { merge: true });
}
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
    label: "🎰 1回",
    text: "/slot"
  }
},
{
  type: "action",
  action: {
    type: "message",
    label: "🎰 10連",
    text: "/slot10"
  }
},
{
  type: "action",
  action: {
    type: "message",
    label: "🔥 100連",
    text: "/slot100"
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
app.get("/", (req, res) => {
  res.send("BOT起動中！");
});
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
async function loadCoins() {
  const snapshot = await db.collection("coins").get();

  snapshot.forEach(doc => {
    const data = doc.data();

    userCoins[doc.id] = data.coins || 1000;
    userTitles[doc.id] = data.title || "称号なし";
    userOwnedTitles[doc.id] =

  data.ownedTitles || ["初心者"];
  });

  console.log("データ読み込み完了");
}
async function saveCoins() {
  const batch = db.batch();

  for (const userId in userCoins) {
    const ref = db.collection("coins").doc(userId);

    batch.set(ref, {
      coins: userCoins[userId],
      title: userTitles[userId] || "称号なし",
      ownedTitles: userOwnedTitles[userId] || []

});
    
  }

  await batch.commit();
}
app.post('/webhook', async (req, res) => {
  if (!req.body.events || req.body.events.length === 0) {
  return res.sendStatus(200);
}
  const event = req.body.events[0];
const userId = event.source.userId;
if (userCoins[userId] === undefined) {
  userCoins[userId] = 1000;
  if (!userTitles[userId]) {

  userTitles[userId] = "初心者";

}

if (!userOwnedTitles[userId]) {

  userOwnedTitles[userId] = ["初心者"];

}
  await saveCoins();
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

【カジノ系ゲーム】🎮
☀️🎰 SLOT

/slot 1回スロット
/slot10 10連スロット
/slot100 100連スロット
/rate 確率・配当確認

🎉 絵柄が揃うとコイン獲得！

7️⃣揃い→ 超高配当🎉🎉🎉
⭐揃い→ 高配当🎉

☀️🎴 HIGH&LOW

/highlow ゲーム開始
/high HIGHを選択
/low LOWを選択
/bet 数字 賭け額変更

例：
/bet 500

現在の数字より
高いか低いかを当てろ！

数字によって倍率変動🔥

☀️🃏 BLACKJACK

/blackjack 開始
/hit カードを引く
/stand 勝負

/bet 500
で掛け金変更可能🔥

21を超えると負け💥

【その他カジノメニュー🎰】
/daily デイリーボーナス獲得

/coin 持ちメダル表示

/rank ランキング表示

【👑 称号システム】
/gacha
称号ガチャ（300コイン）

/titles
所持称号一覧

/equip 称号名
称号を変更

【ニュース系✉️】
/weather 地名　大阪、熊本、東京に対応

/news 日本、世界のニュース表示

【便利系🍱】

/cal 1+4 電卓

/rand A B AからBまでの乱数表示

/en 英単語　英語→日本語翻訳

/shiritori しりとり`)]
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

else if (userText === "/ad"){
if (userCoins[userId] >= 50) {

    await axios.post(

      "https://api.line.me/v2/bot/message/reply",

      {

        replyToken,

        messages: [createQuickReplyMessage("コイン50未満になると使えます")]

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


  const now = Date.now();

  if (userLastAd[userId] && now - userLastAd[userId] < 5000) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("⏳ まだ広告見れない！（5秒待って）")]
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

  userLastAd[userId] = now;

  userCoins[userId] += 500;
await saveCoins();
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage("📺 広告視聴完了！\n💰 +500コイン")]
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

  if (userCoins[userId] < cost) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("コイン足りない😢 ／adでGET！")]
      },
      { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
    );
    return;
  }

  userCoins[userId] -= cost;

  const { text, reward } = spinSlot();

  userCoins[userId] += reward;
await saveCoins();
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(
`${text}

💰 +${reward}
🪙 残り：${userCoins[userId]}`
      )]
    },
    { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
  );
}
else if (userText === "/slot10") {
  const cost = 50 * 10;

  if (userCoins[userId] < cost) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("コイン足りない😢")]
      },
      { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
    );
    return;
  }

  userCoins[userId] -= cost;

  let total = 0;
  let log = "";

  for (let i = 0; i < 10; i++) {
    const { text, reward } = spinSlot();
    total += reward;
    log += `【${i+1}回目】\n${text}\n\n`;
  }

  userCoins[userId] += total;
await saveCoins();
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(
`${log}
💰 合計 +${total}
🪙 残り：${userCoins[userId]}`
      )]
    },
    { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
  );
}
else if (userText === "/rank") {

  const text = await getRankingWithMe(userId);

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
}
else if (userText === "/rate") {

  const text =
`🎰 スロット確率・配当表

【図柄揃い確率】
🎉 3つ揃い：4.00%（1/25）
✨ 2つ揃い：48.00%（12/25）
😢 ハズレ：48.00%
機械割120%

【内訳（3つ揃い）】
7️⃣ 777：0.80%（1/125）
⭐ スター：0.80%（1/125）
その他：2.40%（3/125）

【配当】
7️⃣ → 3000コイン
⭐ → 1500コイン
その他3つ → 500コイン
2つ揃い → 25コイン`;
  
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
}
else if (userText === "/slot100") {
  const cost = 50 * 100;

  if (userCoins[userId] < cost) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("コイン足りない😢")]
      },
      { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
    );
    return;
  }

  userCoins[userId] -= cost;

  let total = 0;
  let jackpot = 0;

  for (let i = 0; i < 100; i++) {
    const { text, reward } = spinSlot();
    total += reward;

    if (text.includes("777")) jackpot++;
  }

  userCoins[userId] += total;
await saveCoins();
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(
`🎰 100連結果

🎉 777回数：${jackpot}
💰 合計 +${total}
🪙 残り：${userCoins[userId]}`
      )]
    },
    { headers: { "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}` } }
  );
}
else if (userText === "/coin") {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [createQuickReplyMessage(`🪙 ${userCoins[userId]}コイン`)]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (userText === "/daily") {

  const userData = await getUserData(userId);

  const now = Date.now();

  if (
    userData.lastDaily &&
    now - userData.lastDaily < 86400000
  ) {

    const remain =
      86400000 - (now - userData.lastDaily);

    const hour = Math.floor(remain / 3600000);

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: `⏳ あと${hour}時間待って！`
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  userCoins[userId] += 1000;

  await saveCoins();

  await saveUserData(userId, {
    lastDaily: now
  });

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text: "🎁 デイリーボーナス！\n💰 +1000コイン"
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
else if (userText === "/gacha") {

  const cost = 300;

  if (userCoins[userId] < cost) {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [createQuickReplyMessage("コイン足りない😢")]
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

  userCoins[userId] -= cost;

  const result = pullTitleGacha();

  if (!userOwnedTitles[userId]) {
  userOwnedTitles[userId] = [];
}

if (!userOwnedTitles[userId].includes(result.name)) {
  userOwnedTitles[userId].push(result.name);
}

userTitles[userId] = result.name;

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [
        createQuickReplyMessage(
`🎉 称号獲得！

【${result.rarity}】
👑 ${result.name}

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
  else if (userText === "/titles") {

  const owned = userOwnedTitles[userId] || [];

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`👑 所持称号

${owned.map(t => "・" + t).join("\n")}`
      }]
    },
    {
      headers: {
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
    else if (userText.startsWith("/equip")) {

  const titleName =
    userText.replace("/equip", "").trim();

  if (
    !userOwnedTitles[userId] ||
    !userOwnedTitles[userId].includes(titleName)
  ) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "その称号持ってない😢"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  userTitles[userId] = titleName;

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`👑 称号変更！

現在：
【${titleName}】`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}


// カードを引く
function drawCard() {
  return Math.floor(Math.random() * 10) + 1;
}

// 合計
function getTotal(cards) {
  return cards.reduce((a, b) => a + b, 0);
}

// 倍率計算（機械割100%）
function getMultiplier(winRate) {
  return Math.floor((1 / winRate) * 100) / 100;
}

// 賭け額変更
else if (userText.startsWith("/bet")) {

  const amount = parseInt(
    userText.replace("/bet", "").trim()
  );

  if (isNaN(amount) || amount <= 0) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "使い方：/bet 100"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  userBetCoins[userId] = amount;

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`💰 賭け額変更！

現在：${amount}コイン`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

// HIGH&LOW開始
else if (userText === "/highlow") {

  const cost =
    userBetCoins[userId] || 100;

  if (userCoins[userId] < cost) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "コイン足りない😢"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  userCoins[userId] -= cost;

  const current =
    Math.floor(Math.random() * 13) + 1;

  const highWins = 13 - current;
  const lowWins = current - 1;

  const highRate = highWins / 12;
  const lowRate = lowWins / 12;

  const highMulti =
    highRate > 0
      ? getMultiplier(highRate)
      : 0;

  const lowMulti =
    lowRate > 0
      ? getMultiplier(lowRate)
      : 0;

  highLowData[userId] = {
    current,
    cost
  };

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`🎴 HIGH&LOW

現在の数字：${current}

📈 HIGH → ${highMulti}倍
📉 LOW → ${lowMulti}倍

💰 賭け額：${cost}

選んで！
/high
/low`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

// HIGH or LOW
else if (
  userText === "/high" ||
  userText === "/low"
) {

  if (!highLowData[userId]) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text:
"/highlow を先にして！"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  const current =
    highLowData[userId].current;

  const cost =
    highLowData[userId].cost;

  const next =
    Math.floor(Math.random() * 13) + 1;

  let win = false;

  if (
    userText === "/high" &&
    next > current
  ) {
    win = true;
  }

  if (
    userText === "/low" &&
    next < current
  ) {
    win = true;
  }

  const highWins = 13 - current;
  const lowWins = current - 1;

  const highRate = highWins / 12;
  const lowRate = lowWins / 12;

  const highMulti =
    highRate > 0
      ? getMultiplier(highRate)
      : 0;

  const lowMulti =
    lowRate > 0
      ? getMultiplier(lowRate)
      : 0;

  let reward = 0;

  if (win) {

    const multi =
      userText === "/high"
        ? highMulti
        : lowMulti;

    reward =
      Math.floor(cost * multi);

    userCoins[userId] += reward;
  }

  delete highLowData[userId];

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`🎴 ${current} → ${next}

${win ? "🎉 WIN!" : "😢 LOSE"}

💰 ${
  win
    ? "+" + reward
    : "-" + cost
}

🪙 残り：${userCoins[userId]}`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
  // BLACKJACK開始
else if (userText === "/blackjack") {

  // HIGH&LOWと同じ掛け金
  const cost =
    userBetCoins[userId] || 100;

  if (userCoins[userId] < cost) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text: "コイン足りない😢"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  userCoins[userId] -= cost;

  // 初期カード
  const player = [
    drawCard(),
    drawCard()
  ];

  const dealer = [
    drawCard(),
    drawCard()
  ];

  blackjackData[userId] = {
    player,
    dealer,
    cost
  };

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`🃏 BLACKJACK

あなた：
${player.join(" , ")}
合計：${getTotal(player)}

ディーラー：
${dealer[0]} , ?

💰 掛け金：${cost}

コマンド：
/hit
/stand`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

// HIT
else if (userText === "/hit") {

  if (!blackjackData[userId]) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text:
"/blackjack を先にして！"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  const data = blackjackData[userId];

  data.player.push(drawCard());

  const total =
    getTotal(data.player);

  // バースト
  if (total > 21) {

    delete blackjackData[userId];

    await saveCoins();

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text:
`💥 BUST!

${data.player.join(" , ")}
合計：${total}

😢 負け

🪙 残り：${userCoins[userId]}`
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`🃏 HIT!

${data.player.join(" , ")}
合計：${total}

/hit
/stand`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

// STAND
else if (userText === "/stand") {

  if (!blackjackData[userId]) {

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{
          type: "text",
          text:
"/blackjack を先にして！"
        }]
      },
      {
        headers: {
          "Authorization":
            `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    return;
  }

  const data = blackjackData[userId];

  // ディーラーは17以上まで引く
  while (
    getTotal(data.dealer) < 17
  ) {
    data.dealer.push(drawCard());
  }

  const playerTotal =
    getTotal(data.player);

  const dealerTotal =
    getTotal(data.dealer);

  let result = "😢 負け";
  let reward = 0;

  // 勝ち
  if (
    dealerTotal > 21 ||
    playerTotal > dealerTotal
  ) {

    result = "🎉 勝ち！";

    // 2倍返し
    reward = data.cost * 2;
  }

  // 引き分け
  else if (
    playerTotal === dealerTotal
  ) {

    result = "🤝 引き分け";

    // 掛け金返却
    reward = data.cost;
  }

  userCoins[userId] += reward;

  delete blackjackData[userId];

  await saveCoins();

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{
        type: "text",
        text:
`🃏 BLACKJACK結果

あなた：
${data.player.join(" , ")}
合計：${playerTotal}

ディーラー：
${data.dealer.join(" , ")}
合計：${dealerTotal}

${result}

💰 ${
  reward > 0
    ? "+" + reward
    : "-" + data.cost
}

🪙 残り：${userCoins[userId]}`
      }]
    },
    {
      headers: {
        "Authorization":
          `Bearer ${CHANNEL_ACCESS_TOKEN}`
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

loadCoins().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("起動！");
  });
});
