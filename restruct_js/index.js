import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/dat.gui.module.js";

import { guiParams, modelNames, models, three } from './js/global.js';
import { Map, Sphere } from './js/loadScene.js';
import Obj from './js/objControl/object.js';
import Objects from './js/objControl/objects.js';
import { distanceToCenter } from './utils/distance.js';
import Line from './utils/line.js';
import Transform from './utils/transform.js';

let transform=new Transform();
init();
async function init(){
    //初始化数据
    data = transformData(data);
    console.log(data);
    modelNames.push(...Object.keys(data));
    guiParams.model=modelNames[0];

    //初始化three场景参数
    initScene({
        x: data[guiParams.model][0].Sphere.x,
        y: data[guiParams.model][0].Sphere.y,
        z: data[guiParams.model][0].Sphere.z + 5
    });
    //初始化gui界面
    guiSetting();

    //TODO:存在问题，模型文件加载两次
    //不能实现加载一次模型文件进行复用，three会给每个mesh一个group，当改变原始obj时会影响到另一个scene
    models.Sphere=await createObject(Sphere);
    models.Map=await createObject(Map);

    three.scene = Sphere;

    initControls()

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
 * 循环渲染控制，模型运动与旋转控制，场景切换控制
 */
function renderControl(){
    // let str = three.scene===Map?"Map":"Sphere";
    if(three.scene===Map){
        models.Map.objects.forEach((model)=>{
            if(guiParams.mode==='0'){
                changeSceneInFree();
                model.index=Objects.moveInFree(model.mesh,model.line.points,model.index);
            }else{
                if(model.mesh.name===guiParams.model){
                    model.index=Objects.moveInLock(model.mesh,model.line.points,model.index);
                }else{
                    model.index=Objects.moveInFree(model.mesh,model.line.points,model.index);
                } 
            }
            Objects.rotate(model.mesh,0.1,0.1,0.1);
        })
    }else{
        models.Sphere.objects.forEach((model)=>{
            //针对whole单个模型进行操作
            if(model.mesh.name==='whole'){
                if(guiParams.mode==='0'){
                    changeSceneInFree();
                    model.index=Objects.moveInFree(model.mesh,model.line.points,model.index);
                }else{
                    changeSceneInLock(model.mesh);
                    model.index=Objects.moveInLock(model.mesh,model.line.points,model.index);
                }
                Objects.rotate(model.mesh,0.1,0.1,0.1);
            }
        })
    }
}

/**
 * 在锁定视角下切换场景
 */
function changeSceneInLock(model){
    let distance = distanceToCenter([model.position.x, model.position.y, model.position.z])
    if(distance<101){
        three.camera.position.set(data['whole'][0].Map.x, data['whole'][0].Map.y,data['whole'][0].Map.z)
        three.scene=Map;

        // initControls();
    }
}
/**
 * 在自由视角下切换场景
 */
function changeSceneInFree(){
    let distance;
    if(three.scene===Sphere){
        distance = distanceToCenter([three.camera.position.x,three.camera.position.y,three.camera.position.z])
        if(distance<130){
            transform.radius = distance;
            let latlng = transform.spatialCoordToLatLng({
                x:three.camera.position.x,
                y:three.camera.position.y,
                z:three.camera.position.z
            })
            let point = transform.latlngToMercator({
                latitude:latlng.latitude,
                longitude:latlng.longitude,
            })
            
            three.controls.target.set(point.x, point.y,0);
            three.camera.position.set(point.x, point.y,200);

            three.scene=Map;

            three.controls.maxAzimuthAngle = 0.01;
            three.controls.minAzimuthAngle = -0.01;
            three.controls.maxPolarAngle = 2.983;
            three.controls.minPolarAngle = 0.157;
            three.controls.autoRotate = false;
        }
    }else if(three.scene===Map){
        distance=distanceToCenter([three.camera.position.x, three.camera.position.y, three.camera.position.z]
            , [three.controls.target.x, three.controls.target.y, three.controls.target.z])
        if(distance>200){
            transform.radius = 150
            let latlng=transform.MercatorToLatLng({
                x:three.controls.target.x,
                y:three.controls.target.y
            })
            let point = transform.latlngToSpatialCoord({
                latitude:latlng.latitude,
                longitude:latlng.longitude
            })
            three.controls.target.set(0,0,0);
            three.camera.position.set(point.x, point.y, point.z);

            three.scene=Sphere;

            three.controls.maxAzimuthAngle = 0;
            three.controls.minAzimuthAngle = 0;
            three.controls.maxPolarAngle = 3.14;
            three.controls.minPolarAngle = 0;
            three.controls.autoRotate = guiParams.sceneRotate;
        }
    }
}

/**
 * 创建模型管理类，并初始化加载模型，生成坠落轨迹线
 * @returns 
 */
async function createObject(scene){
    let str = scene===Sphere?"Sphere":"Map";
    const models = new Objects();

    for(let key in data){
        const model = new Obj();
        
        //创建对应的线
        let originPoint = [];
        let line=new Line();

        data[key].map((d)=>{
            originPoint.push(d[str])
        })
        line.initOriginPoint(originPoint);
        line.generateLine();

        //
        let obj=await models.loadObj(key+'.obj',key,{
            x:data[key][0][str].x,
            y:data[key][0][str].y,
            z:data[key][0][str].z
        })

        if(key === 'whole' && scene === Sphere){
            scene.add(obj);
            scene.add(line.line);
        }else if(scene !==Sphere){
            scene.add(obj);
            scene.add(line.line);
        }

        model.mesh = obj;
        model.line = line;

        models.objects.push(model);
    }

    return models;
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
            three.controls.maxDistance = 30;
        } else {
            three.controls.maxDistance = 500;
        }
        if (value === '0' && three.scene === Sphere) {
            three.controls.target.set(0, 0, 0);
        } else if (value === '0' && three.scene === Map) {
            three.controls.target.set(three.camera.position.x, three.camera.position.y, 0);
        }
    });
    observeFolder.add(guiParams, "model", modelNames).name("控制对象");

    const rotateFolder = three.gui.addFolder("旋转控制");
    rotateFolder.add(guiParams, "sceneRotate",).name("地球自转").onChange(function (value) {
        if (three.scene === Sphere) {
            three.controls.autoRotate = guiParams.sceneRotate;
        }
    });
    rotateFolder.add(guiParams, "sceneRotateSpeed", 0, 2).name("自转速度").onChange(function (value) {
        three.controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
    }).step(0.05);
}

