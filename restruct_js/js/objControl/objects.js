import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import tools from '../../utils/tools.js';
import { Geometry } from '../fire/geometry.js';
import { Material } from '../fire/material.js';
import { guiParams, three } from '../global.js';

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
    static async loadObj(fileName,modelName,position,sca){
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
     * @param {*} curve 曲线对象
     * @param {*} index 移动位置
     */
    static moveInLock(model,curve,index){
        let position=curve.getPoint(index);
        if(index===0){
            three.camera.position.set(position.x,position.y,position.z);
            three.controls.target.set(position.x,position.y,position.z);
        }
        if(guiParams.playState!=='1'){
            model.position.set(position.x,position.y,position.z);
            three.controls.target.set(position.x,position.y,position.z);

            let x = three.controls.object.position.clone().sub(model.position).x+position.x 
            let y = three.controls.object.position.clone().sub(model.position).y+position.y
            let z = three.controls.object.position.clone().sub(model.position).z+position.z
        
            three.camera.position.set(x,y,z);
        }
    }

    /**
     * 移动物体在自由视角的情况下
     * @param {*} model 模型对象
     * @param {*} curve 曲线对象
     * @param {*} index 移动位置
     * @returns 
     */
    static moveInFree(model,curve,index){
        let position=curve.getPoint(index);
        model.position.set(position.x,position.y,position.z)
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

    /**
     * 创建火焰
     * @returns 
     */
    static createFire(){

        let fireRadius =1;
        let fireHeight =15;
        let particleCount =5000;
        let geometry = new Geometry(fireRadius,fireHeight,particleCount);
        let material = new Material({color:0xff2200});

        material.setPerspective(three.camera.fov,window.innerHeight);
        let fireMesh = new THREE.Points(geometry, material);

        return fireMesh
    }

    /**
     * 修正火焰的尾部朝向
     * @param {*} fire 火焰对象
     * @param {*} curve 曲线对象
     * @param {*} index 移动位置标记
     */
    static fireMove(fire,curve,index){
        let position = curve.getPoint(index);
        fire.position.copy(position);

        let tangent = curve.getTangent(index).normalize();

        let up=new THREE.Vector3(0, -1, 0);;
        
        // 用来调整火焰朝向的轴
        let axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
        
        // 根据轴和角度计算四元数
        let radians = Math.acos(up.dot(tangent));
        let quaternion = new THREE.Quaternion().setFromAxisAngle(axis, radians);
        
        // 应用四元数到火焰的旋转
        fire.quaternion.copy(quaternion);
        
        fire.material.update(index);
    }
}