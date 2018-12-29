import { ClassicModel } from '../../models/classic.js'
import { LikeModel } from '../../models/like.js'
let classicModel = new ClassicModel()
let likeModel = new LikeModel()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classic: null,
    latest:true,
    first:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    classicModel.getLatest(res=>{
      console.log(res)
      this.setData({
        classic: res
      })
    })
  },
  // 喜欢或者不喜欢
  onLike: function(e) {
    let behavior = e.detail.behavior
    likeModel.like(behavior, this.data.classic.id,this.data.classic.type)
  },
  // 下一期刊
  onNext: function (event) {
    
  },
  // 下一期刊
  onPrevious: function (event) {
    
  }
})