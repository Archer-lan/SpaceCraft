import * as THREE from "three"

let scenePlane = new THREE.Scene();

let planes;
// let planeNormal;

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


export default scenePlane;
