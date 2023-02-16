// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'lp-baoq8'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const start = event.start;
  const type = event.type;
  let confession;
  //返回根据openID查询到的数据
  if (type == 'wall') {//表白墙
    confession = db.collection("confessionContents").aggregate()
    .lookup({
      from: 'comment',
      localField: '_id',
      foreignField: 'id',
      as: 'comments',
    })
    if (start > 0) {
      confession = confession.skip(start);//跳过指定的多少数据
    }
    return await confession.sort({
      fessionTime: -1
    }).match({
      _openid: openid
    }).end()
  } else {//卖友
    confession = db.collection("saleFriend").aggregate()
    .lookup({
      from: 'comment',
      localField: '_id',
      foreignField: 'id',
      as: 'comments',
    }).lookup({
      from: 'praise',
      localField: '_id',
      foreignField: 'id',
      as: 'praise',
    });
    if (start > 0) {
      confession = confession.skip(start);//跳过指定的多少数据
    }
    const topics = confession.limit(8).sort({
      created_at: -1
    }).match({
      _openid: openid
    }).end();
    const topicProfessions = (await topics).list
    if (topicProfessions.length > 0) {
      topicProfessions.forEach((topicProfession, index) => {
        topicProfession.isPraise = false;
        topicProfession.isStart = false;
        console.log(topicProfession)
        // 点赞
        if (topicProfession.praises && topicProfession.praises.length > 0) {
          topicProfession.praises.forEach((praise, index) => {
            if (praise.openId === openid) {
              topicProfession.isPraise = true;//是否点过赞
            }
          })
        }
        // 收藏
        if (topicProfession.start && topicProfession.start.length > 0) {
          topicProfession.start.forEach((starts, index) => {
            if (starts.openId === openid) {
              topicProfession.isStart = true
            }
          })
        }
      })
    }
    return topicProfessions;
  }
}