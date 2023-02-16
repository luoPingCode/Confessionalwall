// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: 'lp-baoq8'
})
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     const openid = wxContext.OPENID;
     const confessionType = event.confessionType;
     const start = event.start;
     const searchMan = await db.collection('confessionContents').aggregate()
          .lookup({ //连表查询
               from: 'comment',
               localField: '_id',
               foreignField: 'id',
               as: 'comments',
          }).match({
               confessionType: _.eq(confessionType)
          }).skip(start).limit(8).sort({
               fessionTime: -1
          }).end();
     let professions = searchMan.list;
     if (professions.length > 0) {
          professions.forEach((profession, index) => {
               profession.isPraise = false;
               profession.isStart = false
               console.log(profession)
               if (profession.praises && profession.praises.length > 0) {
                    profession.praises.forEach((praise, index) => {
                         if (praise.openId === openid) {
                              profession.isPraise = true;//是否点过赞
                         }
                    })
               }
               // 收藏
               if (profession.start && profession.start.length > 0) {
                    profession.start.forEach((startData, index) => {
                         if (startData.openId == openid) {
                              profession.isStart = true
                         }
                    });
               }
          });
     }
     return professions
}