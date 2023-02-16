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
     const userInfo = event.userInfo;
     const _id = event.id;
     const startNum = event.startNum;
     const type = event.type;
     const isCollect = event.isCollect;//收藏或取消收藏
     try{
          if(isCollect){//收藏
               if(type == 'wall'){//表白墙
                    return await db.collection('confessionContents').doc(_id).update({
                         data:{
                              start:_.push(userInfo),
                              isStart:isCollect,
                              startNum:startNum
                         }
                    })
               }else{//话题
                    return await db.collection('topics').doc(_id).update({
                         data:{
                              start:_.push(userInfo),
                              isStart:isCollect,
                              startNum:startNum
                         }
                    })
               }
          }else{//取消收藏
               if(type == 'wall'){ //表白墙
                    const dataRes = await db.collection('confessionContents').doc(_id).field({
                         start:true
                    }).get();//获取start数据
                    console.log(dataRes);
                    const confessionItem = dataRes.data;
                    const start = confessionItem.start;
                    let newStart = [];
                    if(start.length >0){
                         start.forEach((sta,index) =>{
                              if(sta.openId != openid){
                                   newStart.push(sta)
                              }
                         });
                    }
                    // 更新数据库
                    return await db.collection('confessionContents').doc(_id).update({
                         data:{
                              start:newStart,
                              startNum:newStart.length,
                              isStart:isCollect
                         }
                    });
               }else if(type == 'topic'){//话题4
                    const dataRes = await db.collection('topics').doc(_id).field({
                         start:true
                    }).get();//获取start数据
                    console.log(dataRes);
                    const confessionItem = dataRes.data;
                    const start = confessionItem.start;
                    let newStart = [];
                    if(start.length >0){
                         start.forEach((sta,index) =>{
                              if(sta.openId != openid){
                                   newStart.push(sta)
                              }
                         });
                    }
                    // 更新数据库
                    return await db.collection('topics').doc(_id).update({
                         data:{
                              start:newStart,
                              startNum:newStart.length,
                              isStart:isCollect
                         }
                    });
               }
          }
     }catch(e){
          console.log(e)
     } 
}