import * as THREE from 'three';
export default class Line{
    constructor(originPoint,number){
        this.originPoint = originPoint || [];
        this.number=number || 10000;
        this.initPoint=[];
        // this.points = [];
        this.line=null;
        this.curve=null;
    }

    /**
     * 将原始点转为THREE 的vector格式便于后续计算
     * @param {*} originPoint 初始点的数据
     */
    initOriginPoint(originPoint){
        this.originPoint = originPoint || this.originPoint;
        this.originPoint.map((point)=>{
            this.initPoint.push(new THREE.Vector3(point.x, point.y, point.z));
        })
    }

    /**
     * 生成坠落轨迹
     * @param {*} number 插值点的数量 
     * @param {*} color 颜色 
     * @returns 
     */
    generateLine(number,color){
        this.number = number || this.number
        const curve = new THREE.CatmullRomCurve3(this.initPoint);
        curve.curveType = 'chordal';
        curve.closed = false;

        const points = curve.getPoints(this.number);
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color:color || 0xffffff
            })
        )
        // this.points=points;
        this.line=line;
        this.curve = curve;
    }
}