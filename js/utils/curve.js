import * as THREE from "three"
export default class Curve{
    constructor(number,curveType,closed){
        this.drawPointList=[],
        this.insertNumber=number, //在曲线两点间插值的数量，插值越多，曲线越光滑
        this.curveType=curveType==null?"chordal":curveType;//绘制曲线的类型
        this.closed=closed==null?false:closed;
    }
    /**
     * 添加绘制点
     * @param {Object} point //绘制点 
     */
    addPoint(point){
        this.drawPointList.push(new THREE.Vector3(point.x, point.y, point.z));
    }

    /**
     * 移除绘制点
     * @returns 
     */
    deletePoint(){
        let point = this.drawPointList.shift();
        return point;
    }

    /**
     * 生成曲线
     * @returns 
     */
    generateCurve(){
        let curve = new THREE.CatmullRomCurve3(this.drawPointList);
        curve.curveType=this.curveType;
        curve.closed=this.closed;
        let points = curve.getPoints(this.insertNumber);
        let line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color:0xffffff
            })
        )
        return line;
    }

    /**
     * 生成圆环
     * @param {Obejct} point 圆环的中心点 
     * @param {number} radius 半径 
     * @returns 
     */
    generateCircle(point,radius){
        let arcCurve = new THREE.ArcCurve(point.x,point.y,radius,0,2*Math.PI);
        let points = arcCurve.getPoints(this.insertNumber);
        let circle = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color:0xffffff
            })
        )
        return circle
    }
}