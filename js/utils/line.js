import * as THREE from "three"
export default class Line{
    /**
     * 构造器
     * @param {Array(Vector3)} lineList 用于插值的点数组 
     * @param {number} number 插值的点数量 
     * @param {Object} circleCenter 圆心坐标，为二维坐标 
     * @param {number} radius 半径
     * @param {string} curveType 生成的线的类型 
     * @param {boolean} closed 是否合闭 
     */
    constructor(lineList,number,circleCenter,radius,curveType,closed){
        this.lineList=lineList || [];
        this.number=number || 5000;
        this.curveType = curveType || "chordal";
        this.closed = closed || false;
        this.lines={};
        // this.radius = radius || 150;
        // this.circleCenter = circleCenter || {x:0,y:0};
    }

    /**
     * 添加绘制点
     * @param {Object} point //绘制点 
     */
    addPoint(point){
       this.lineList.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    
    clearPoints(){
        this.lineList.splice(0,this.lineList.length);
    }

    /**
     * 生成坠落轨迹
     * @param {*} color 颜色 
     * @returns 
     */
    generateLine(color){
        const line = new THREE.CatmullRomCurve3(this.lineList);
        line.curveType = this.curveType;
        line.closed = this.closed;

        const points = line.getPoints(this.number);
        const curve = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color:color || 0xffffff
            })
        )

        return {
            curve,//用于绘制的线
            points,//生成的点集
        }
    }

    /**
     * 生成圆环
     */
    // generateCircle(color){
    //     const arcCurve = new THREE.ArcCurve(this.circleCenter.x, this.circleCenter.y, this.radius,0,2*Math.PI);
    //     const points = arcCurve.getPoints(this.number);
        
    //     const circle = new THREE.Line(
    //         new THREE.BufferGeometry().setFromPoints(points),
    //         new THREE.LineBasicMaterial({
    //             color:color || 0xffffff
    //         })
    //     )

    //     return {
    //         circle,
    //         points,
    //     }
    // }
}