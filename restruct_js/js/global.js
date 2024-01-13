//全局变量
import * as THREE from 'three';
import Transform from '../utils/transform.js';

const three={
    camera:null,
    scene:null,
    renderer:null,
    controls:null,
    gui:null,
}
//分别对应两个场景下所有模型
const models={
    Map:null,
    Sphere:null,
}
//模型名称列表
const modelNames=[];

//地图坐标系转换器
const transform = new Transform();

//时钟
const clock = new THREE.Clock();

//gui参数
const guiParams = {
    mode: "0",//调整观看模式，当mode为0时是自由视角，mode为1是视角锁定为航天器
    playState:'0',//动画播放状态
    playSpeed:0.01,//播放速度
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
    sceneRotateSpeed: 0.05, //场景旋转速度
    model: "whole",//设置锁定视角时，观察和控制的模型对象
}
export { clock, guiParams, modelNames, models, three, transform };

