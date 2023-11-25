import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js"
import scenePlane from "./map.js"
import sceneSphere from "./sphere.js"
import {distanceToCenter} from "./utils/pointWithSphere.js"
import Transform from "./utils/transform.js"

let camera,scene,renderer,controls;
const radius = 150;//地球半径
const Trans=new Transform(radius);

init();
async function init(){
    const container = document.createElement("div");
    container.className = "earth";
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.25,1000);
    camera.position.set(0,0,200);

    scene = sceneSphere;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1;
    container.appendChild(renderer.domElement);

    controls=new OrbitControls(camera,renderer.domElement);
    controls.addEventListener('change',render);
    controls.minDistance=50;
    controls.maxDistance=500;
    controls.target.set(0,0,0);
    controls.update;
    // const axesHelper = new THREE.AxesHelper(170);
    // scene.add(axesHelper);
    window.addEventListener("resize",onWindowResize);
}

function render(){
    let distance;
    if(scene===sceneSphere){
        //球体中心不会动，取相机到原点的距离为判定条件
        distance=distanceToCenter([camera.position.x,camera.position.y,camera.position.z]);
        if(distance<125){
            let latlng=Trans.spatialCoordToLatLng({
                x:camera.position.x,
                y:camera.position.y,
                z:camera.position.z
            })
            let point=Trans.latlngToMercator({
                latitude:latlng.latitude,
                longitude:latlng.longitude
            })

            controls.target.set(point.x,point.y,0);
            camera.position.set(point.x,point.y,150)
            scene = scenePlane;
        }
    }else if(scene===scenePlane){
        //平面地图平移后，控制目标的中心点也会变，取相机到中心点的距离为判定条件
        distance=distanceToCenter([camera.position.x,camera.position.y,camera.position.z]
                                ,[controls.target.x,controls.target.y,controls.target.z]);
        if(distance>250){
            let latlng=Trans.MercatorToLatLng({
                x:controls.target.x,
                y:controls.target.y,
            })
            let point=Trans.latlngToSpatialCoord({
                latitude:latlng.latitude,
                longitude:latlng.longitude
            })
            controls.target.set(0,0,0);
            camera.position.set(point.x,point.y,point.z)
            scene = sceneSphere;
        }
    }
    renderer.render(scene,camera);
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}


