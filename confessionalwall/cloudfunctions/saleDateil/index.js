// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env:'lp-baoq8'
})
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext();
     const openid = wxContext.OPENID;
     const id = event.id;
     return await db.collection('saleFriend').aggregate()
     .lookup({ //连表查询
          from: 'comment',
          localField: '_id',
          foreignField: 'id',
          as: 'comments',
     }).lookup({ //连表查询
          from: 'praise',
          localField: '_id',
          foreignField: 'id',
          as: 'praises',
     }).match({
          _id: _.eq(id)
     }).end();
}