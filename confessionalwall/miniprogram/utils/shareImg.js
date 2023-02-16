// 考虑了有些文字是换行的，安卓和iOS对于换行符的处理不一样，所以需要单独考虑
// canvas绘制文字自动换行
function fillTextToCanvas(cxt, text, beginWidth, beginHeight) {
     const lineLength = 24;// 行高
     let item = '';
     let count = 0;
     const stringLength = text.length;
     const newText = text.split('');
     const context = cxt;
     let beginHeightNew = beginHeight;
     context.textAlign = 'left';
     for (let i = 0; i <= stringLength; i++) {
          if (count === 15) { // count一行显示多少个字
               context.fillText(item, beginWidth, beginHeightNew);
               beginHeightNew += lineLength;
               item = '';
               count = 0;
          }
          if (i === stringLength) {
               context.fillText(item, beginWidth, beginHeightNew);
               item = '';
               count = 0;
          }
          item += newText[0];
          count += 1;
          newText.shift();
     }
}
//  canvas绘制文字自动换行
function drawLongText(longText, cxt, beginWidth, beginHeight) {
     const lines = longText.split('\n');
     const linesLen = lines.length;
     const lineLength = 24;// 行高
     if (linesLen >= 0) {
          for (let t = 0; t < linesLen; t++) {
               const beginHeightNew = beginHeight + lineLength * t;
               fillTextToCanvas(cxt, lines[t], beginWidth, beginHeightNew);
          }
     }
}

// 绘制分享图片
function createSharePicUrl(self, avatar, nickname, time, favoritePerson, content, img, callback) {
     const shareCtx = wx.createCanvasContext('shareCanvas', self);
     shareCtx.rect(0, 0, 250, 200);
     shareCtx.setFillStyle('white');
     // const imgLength = img.length;
     // console.log(imgLength)
     // console.log(img)
     // 画头部个人信息
     wx.downloadFile({
          url: avatar,
          success(res) {
               const avatarWidth = 40; // 绘制的头像宽度
               const avatarHeight = 40; // 绘制的头像高度
               const avatarX = 12; // 绘制的头像在画布上的位置
               const avatarY = 15; // 绘制的头像在画布上的位置
               //const imgArr = [];
               shareCtx.save();
               shareCtx.beginPath(); // 开始绘制
               // 先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
               shareCtx.arc(avatarWidth / 2 + avatarX,
                    avatarHeight / 2 + avatarY,
                    avatarWidth / 2,
                    0,
                    Math.PI * 2,
                    false);
               shareCtx.clip();
               shareCtx.drawImage(res.tempFilePath,
                    avatarX, avatarY,
                    avatarWidth,
                    avatarHeight); // 推进去图片，必须是https图片
               shareCtx.restore(); // 恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
               // 画中间帖子内容
               shareCtx.setTextAlign('left'); // 文字居中
               shareCtx.setFillStyle('#333333');
               shareCtx.setFontSize(15); // 文字字号：15px
               shareCtx.fillText(nickname, 64, 31, 100);
               shareCtx.setFillStyle('#999999');
               shareCtx.setFontSize(12); // 文字字号：12px
               shareCtx.fillText(time, 64, 52, 100);
               shareCtx.setFillStyle('#070707');
               shareCtx.setFontSize(15); // 文字字号：15px
               if (favoritePerson) {
                    shareCtx.fillText('表白@' + favoritePerson, 12, 70, 100);
                    shareCtx.setFillStyle('#070707');
                    shareCtx.setFontSize(13);
               }
               //console.log(img)

               if(img){
                    shareCtx.drawImage(img, 12,100,200,150)
               }
               drawLongText(content, shareCtx, avatarX, 75 + 16);
               shareCtx.draw(false, setTimeout(callback, 200));
          },
     });
     //return shareCtx;
}
module.exports = {
     drawLongText,
     createSharePicUrl,
};