// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'lp-baoq8'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const professionId = event.professionId ;
  const praise = event.praise;
  const praiseInfor = event.praiseInfor;
  //const isPraise = event.isPraise;
  console.log(praise);
  if(praise){//如果为true 就点赞
     return await db.collection("confessionContents").doc(professionId).update({//异步返回数据
    data:{
      "praises":_.push(praiseInfor),
      "isPraise":true
    }
  })
  }else{
    //获取墙中点赞数组,根据墙Id查询集合中praises的数据
    const praiseRes = await db.collection("confessionContents").doc(professionId).field({
      praises:true
    }).get();
    console.log(praiseRes.data)
    const praises = praiseRes.data.praises;
    let newPraises = [];
    //循环praises ，删掉我的openId
    praises.forEach((praise,index) =>{
      if(praise.openId != openid){//不等，添加到newPraise中
        newPraises.push(praise)
      }
    })
    //把newPraises设置到数据库中
    return await db.collection("confessionContents").doc(professionId).update({
      data:{
        "praises":newPraises,
        "isPraise":false
      }
    })
  }
 
}