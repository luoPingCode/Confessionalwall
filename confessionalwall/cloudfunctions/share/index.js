// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext();
     const type = event.typeWall;
     const _id = event.id;
     const transmit = event.transmit;
     const transmits = _.push(transmit);
     const shareNum = event.shareNum; 
     if(type == 'wall'){//表白墙的转发
          return await db.collection('confessionContents').doc(_id).update({
               data:{
                  transmit: transmits,
                  transmitNum: shareNum
               } 
          })
     }else{//话题的转发
          return await db.collection('topics').doc(_id).update({
               data:{
                  transmit: transmits,
                  transmitNum: shareNum
               }
          })
     }
      
}