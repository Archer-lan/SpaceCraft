import * as THREE from "three"
export default{

    //将物体初始化到屏幕中心
    normalizeGeometry(geometries,maxRadius = 0,totalCenter = new THREE.Vector3()){
        //geometries -> obj.children
        geometries.forEach((value)=>{
            let geometry = this.fromLoadBufferGeometry(value.geometry)
            // console.log(value.geometry)  
            // let geometry = value.geometry
            geometry.computeBoundingSphere()
            let radius = geometry.boundingSphere.radius
            if(radius>maxRadius){
                maxRadius = radius
            }
        })
        //求比例尺 缩放所有顶点
        geometries = geometries.map((value)=>{
            // let geometry = value.geometry
            let geometry = this.fromLoadBufferGeometry(value.geometry)
            // console.log(geometry)
            let scaleFactor = 4 / maxRadius;
            // 用比例尺因子缩放所有的顶点
            for (let i = 0, il = geometry.vertices.length; i < il; ++i) {
                geometry.vertices[i].multiplyScalar(scaleFactor);
            }
            geometry.computeBoundingSphere()
            return geometry
        })
        //计算当前模型的所有mesh的平均中点
        geometries.forEach((geometry,index)=>{
            geometry.computeFaceNormals()
            geometry.mergeVertices()
            geometry.computeVertexNormals()
            geometry.computeBoundingSphere()
            let center = new THREE.Vector3()
            center = geometry.boundingSphere.center
            totalCenter.add(center)
        })
        totalCenter.divideScalar(geometries.length)
        totalCenter.negate()
        //使当前模型整体偏移
        geometries = geometries.map((geometry,index)=>{
            // console.log(geometry.vertices)
            geometry.computeFaceNormals()
            geometry.mergeVertices()
            geometry.computeVertexNormals()
            geometry.computeBoundingSphere();
            for (let i = 0, il = geometry.vertices.length; i < il; ++i) {
                geometry.vertices[i].add(totalCenter); 
            }
            // 再次计算
            geometry.computeBoundingSphere();
            return geometry
        })
        return geometries
    },
    //将数据转换为Geometry类型
    fromLoadBufferGeometry(buffer){
        let geometry = new THREE.Geometry().fromBufferGeometry(buffer)
        geometry.computeFaceNormals();
        geometry.mergeVertices();
        geometry.computeVertexNormals();
        return geometry
    }
}