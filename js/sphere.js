import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js"
import Curve from "./utils/curve.js";

let sceneSphere = new THREE.Scene();
let curve = new Curve(100);

const ambienLight = new THREE.AmbientLight(0xffffff,0.8);
const pointLight = new THREE.PointLight(0xffffff,1,0,0);
pointLight.position.set(400,0,0);

sceneSphere.add(ambienLight);
sceneSphere.add(pointLight);

const GLTFloader = new GLTFLoader().setPath("./model/earth2/");
const OBJloader = new OBJLoader().setPath("./model/craft/");

GLTFloader.load("scene.gltf",async function(gltf){
    const model = gltf.scene;
    model.rotation.z=Math.PI;//旋转地球模型，使得模型能够满足经纬度坐标轴
    model.rotation.x=Math.PI;
    model.rotation.y=Math.PI/10;
    // await renderer.compileAsync(model,camera,scene);
    sceneSphere.add(model);
})

// OBJloader.load("whole.obj",async function(obj){
//     const model = obj;
//     // await renderer.compileAsync(model,camera,scene);
//     model.position.set(0,100,0)//设置模型初始位置
//     model.scale.set(0.6,0.6,0.6)
//     sceneSphere.add(model);
// })

curve.addPoint({x:0,y:100,z:150});
curve.addPoint({x:0,y:0,z:90});

let line = curve.generateCurve();

let circle = curve.generateCircle({x:0,y:0},100)

sceneSphere.add(line);
sceneSphere.add(circle);
export default sceneSphere;
