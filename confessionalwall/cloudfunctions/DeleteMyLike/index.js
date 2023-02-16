// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: 'lp-baoq8'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     const openid = wxContext.OPENID;
     const id = event.id
     const r = await db.collection('myLike').where({
          saleid: id,
          _openid: openid
     }).remove();
     const res = await db.collection('praise').where({
          id: id,
          praiseOpenid: openid
     }).remove();
     return {
          r,
          res
     }
}