/**
 * 初始化首界面的control控制参数
 */
function initControls(){
    if (three.scene === Map) {

        three.controls.maxAzimuthAngle = 0;
        three.controls.minAzimuthAngle = (-85 * Math.PI) / 100;
        three.controls.minDistance = 5;
        three.controls.maxDistance = 500;
        three.controls.target.set(0, 0, 0);
        three.controls.update();
    } else if (three.scene === Sphere) {

        three.controls.autoRotate = guiParams.sceneRotate;
        three.controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
        three.controls.minDistance = 5;
        three.controls.maxDistance = 500;
        three.controls.target.set(0, 0, 0);
        three.controls.update();
    }
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
 * 调整窗口大小跟随浏览器大小变化
 */
function onWindowResize() {
    three.camera.aspect = window.innerWidth / window.innerHeight;
    three.camera.updateProjectionMatrix();

    three.renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 将原原始经纬度数据转化为可以使用的空间坐标系和二维平面坐标系对应数据
 * @param {Object} originData 
 * @returns 
 */
function transformData(originData){
    /*
    在Sphere部分的比例尺和在Map部分的比例尺
    由于Sphere部分球体半径为100，地球半径为637100；所以比例尺为637100:100；
    */
    // let transform = new Transform();
    let resData={};
    for(let key in originData){
        let value =[];
        originData[key].map((d)=>{
            let height =  Math.floor((d.height - 6371000) / 63710 * 100) / 100;
            transform.radius = height + 100//将转换器的半径设为地球半径加转换后的高度

            let posSphere = transform.latlngToSpatialCoord({
                latitude: d.latitude,
                longitude: d.longitude
            })
            let latlng = transform.spatialCoordToLatLng({
                x: posSphere.x,
                y: posSphere.y,
                z: posSphere.z
            })
            let posMap = transform.latlngToMercator({
                latitude: latlng.latitude,
                longitude: latlng.longitude
            })

            value.push({
                Map:{
                    x:posMap.x,
                    y:posMap.y,
                    z:height,
                },
                Sphere:{
                    x:posSphere.x,
                    y:posSphere.y,
                    z:posSphere.z
                },
                Rotate:{
                    x:d.xRotate,
                    y:d.yRotate,
                    z:d.zRotate
                }
            })
        })
        resData[key]=value;
    }
    return resData;
}