const axios = require('axios');
const {kblText2Flex} = require('./FlexMsg');
const kblNum = require('./data/kblNum.json');
const {log} = require('handlebars/runtime');
require('dotenv').config();

const apiUrl = process.env.KBL_DICTIONARY;

/**
 * 取得 Gsheet 的資料
 * @param {string} msgParam | messageText(轉換後)
 * @param {string} type | kebalan, chinese
 * @returns
 */
const getGsheetDicItem = async (msgParam, type) => {
  try {
    console.log(`${apiUrl}?${type}=${msgParam}`);
    const response = await axios.get(`${apiUrl}?${type}=${msgParam}`);
    const dataItem = response.data.find(
      (item) => item.kebalan === msgParam || item.chinese === msgParam
    );

    console.log(`dataItem: ${dataItem}`);
    return dataItem;
  } catch (error) {
    console.error('發生錯誤:', error);
    throw error;
  }
};

const msgType = (messageText) => {
  if (!isNaN(Number(messageText))) return 'arab_number';
  if (/[\u4E00-\u9FA5]/.test(messageText)) return 'chinese_string';
  return 'kebalan_string';
};

/**
 *
 * @param {string} messageText 用戶請求訊息
 * @returns
 */
const handleSheetDataByAxios = async (messageText) => {
  let data = {kebalan: '', chinese: ''};

  switch (msgType(messageText)) {
    case 'arab_number':
      const num2KblObj = kblNum.find(({num}) => num == messageText);
      if (num2KblObj) {
        data = (await getGsheetDicItem(num2KblObj.text, 'kebalan')) || data;
      }
      break;

    case 'chinese_string':
      const chData = await getGsheetDicItem(messageText, 'chinese');
      data = chData || data;
      break;

    case 'kebalan_string':
      const kblData = await getGsheetDicItem(messageText, 'kebalan');
      data = kblData || data;
      break;

    default:
      console.log('錯誤或不包含以上型別');
      break;
  }

  const {kebalan, chinese} = data;
  return {
    resText: kblText2Flex(
      messageText,
      (kebalan || '123').toLowerCase().replace('r', 'R'),
      chinese || '123'
    ),
    kblText: (kebalan || '123').toLowerCase().replace('r', 'R'),
  };
};

module.exports = {
  handleSheetDataByAxios,
};
