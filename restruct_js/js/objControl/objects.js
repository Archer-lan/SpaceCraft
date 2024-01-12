import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import tools from '../../utils/tools.js';
import { three } from '../global.js';

/**
 * 物体类控制所有物体
 */
export default class Objects{
    constructor(){
        this.objects=[];
    }
    /**
     * 加载OBJ模型文件
     * @param {*} fileName 文件名称 
     * @param {*} modelName 模型别名
     * @param {*} position 模型初始位置
     * @param {*} scale 模型缩放大小
     * @returns 
     */
    async loadObj(fileName,modelName,position,sca){
        const OBJloader = new OBJLoader().setPath("model/craft/");
        let scale = sca || {x:0.6,y:0.6,z:0.6};
        //加载模型
        let obj = await OBJloader.loadAsync(fileName);

        //为模型添加金属质感
        const metalMaterial=new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.2 });
        obj.traverse((child)=>{
            if(child instanceof THREE.Mesh){
                child.material=metalMaterial;
            }
        })
        //设置模型缩放大小，位置，名称
        obj.scale.set(scale.x, scale.y,scale.z);
        obj.position.set(position.x, position.y, position.z);
        obj.name = modelName;

        //将单个模型坐标系中心调整到模型中心
        let geometry = tools.normalizeGeometry([obj.children[0]])[0]
        let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
        obj.children[0].geometry=buffergeometry

        return obj;
    }

    /**
     * 移动物体在锁定视角的情况下
     * @param {*} model 模型对象
     * @param {*} points 点数据
     * @param {*} index 移动位置
     */
    static moveInLock(model,points,index){
        if(index===0){
            three.camera.position.set(points[index].x,points[index].y,points[index].z);
            three.controls.target.set(points[index].x,points[index].y,points[index].z);
        }
        // if(index>=points.length){
        //     index %=(points.length);
        // }
        model.position.set(points[index].x,points[index].y,points[index].z);
        three.controls.target.set(points[index].x,points[index].y,points[index].z);

        let x = three.controls.object.position.clone().sub(model.position).x+points[index+1].x 
        let y = three.controls.object.position.clone().sub(model.position).y+points[index+1].y
        let z = three.controls.object.position.clone().sub(model.position).z+points[index+1].z
    
        three.camera.position.set(x,y,z);
        
        // index++;
        // return index;
    }

    /**
     * 移动物体在自由视角的情况下
     * @param {*} model 模型对象
     * @param {*} points 点数据
     * @param {*} index 移动位置
     * @returns 
     */
    static moveInFree(model,points,index){
        // if(index>=points.length){
        //     index %=(points.length);
        // }
        model.position.set(points[index].x,points[index].y,points[index].z);
        // index++;
        // return index;
    }

    /**
     * 旋转模型
     * @param {Object} model  
     * @param {*} pitchAngle 俯仰角，绕z
     * @param {*} yawAngle 偏航角，绕y
     * @param {*} rollAngle 滚转角，绕x
     */
    static rotate(model,pitchAngle=0.3,yawAngle=0.3,rollAngle=0.3){
        let PitchRad = pitchAngle * Math.PI / 180
        model.rotateZ(PitchRad)

        let YawRad = yawAngle * Math.PI / 180
        model.rotateY(YawRad)

        let RollRad = rollAngle * Math.PI / 180
        model.rotateX(RollRad)
    }
}