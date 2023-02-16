// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lp-baoq8'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const id = event.id
  const type = event.type;
  try {
    //comments.time = db.serverDate()
    if ('wall' == type) {
      return await db.collection('confessionContents').aggregate()
        .lookup({
          from: 'comment',
          localField: '_id',
          foreignField: 'id',
          as: 'comments',
        }).match({
          _id: id
        }).end();
    } else {
      return await db.collection('topics').aggregate()
        .lookup({
          from: 'comment',
          localField: '_id',
          foreignField: 'id',
          as: 'comments',
        }).match({
          _id: id
        }).end()
    }
  } catch (e) {
    console.log(e)
  }

}