
import Transform from "./utils/transform.js";
//全局变量
const three = {
    camera:null,
    scene:null,
    renderer:null,
    controls:null,
    gui:null,
}
//对应场景中的所有模型
const models={
    Sphere:null,
}
//模型名称列表
const modelNames=[];

//坐标转换器，经纬度转空间坐标系，空间坐标系转经纬度
const transform = new Transform();

const guiParams = {
    mode: "0",//调整观看模式，当mode为0时是自由视角，mode为1是视角锁定为航天器
    playState:'0',//动画播放状态
    playSpeed:1,//播放速度
    start:function(){
        this.playState='0'//开始播放
    },
    stop:function(){
        this.playState='1'//暂停
    },
    reset:function(){
        this.playState='2'//重置
    },

    sceneRotate: true, //场景是否旋转
    sceneRotateSpeed: 0.01, //场景旋转速度
    model: "whole",//设置锁定视角时，观察和控制的模型对象
}
export { guiParams, modelNames, models, three, transform };

