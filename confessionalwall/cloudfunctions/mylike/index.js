// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
     const resData = event.resData;
     let likeData = [];
     for (let i = resData.length; i--;) {
          const data = await db.collection('saleFriend').aggregate()
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
                    _id: _.eq(resData[i].saleid)
               }).end();
          likeData = likeData.concat(data.list)
     }
     return likeData
}