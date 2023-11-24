import * as THREE from 'three'
/**
* 计算球心与摄像机连线与球的交点
* @params center 球心点
* @params externalPoint 摄像机位置
* @params radius 球半径
* @return intersectionPoint 交点
*/
function intersectionPointWithSphere(center,externalPoint,radius){
    //球心坐标
    let x0=center.x;
    let y0=center.y;
    let z0=center.z;

    //外点坐标
    let x1=externalPoint.x;
    let y1=externalPoint.y;
    let z1=externalPoint.z;

    //向量
    let vx=x1-x0;
    let vy=y1-y0;
    let vz=z1-z0;

    //求解球心到外点的距离
    let distance=(x0-vx+y0*vy+z0*vz-radius*radius)/(vx*vx+vy*vy+vz*vz);

    let intersectionPoint={
        x:x0+distance*vx,
        y:y0+distance*vy,
        z:z0+distance*vz
    }

    return intersectionPoint;
}

/**
 * 计算两点之间的距离
 * @param {array} v1 摄像机坐标 
 * @param {array} v2 球心坐标
 * @returns 
 */
function distanceToCenter(v1,v2){
    v2=[v2?.[0]?v2[0]:0,v2?.[1]?v2[1]:0,v2?.[2]?v2[2]:0];
    return Math.pow(Math.pow(v1[0]-v2[0],2)+
    Math.pow(v1[1]-v2[1],2)+Math.pow(v1[2]-v2[2],2),0.5)
}

/**
 * 求空间中一点到平面的距离
 * @param {THREE.Vector3} point 点的坐标 
 * @param {THREE.Vector3} planePoint 平面上一点坐标
 * @param {THREE.Vector3} planeNormal 平面法向量 
 * @returns distance 距离
 */
function distanceToPlane(point,planePoint,planeNormal){
    //(P-A)
    const vectorToPoint = new THREE.Vector3().subVectors(point,planePoint);

    //|(P-A)·n|
    const dotProduct = vectorToPoint.dot(planeNormal);
    const absoluteDotProduct = Math.abs(dotProduct);

    //||n||
    const normalLength = planeNormal.length();

    //d=|(P-A)·n|/||n||
    const distance = absoluteDotProduct / normalLength;

    return distance;
}

export {intersectionPointWithSphere,distanceToCenter,distanceToPlane}