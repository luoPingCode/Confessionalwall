// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env:'lp-baoq8'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext();
     const openid = wxContext.OPENID;
     const type = event.type;
     return await db.collection('myCollect').where({
          _openid:openid,
          'startItem.typeWall':type
     }).orderBy('startTime',"desc").get()
}