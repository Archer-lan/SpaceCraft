import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js"


let sceneSphere = new THREE.Scene();
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


export default sceneSphere;
