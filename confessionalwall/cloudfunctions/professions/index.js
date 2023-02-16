// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lp-baoq8'
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const start = event.start;
  const isHot = event.isHot;
  const condition = event.condition;
  // console.log(condition)
  let confession = db.collection("confessionContents").aggregate()
    .lookup({
      from: 'comment',
      localField: '_id',
      foreignField: 'id',
      as: 'comments',
    }).skip(start).limit(8);
  // if (start >0) {
  //     confession = confession.skip(start);//跳过指定的多少数据
  //   }
  if (isHot) {
    var professionRes = ''
    if (condition == 'a') {
      professionRes = confession.sort({
        praises: -1
      }).end();//降序点赞获取数据
    } else if (condition == 'b') {
      professionRes = confession.sort({
        commentsNum: -1
      }).end();//降序评论获取数据
    } else {
      professionRes = confession.sort({
        transmitNum: -1
      }).end();//降序分享获取数据
    }
    console.log(professionRes)
    const professions = (await professionRes).list;
    if (professions.length > 0) {
      professions.forEach((profession, index) => {
        profession.isPraise = false;
        profession.isStart = false
        console.log(profession)
        // 点赞
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
            if (startData.openId === openid) {
              profession.isStart = true
            }
          })
        }
      })
    }
    return {
      professions
    }
  } else {
    const professionRes = confession.sort({
        fessionTime: -1
      })
      .end();
    console.log(professionRes)
    const professions = (await professionRes).list;
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
          })
        }
      })
    }
    return {
      professions
    }
  }

}