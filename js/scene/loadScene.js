import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let Sphere = new THREE.Scene();

loadSphere();


export default Sphere

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

        model.traverse((child) => {
            if (child.isMesh) {
                // 检查材质是否有 emissiveMap
                if (child.material.emissiveMap) {
                    // 移除 emissive 纹理
                    child.material.emissiveMap = null;
                    child.material.emissive.setHex(0x000000);
                    child.material.needsUpdate = true; // 更新材质以使更改生效
                }
            }
        });

        Sphere.add(model);
    })
}

