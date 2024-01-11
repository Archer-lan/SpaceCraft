import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/dat.gui.module.js";

import Craft from "./load/loadCraft.js";
import { Map, Sphere } from "./load/loadScene.js";
import { distanceToCenter } from "./utils/distance.js";
import ParticleSystem from "./utils/fire.js";
import Line from "./utils/line.js";
import Transform from "./utils/transform.js";

let camera, scene, renderer, controls, gui;

const trans = new Transform(150);
const craft = new Craft();
const line = new Line();
let modelName = [];
let moveAndControl, move;
let index = 0;//此index为了切换时航天器运动同步
let fire1,fire2;

const guiParams = {
    mode: "0",//调整观看模式，当mode为0时是自由视角，mode为1是视角锁定为航天器
    sceneRotate: true, //场景是否旋转
    sceneRotateSpeed: 0.05, //场景旋转速度
    model: "whole",//设置锁定视角时，观察和控制的模型对象
}

data = transformData(data);

init();

function init() {
    //初始化场景参数，相机位置设置为航天器的位置
    initScene({
        x: data[guiParams.model][0].xSphere,
        y: data[guiParams.model][0].ySphere,
        z: data[guiParams.model][0].zSphere + 5
    })
    guiSetting();

    createLine(Sphere, data[guiParams.model], guiParams.model);
    modelName.map((name) => {
        createLine(Map, data[name], name);
    })

    Sphere.add(line.lines["wholeSphere"].curve);
    Map.add(line.lines["wholeMap"].curve);
    Map.add(line.lines["cabinMap"].curve);
    Map.add(line.lines["solarpanelMap"].curve);

    craft.loadCraft(Sphere, guiParams.model + ".obj", guiParams.model, {
        x: data[guiParams.model][0].xSphere,
        y: data[guiParams.model][0].ySphere,
        z: data[guiParams.model][0].zSphere
    });
    modelName.map((name) => {
        craft.loadCraft(Map, name + ".obj", name, {
            x: data[name][0].xMap,
            y: data[name][0].yMap,
            z: data[name][0].zMap
        })
    })

    scene = Sphere;

    //火焰
    createFire()

    controlsSetting(scene);

    moveAndControl = craft.moveAndControl(camera, controls);
    move = craft.move();

    window.addEventListener("resize", onWindowResize);
    requestAnimationFrame(render);
}

function createFire() {
    fire1 = new ParticleSystem({
        parent: Sphere,
        camera: camera,
        initialPosition: new THREE.Vector3(100, 100, 100),
        initialVelocity: new THREE.Vector3(0, 0, 0),
    })
    fire2 = new ParticleSystem({
        parent: Map,
        camera: camera,
        initialPosition: new THREE.Vector3(100, 100, 100),
        initialVelocity: new THREE.Vector3(0, 0, 0),
    })
}

function render() {
    let s;
    if (guiParams.mode === "0") {
        changeSceneByCamera();
        s = scene === Sphere ? "Sphere" : "Map"
        if (scene === Map) {
            fire2._UpdatePosition(line.lines['whole' + s].points[index],camera)
            fire2.Step(0.017)//每帧间隔17毫秒，大致是60帧每秒
            modelName.map((name) => {
                move(scene, line.lines[name + s].points, name, index);
            })
        }else{
            fire1._UpdatePosition(line.lines['whole' + s].points[index],camera)
            fire1.Step(0.017)//每帧间隔17毫秒，大致是60帧每秒
        }

        index = move(scene, line.lines['whole' + s].points, "whole", index);
    } else if (guiParams.mode === '1') {
        changeSceneByModel();
        s = scene === Sphere ? "Sphere" : "Map"
        if (scene === Map) {
            fire2._UpdatePosition(line.lines['whole' + s].points[index],camera)
            fire2.Step(0.017)//每帧间隔17毫秒，大致是60帧每秒
            modelName.map((name) => {
                if (name !== guiParams.model) {
                    move(scene, line.lines[name + 'Map'].points, name, index);
                }
                craft.rotate(scene, name)
            })
            index = moveAndControl(scene, line.lines[guiParams.model + s].points, guiParams.model, index);
        } else {
            fire1._UpdatePosition(line.lines['whole' + s].points[index],camera)
            fire1.Step(0.017)//每帧间隔17毫秒，大致是60帧每秒
            index = moveAndControl(scene, line.lines['whole' + s].points, "whole", index);
        }
    }

    craft.rotate(scene,"whole")
    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(render)
}

function changeSceneByModel() {
    let distance;
    if (scene === Sphere) {
        scene.children.map((model) => {
            if (model.name === "whole") {
                distance = distanceToCenter([model.position.x, model.position.y, model.position.z])
                if (distance <= 101) {
                    index = 0;
                    camera.position.set(data["whole"][0].xMap, data["whole"][0].yMap, data["whole"][0].zMap)
                    scene = Map;
                }
            }
        })
    }
}

