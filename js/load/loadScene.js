import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let Sphere = new THREE.Scene();
let Map = new THREE.Scene();

loadMap();

loadSphere();

export {
    Map, Sphere
};

//加载地球模型
function loadSphere(){
    const ambienLight = new THREE.AmbientLight(0xffffff,0.8);
    const pointLight = new THREE.PointLight(0xffffff,1,0,0);
    pointLight.position.set(400,0,0);

    Sphere.add(ambienLight)
    Sphere.add(pointLight)

    const GLTFloader=new GLTFLoader().setPath("model/earth2/");

    GLTFloader.load("scene.gltf",async function(gltf){
        const model = gltf.scene;
        model.rotation.z=Math.PI;//旋转地球模型，使得模型能够满足经纬度坐标轴
        model.rotation.x=Math.PI;
        model.rotation.y=Math.PI/10;
        Sphere.add(model);
    })
}

//加载平面地图
async function loadMap() {
    let pictures;
    await fetch("model/map/Level4.json")
    .then((response) => {
        return response.json();
    }).then((json)=>{
        pictures=json;
    })

    const ambienLight = new THREE.AmbientLight(0xffffff,0.8);
    const pointLight = new THREE.PointLight(0xffffff,1,0,0);
    pointLight.position.set(0,0,200);
    // const pointLightHelper= new THREE.PointLightHelper(pointLight,10);

    Map.add(ambienLight)
    Map.add(pointLight)

    for(let picture of pictures){
        let geometry = new THREE.PlaneGeometry(picture.xWidth, picture.yWidth);
        let material = new THREE.MeshBasicMaterial({
            map:new THREE.TextureLoader().load(picture.imagePath)
        })
        let curPicture = new THREE.Mesh(geometry, material);
        curPicture.position.x=picture.xOffset;
        curPicture.position.y=picture.yOffset+19.1;//19.1为地图经纬度偏移量，确定初始0经纬度点
        Map.add(curPicture);
    }
}