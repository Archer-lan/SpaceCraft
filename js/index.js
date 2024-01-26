import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/dat.gui.module.js";

import { guiParams, modelNames, models, three, transform } from "./global.js";
import Obj from "./obj/object.js";
import Objects from './obj/objects.js';
import Sphere from "./scene/loadScene.js";
import Line from "./utils/line.js";

init();

async function init(){
    //初始化数据
    modelNames.push(...Object.keys(data));
    guiParams.model=modelNames[0];
    data = transformData(data);

    //初始化three场景参数
    initScene({
        x: data[guiParams.model][0].position.x,
        y: data[guiParams.model][0].position.y,
        z: data[guiParams.model][0].position.z + 5
    });

    //初始化gui界面
    guiSetting();

    //创建模型
    models.Sphere=await createObject(Sphere,data);
    console.log(models);

    //将Sphere置为场景
    three.scene = Sphere;

    //初始化控制参数
    initControls();

    window.addEventListener("resize",onWindowResize);
    requestAnimationFrame(render);
}

function render(){

    renderControl();

    three.controls.update();
    three.renderer.render(three.scene,three.camera);
    requestAnimationFrame(render);
}


/**
 * 循环渲染控制，模型运动与旋转控制
 */

function renderControl(){
    let changeFlag=false;
    models.Sphere.objects.forEach((model,index)=>{
        if(model.mesh.visible===true){
            if(guiParams.mode==='0'){
                Objects.moveInFree(model.mesh,model.line.curve,model.index);
            }else{
                if(model.mesh.name===guiParams.model){
                    Objects.moveInLock(model.mesh,model.line.curve,model.index,model.line.number);
                }else{
                    Objects.moveInFree(model.mesh,model.line.curve,model.index);
                }
            }
            Objects.fireMove(model.fire,model.line.curve,model.index);

            Objects.rotate(model.mesh,0.1,0.1,0.1);

            if(guiParams.playState==='2'){
                model.index=0;
                if(index==models.Sphere.objects.length-1){
                    guiParams.playState='0';
                }
            }else if(guiParams.playState==='0'){
                model.index+=1/model.line.number*guiParams.playSpeed;
            }

            if(model.index>=1) {
                changeFlag=true;
                model.index=0;
                if(guiParams.model===modelNames[0]){
                    guiParams.model=modelNames[1];
                }
                if(index===models.Sphere.objects.length-1&&guiParams.model!==modelNames[0]){
                    guiParams.model=modelNames[0];
                }
            }
        }    
    })
    
    models.Sphere.objects.forEach((model)=>{
        if(changeFlag){
            model.mesh.visible=!model.mesh.visible;
            model.fire.visible=!model.fire.visible;
        }
    })

}



/**
 * 初始化three场景参数
 * @param {object} position 相机初始位置 
 */
function initScene(position){
    const container = document.createElement("div");
    document.body.appendChild(container);

    //设置相机
    three.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 10000);
    three.camera.position.set(position.x, position.y, position.z)

    //设置渲染器
    three.renderer = new THREE.WebGLRenderer({ antialias: true });
    three.renderer.setPixelRatio(window.devicePixelRatio);
    three.renderer.setSize(window.innerWidth, window.innerHeight);
    three.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    three.renderer.toneMappingExposure = 1;
    container.appendChild(three.renderer.domElement);

    //设置控制器
    three.controls = new OrbitControls(three.camera, three.renderer.domElement);

    //设置gui界面
    three.gui = new GUI();
}

/**
 * 设置gui界面参数
 */
function guiSetting(){
    const observeFolder = three.gui.addFolder("观看控制");

    observeFolder.add(guiParams, "mode", {
        "锁定视角": 1,
        "自由视角": 0
    }).name("观看模式").onChange(function (value) {
        if (value === "1") {
            three.controls.maxDistance = 500;
            three.controls.minDistance = 5;
        } else {
            three.controls.maxDistance = 500;
            three.controls.minDistance = 105;
        }
        if (value === '0') {
            three.controls.target.set(0, 0, 0);
        }
    });
    observeFolder.add(guiParams, "model", modelNames).name("控制对象")
    observeFolder.add(guiParams, "playSpeed",1,10,1).name("播放速度")
    observeFolder.add(guiParams, "start").name("开始")
    observeFolder.add(guiParams, "stop").name("暂停")
    observeFolder.add(guiParams, "reset").name("重播")

    const rotateFolder = three.gui.addFolder("旋转控制");
    rotateFolder.add(guiParams, "sceneRotate",).name("地球自转").onChange(function (value) {
        three.controls.autoRotate = guiParams.sceneRotate;
    });
    rotateFolder.add(guiParams, "sceneRotateSpeed", 0, 2).name("自转速度").onChange(function (value) {
        three.controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
    }).step(0.01);
}

/**
 * 创建模型管理类，并初始化加载模型，身材隔行坠落轨迹线
 */
async function createObject(scene,data){
    const models=new Objects();

    //遍历所有模型
    for(let key in data){

        //坠落线对应的原始点
        let originPoint = [];
        //创建线类
        let line = new Line();
        data[key].map((d)=>{
            originPoint.push(d['position']);
        })
        //初始化原始点数据
        line.initOriginPoint(originPoint);
        //生成对应线
        line.generateLine();

        //加载模型
        let obj = await Objects.loadObj(key+'.obj',key,
        {
            x:data[key][0]['position'].x,
            y:data[key][0]['position'].y,
            z:data[key][0]['position'].z
        })

        //创建火焰
        let fire = Objects.createFire();
        //设置火焰初始位置
        fire.position.copy(data[key][0]['position']);

        //将吗，模型，火焰，线条加入场景
        scene.add(obj);
        scene.add(line.line);
        scene.add(fire);
        if(key!==guiParams.model){
            obj.visible = false;
            // line.line.visible = false;
            fire.visible = false;
        }

        //创建单个模型管理类
        const model = new Obj();
        model.mesh=obj;
        model.line=line;
        model.fire=fire;

        //放入所有模型的管理
        models.objects.push(model);
    }
    return models;
}

/**
 * 初始化首界面的control控制参数
 */
function initControls(){
    three.controls.autoRotate = guiParams.sceneRotate;
    three.controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
    three.controls.minDistance = 105;
    three.controls.maxDistance = 500;
    three.controls.target.set(0, 0, 0);
    three.controls.update();
}

/**
 * 调整窗口大小跟随浏览器大小变化
 */
function onWindowResize() {
    three.camera.aspect = window.innerWidth / window.innerHeight;
    three.camera.updateProjectionMatrix();

    three.renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 将原始经纬度数据转化为可以使用的空间坐标系数据
 */
function transformData(originData){
    /*
    在Sphere部分的比例尺和在Map部分的比例尺
    由于Sphere部分球体半径为100，地球半径为637100；所以比例尺为637100:100；
    */
    let resData={};
    for(let key in originData){
        let value=[];
        originData[key].map((data)=>{
            let height = Math.floor((data.height - 6371000) / 63710 * 100) / 100;
            transform.radius = height +100;
            let position = transform.latlngToSpatialCoord({
                latitude: data.latitude,
                longitude: data.longitude
            })

            value.push({
                position,
                rotate:{
                    x:data.xRotate,
                    y:data.yRotate,
                    z:data.zRotate
                }
            })
        })
        resData[key] = value; 
    }
    //将上一个完整模型生成的坠落线的最后一个点，加入到分解模型的开头。
    for(let key in resData) {
        if(key!==guiParams.model){
            let length = resData[guiParams.model].length-1
            resData[key].unshift(resData[guiParams.model][length]);
        }
    }
    return resData;
}