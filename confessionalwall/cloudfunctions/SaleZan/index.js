// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: 'lp-baoq8'
});
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     const id = event.id;
     const praiseNum = event.praise_number;
     const praise = event.praise;
     const url = event.praiseUrl;
     const name = event.praiseName;
     db.collection('saleFriend').doc(id).update({
          data:{
               praise_number:praiseNum
          }
     });
     return await db.collection('praise').add({
          data: {
               id: id,
               praiseOpenid: praise,
               praiseUrl: url,
               praiseName: name
          }
     })
}