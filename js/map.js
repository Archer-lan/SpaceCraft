import * as THREE from "three"
import Curve from "./utils/curve.js";

let scenePlane = new THREE.Scene();

let planes;
const curve = new Curve(50);

await fetch("./model/map/Level4.json")
.then((response)=>{
    return response.json();
}).then((json)=>{
    planes=json;
})

for(let plane of planes){
    let geometry = new THREE.PlaneGeometry(plane.xWidth, plane.yWidth);
    let material = new THREE.MeshBasicMaterial({
        map:new THREE.TextureLoader().load(plane.imagePath)
    })
    let curPlane = new THREE.Mesh(geometry, material);
    curPlane.position.x=plane.xOffset;
    curPlane.position.y=plane.yOffset+19.1;//19.1为地图经纬度偏移量，确定初始0经纬度点
    scenePlane.add(curPlane);
}

curve.addPoint({x:0,y:100,z:100});
curve.addPoint({x:0,y:0,z:0});

let line = curve.generateCurve();
scenePlane.add(line);

export default scenePlane;
