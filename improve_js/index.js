import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js"

import { Sphere,Map } from "./load/loadScene.js"
import Craft from "./load/loadCraft.js"
import {distanceToCenter} from "./utils/distance.js"
import Line from "./utils/line.js"
import Transform from "./utils/transform.js"

let camera,scene,renderer,controls;

const radius = 150;//地球模型半径
const trans = new Transform(radius);
const line = new Line();
const craft = new Craft()

init();
async function init(){
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.25,1000);
    camera.position.set(0,0,200);

    scene = Sphere;

    //生成曲线
    line.addPoint({
        x:0,
        y:100,
        z:0,
    })
    line.addPoint({
        x:0,
        y:150,
        z:0,
    })
    const sphereLine = line.generateLine();
    const sphereCircle = line.generateCircle();
    scene.add(sphereLine.curve);
    scene.add(sphereCircle.circle);
    // await craft.loadModel(scene);
    // scene.add(craft.model);
    craft.loadModel(scene);
    

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera,renderer.domElement);
    //相机自旋转
    controls.autoRotate=true;
    controls.autoRotateSpeed=0.05;
    
    controls.minDistance=30;
    controls.maxDistance=500;
    controls.target.set(0,0,0);
    controls.update();

    window.addEventListener("resize",onWindowResize);
    requestAnimationFrame(render);
}

function render(){
    changeScene();
    controls.update();
    renderer.render(scene,camera);
    requestAnimationFrame(render);
}

function changeScene(){
    let distance;
    if(scene===Sphere){
        distance=distanceToCenter([camera.position.x,camera.position.y,camera.position.z])

        if(distance<130){
            //空间坐标转为经纬度
            let latlng=trans.spatialCoordToLatLng({
                x:camera.position.x,
                y:camera.position.y,
                z:camera.position.z
            })
            //经纬度转为二维平面坐标系
            let point = trans.latlngToMercator({
                latitude:latlng.latitude,
                longitude:latlng.longitude
            })

            controls.target.set(point.x, point.y,0);
            camera.position.set(point.x, point.y,150);
            scene=Map;

            controls.autoRotate=false;
        }
    }else if(scene===Map){
        //平面地图平移后，控制目标的中心点也会变，取相机到中心点的距离为判定条件
        distance=distanceToCenter([camera.position.x,camera.position.y,camera.position.z]
            ,[controls.target.x,controls.target.y,controls.target.z]);

        if(distance>250){
            //二维平面坐标系转经纬度
            let latlng=trans.MercatorToLatLng({
                x:controls.target.x,
                y:controls.target.y,
            })
            //经纬度转空间坐标系
            let point=trans.latlngToSpatialCoord({
                latitude:latlng.latitude,
                longitude:latlng.longitude
            })
            controls.target.set(0,0,0);
            camera.position.set(point.x,point.y,point.z)
            scene = Sphere;

            controls.autoRotate=true;
            controls.autoRotateSpeed=0.05;
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}