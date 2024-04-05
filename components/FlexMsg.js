/**
 * FlexMessage 產生
 * @param {*} messageText 請求訊息
 * @param {*} num 數字
 * @param {*} kbl 族語
 * @param {*} ch 中文
 * @returns 
 */
function kblText2Flex(messageText, kbl, ch) {
  let result = {
    type: 'carousel',
    contents: [
      // 第一個
      {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `🔎 ${messageText}`,
              offsetTop: 'lg',
              position: 'absolute',
              size: 'md',
              offsetStart: 'xxl',
            },
          ],
          maxHeight: '1px',
        },
        hero: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              contents: [],
              backgroundColor: '#162C78',
              height: '15px',
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [],
              backgroundColor: '#000000',
              height: '10px',
            },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'lg',
          contents: [
            {
              type: 'text',
              size: 'lg',
              weight: 'bold',
              contents: [
                {
                  type: 'span',
                  text: `${kbl || 'N/A'}`,
                },
                {
                  type: 'span',
                  text: `${isNaN(Number(messageText)) ?  '' : '  【' + messageText + '】'}  `, // 非數字與否
                },
              ],
            },
            {
              type: 'separator',
            },
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: `${ch || 'N/A'}`,
                  size: 'lg',
                  weight: 'bold',
                  contents: [],
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [],
        },
        styles: {
          header: {
            backgroundColor: '#E7D5BF',
            separator: false,
          },
          footer: {
            backgroundColor: '#000000',
          },
        },
      },
      // 第二個
      // {
      //   "type": "bubble",
      //   "body": {
      //     "type": "box",
      //     "layout": "vertical",
      //     "contents": [
      //       {
      //         "type": "image",
      //         "url": "https://lh3.googleusercontent.com/pw/AIL4fc_Q_wzToOSzmyF9-MItBbNh9m73DQvMn3MCnnfYAXDUTCFsbHA_wtKj6T02PtZ4pDSO-jO9PmHZW-TckM3Sr_3JkySct1ln37WyuSGtRC_ERrPmdqw=w2400",
      //         "size": "5xl",
      //         "aspectMode": "cover",
      //         "aspectRatio": "1:1",
      //         "gravity": "center"
      //       }
      //     ],
      //     "paddingAll": "0px",
      //   },
      //   "styles": {
      //     "body": {
      //       "backgroundColor": "#000000"
      //     }
      //   }
      // }
      // 第二個 End
    ],
  };

  return result;
}

module.exports = {kblText2Flex};
