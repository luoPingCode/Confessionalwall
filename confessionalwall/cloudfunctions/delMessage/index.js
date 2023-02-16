// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const id = event.id;
  const allDelete = event.allDelete;
  try{
    if(allDelete){
      // 删除所有信息
    return await db.collection('messageContent').where({
      userId:openid
    }).remove()
    }else{
      //根据id删除消息数据
    return await db.collection('messageContent').doc(id).remove();
    }
    
  }catch(e){
    console.log(e)
  }
}