function changeSceneByCamera() {
    let distance;
    if (scene === Sphere) {
        distance = distanceToCenter([camera.position.x, camera.position.y, camera.position.z])
        // console.log(distance);
        if (distance < 130) {
            trans.radius = distance;
            let latlng = trans.spatialCoordToLatLng({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            })
            //经纬度转为二维平面坐标系
            let point = trans.latlngToMercator({
                latitude: latlng.latitude,
                longitude: latlng.longitude
            })

            controls.target.set(point.x, point.y, 0);
            camera.position.set(point.x, point.y, 150);
            scene = Map;

            controls.maxAzimuthAngle = 0.01;
            controls.minAzimuthAngle = -0.01;
            controls.maxPolarAngle = 2.983;
            controls.minPolarAngle = 0.157;
            controls.autoRotate = false;
        }
    } else if (scene === Map) {
        //平面地图平移后，控制目标的中心点也会变，取相机到中心点的距离为判定条件
        distance = distanceToCenter([camera.position.x, camera.position.y, camera.position.z]
            , [controls.target.x, controls.target.y, controls.target.z]);

        if (distance > 200) {
            //二维平面坐标系转经纬度
            trans.radius = 150;
            let latlng = trans.MercatorToLatLng({
                x: controls.target.x,
                y: controls.target.y,
            })
            //经纬度转空间坐标系
            let point = trans.latlngToSpatialCoord({
                latitude: latlng.latitude,
                longitude: latlng.longitude
            })
            controls.target.set(0, 0, 0);
            camera.position.set(point.x, point.y, point.z);

            controls.maxAzimuthAngle = 0;
            controls.minAzimuthAngle = 0;
            controls.maxPolarAngle = 3.14;
            controls.minPolarAngle = 0;
            controls.autoRotate = guiParams.sceneRotate;
            scene = Sphere;
        }
    }
}


/**
 * 调整窗口大小跟随浏览器大小变化
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 
 * @param {Object} scene 场景 
 * @param {Array} points 绘制的点集 
 */
function createLine(scene, points, modelName) {
    if (line == null) {
        line = new Line();
    }
    let s = scene === Sphere ? "Sphere" : "Map"
    line.clearPoints();
    points.map((value) => {
        line.addPoint({
            x: value['x' + s],
            y: value['y' + s],
            z: value['z' + s]
        });
    })
    line.lines[modelName + s] = line.generateLine();
}

/**
 * 初始化渲染场景必要的参数
 * @param {Object} position 相机位置 
 */
function initScene(position) {
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 10000);
    camera.position.set(position.x, position.y, position.z)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
}

/**
 * 配置控制器的参数
 */
function controlsSetting(scene) {
    if (scene === Map) {
        controls.maxAzimuthAngle = 0;
        controls.minAzimuthAngle = (-85 * Math.PI) / 100;
        controls.minDistance = 5;
        controls.maxDistance = 500;
        controls.target.set(0, 0, 0);
        controls.update();
    } else if (scene === Sphere) {
        controls.autoRotate = guiParams.sceneRotate;
        controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
        controls.minDistance = 5;
        controls.maxDistance = 500;
        controls.target.set(0, 0, 0);
        controls.update();
    }
}

/**
 * 配置gui控制的功能
 */
function guiSetting() {
    gui = new GUI();

    const observeFolder = gui.addFolder("观看控制");
    observeFolder.add(guiParams, "mode", {
        "锁定视角": 1,
        "自由视角": 0
    }).name("观看模式").onChange(function (value) {
        if (value === "1") {
            controls.maxDistance = 30;
        } else {
            controls.maxDistance = 500;
        }
        if (value === '0' && scene === Sphere) {
            controls.target.set(0, 0, 0);
        } else if (value === '0' && scene === Map) {
            controls.target.set(camera.position.x, camera.position.y, 0);
        }
    });
    observeFolder.add(guiParams, "model", modelName).name("控制对象").onChange(function (value) {
        camera.position.set(data[value][0].xMap, data[value][0].yMap, data[value][0].zMap)
    });

    const rotateFolder = gui.addFolder("旋转控制");
    rotateFolder.add(guiParams, "sceneRotate",).name("地球自转").onChange(function (value) {
        if (scene === Sphere) {
            controls.autoRotate = guiParams.sceneRotate;
        }
    });
    rotateFolder.add(guiParams, "sceneRotateSpeed", 0, 2).name("自转速度").onChange(function (value) {
        controls.autoRotateSpeed = guiParams.sceneRotateSpeed;
    }).step(0.05);
}

/**
 * 将原原始经纬度数据转化为可以使用的空间坐标系和二维平面坐标系对应数据
 * @param {Object} data 
 * @returns 
 */
function transformData(data) {
    /*
    在Sphere部分的比例尺和在Map部分的比例尺
    由于Sphere部分球体半径为100，地球半径为637100；所以比例尺为637100:100；
    */
    let dataForLines = {};
    for (let key in data) {
        // console.log(key);
        let value = []
        data[key].map((d) => {
            let height = Math.floor((d.height - 6371000) / 63710 * 100) / 100;
            trans.radius = height + 100;
            let posSphere = trans.latlngToSpatialCoord({
                latitude: d.latitude,
                longitude: d.longitude
            })
            let latlng = trans.spatialCoordToLatLng({
                x: posSphere.x,
                y: posSphere.y,
                z: posSphere.z
            })
            let posMap = trans.latlngToMercator({
                latitude: latlng.latitude,
                longitude: latlng.longitude
            })
            value.push({
                xMap: posMap.x,
                yMap: posMap.y,
                zMap: height,
                xSphere: posSphere.x,
                ySphere: posSphere.y,
                zSphere: posSphere.z,
                xRotate: d.xRotate,
                yRotate: d.yRotate,
                zRotate: d.zRotate,
            })
        })
        dataForLines[key] = value;
        modelName.push(key);
    }
    return dataForLines;
}