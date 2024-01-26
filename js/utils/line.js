import * as THREE from 'three';
export default class Line{
    constructor(originPoint,number){
        this.originPoint = originPoint || [];
        this.originRotate = []

        this.number=number || 10000;
        // this.rotationnum = 100
        this.initPoint=[];
        this.initRotation = []
        // this.points = [];
        this.line=null;
        this.curve=null;
        this.rotateObj = null
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
    //初始化旋转值
    initOriginRotation(originRotate){
        this.originRotate = originRotate || this.originRotate
        this.originRotate.map((point)=>{
            this.initRotation.push(new THREE.Vector3(point.x, point.y, point.z))
        })
    }
    //旋转值插值
    generateRotation(number,color){
        // console.log(this.initRotation)
        let rotation = [...this.initRotation]
        let offsets = [{x:0,y:0,z:0}]
        for(let i=0;i<rotation.length-1;i++){
            if(rotation[i].x>rotation[i+1].x){
                rotation[i+1].x +=6.283
            }
            if(rotation[i].y>rotation[i+1].y){
                rotation[i+1].y +=6.283
            }
            if(rotation[i].z>rotation[i+1].z){
                rotation[i+1].z +=6.283
            }
        }
        // console.log(rotation)
        let temp = new THREE.CatmullRomCurve3(rotation);
        temp.curveType = 'chordal';
        temp.closed = false;
        // console.log(temp)
        // const points = temp.getPoints(this.number);
        // for(let i=0;i<points.length-1;i++){
        //     offsets.push({
        //         x:points[i+1].x-points[i].x,
        //         y:points[i+1].y-points[i].y,
        //         z:points[i+1].z-points[i].z,
        //     })
        // }
        this.rotateObj = temp
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