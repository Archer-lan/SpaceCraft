import * as THREE from "three"
export default class Transform{
    
    constructor(radius){
        this.radius=radius;
    }

    /**
     * 经纬度转为4836坐标系，即地图按照经纬度展开
     * @param {Object} latlng 经纬度 
     * @returns 
     */
    latlngToMercator(latlng){
        // const originShift = Math.PI *this.radius;
        const xWidth = 2*Math.PI*100;
        const yWidth = xWidth/2;
        const x=xWidth/180*(latlng.longitude%180)
        const y=yWidth/90*(latlng.latitude%90)

        return {x,y};
    }

    /**
     * 4836坐标系转为经纬度
     * @param {Object} point 坐标点包含xy 
     * @returns 
     */
    MercatorToLatLng(point){
        let x=point.x;
        let y=point.y;

        const xWidth = 2*Math.PI*100;
        const yWidth = xWidth/2;

        const longitude = x/(xWidth/180)
        const latitude = y/(yWidth/90)

        return {
            latitude,
            longitude
        }
    }

    /**
     * 空间坐标系转经纬度坐标
     * @param {Object} point //相机所在点包含xyz
     * @returns 
     */
    spatialCoordToLatLng(point){
        const vector = new THREE.Vector3(point.x, point.y, point.z);

        //将三维向量转为球面坐标
        const spherical = new THREE.Spherical().setFromVector3(vector);

        //获取球面坐标的极角（纬度）和方位角（经度）
        const latitude = 90-THREE.MathUtils.radToDeg(spherical.phi);
        const longitude = 360+THREE.MathUtils.radToDeg(spherical.theta)-90;

        return {
            latitude,
            longitude,
        }
    }

    /**
     * 经纬度转空间坐标系
     * @param {Object} latlng 经纬度坐标 
     * @returns 
     */
    latlngToSpatialCoord(latlng) { 
        let spherical = new THREE.Spherical();
        spherical.radius = this.radius;

        const lat = latlng.latitude;
        const lng = latlng.longitude;
        const theta = (lng+90)*(Math.PI/180)
        const phi = (90-lat)*(Math.PI/180)
        spherical.phi = phi; //phi是方位面（水平面）内的角度，范围0～360度
        spherical.theta = theta; //theta是俯仰面（竖直面）内的角度，范围0～360度
        let position = new THREE.Vector3();
        position.setFromSpherical(spherical);
        
        return position;
    }
}


