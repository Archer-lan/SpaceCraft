//全局变量

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
const modelNames=[];
const guiParams = {
    mode: "0",//调整观看模式，当mode为0时是自由视角，mode为1是视角锁定为航天器
    sceneRotate: true, //场景是否旋转
    sceneRotateSpeed: 0.05, //场景旋转速度
    model: "whole",//设置锁定视角时，观察和控制的模型对象
}
export { guiParams, modelNames, models, three };

