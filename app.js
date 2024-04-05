const {Client, middleware} = require('@line/bot-sdk');
const express = require('express');
const https = require('https');
const ReplyText = require('./components/replyText.js');
const {log} = require('handlebars/runtime');
require('dotenv').config();

// 取代特殊發音參數
const replaceSpecialAudioParam = (messageText) => {
  const audioParamList = [
    {oldParam: 'usepat', newParam: 'usepatan'},
    {oldParam: 'unem', newParam: 'unnem'},
  ];

  for (const paramObj of audioParamList) {
    if (paramObj.oldParam === messageText) {
      return paramObj.newParam;
    }
  }
  return messageText;
};

// 配置 Line Bot
let config = {};
let isTest = 0; // 0:測試 1: 正式
if (isTest == 0) {
  // 測試機
  config = {
    channelId: process.env.TEST_CHANNEL_ID,
    channelSecret: process.env.TEST_CHANNEL_SECRET,
    channelAccessToken: process.env.TEST_CHANNEL_ACCESS_TOKEN,
  };
} else {
  // 正式機
  config = {
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  };
}

const client = new Client(config);
const app = express();
// Line Bot 的 Webhook 路徑
const lineWebhookPath = '/linewebhook';

// 設定 middleware 處理訊息事件
app.post('/', middleware(config), async (req, res) => {
  res.status(200).end();
});

// 取得音訊檔URL
const setAudioURL = (messageText) => {
  let audioURL = `https://e-dictionary.ilrdf.org.tw/MultiMedia/audio/ckv/${messageText}_%7B1%7D.mp3`;
  console.log('音訊URL: ', audioURL);
  return audioURL;
};

/**
 * 取得音訊檔
 * @param {*} events
 * @param {string} messageText
 * @param {string} audioURL
 */
const setAudioMsg = (sentMessage, messageText, audioURL) => {
    return new Promise((resolve, reject) => {
      https.get(audioURL, function (response) {
        console.log('https音訊URL', audioURL);
        if (response.statusCode == 200) {
          if (sentMessage.length > 0) {
            sentMessage.push({
              type: 'audio',
              originalContentUrl: audioURL,
              duration: 1000,
            });
          } else {
            let modifiedText = messageText
              .toLowerCase()
              .split('')
              .map(function (char) {
                return char === 'r' ? 'R' : char;
              })
              .join('');
  
            sentMessage.push({
              type: 'text',
              text: modifiedText,
            });
  
            sentMessage.push({
              type: 'audio',
              originalContentUrl: audioURL,
              duration: 1000,
            });
          }
          resolve(sentMessage);
        } else {
          console.error('查無此發音');
          reject('查無此發音');
        }
      }).on('error', function (error) {
        console.error('錯誤 :', error.status);
        reject(error.status);
      });
    });
  };
    
// 使用 Line middleware 處理訊息事件
app.post(lineWebhookPath, express.json(), async (req, res) => {
  res.status(200).end();
  const events = req.body.events;
  // 初始化訊息陣列
  let sentMessage = [];
  let kebalanText = '';

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      let messageText = event.message.text.trim();
      console.log('訊息文字: ', messageText);

      // 處理回覆文字
      await ReplyText.handleSheetDataByAxios(messageText)
        .then(async (response) => {
          console.log('回覆文字: ', response);

          if (!response || !response.kblText || !response.resText) {
            console.log('回覆文字不完整或不存在');
            return;
          }

          // 資料查詢成功
          if (response.kblText) {
            kebalanText = response.kblText;
          }

          let responseResText = response.resText;
          console.log('回覆文字: ', responseResText);

          if (responseResText) {
            sentMessage.push({
              type: 'flex',
              altText: '彈性訊息',
              contents: responseResText,
            });
          } else {
            console.log('沒有相關詞彙');
          }

          // 設定音訊參數
          let audioParam = messageText;
          if (kebalanText != '' && kebalanText != undefined) {
            audioParam = replaceSpecialAudioParam(
              kebalanText != '' ? kebalanText : messageText
            );
          } else {
            audioParam = messageText;
          }

          let audioURL = setAudioURL(audioParam);
         await setAudioMsg(sentMessage, messageText, audioURL);
          console.log(`sentMessage: `, sentMessage);
        //   sentMessage.push(audioRequest);

          try {
            client.replyMessage(event.replyToken, sentMessage);
          } catch (error) {
            console.log(error.data);
          }
        })
        .catch((err) => {
          console.log('client.replyMessage 錯誤', err.data);
        });
    }
  }
});

// 啟動伺服器
const port = process.env.PORT || 8080 || 3000;
app.listen(port, () => {
  console.log(`[機器人已準備完成 PORT: ${port}]`);
});
