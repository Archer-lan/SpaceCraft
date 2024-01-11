import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import tools from "../utils/tools.js";


export default class Craft{
    /**
     * 加载模型
     * @param {Array} scene 
     * @param {string} fileName 模型文件名
     * @param {string} modelName 模型别称
     * @param {Object} position 模型初始位置
     * @param {Object} scale 缩放比例
     */
    loadCraft(scene,fileName,modelName,position,sca){
        const OBJloader = new OBJLoader().setPath("model/craft/");
        let scale = sca || {x:0.6,y:0.6,z:0.6};
    
        OBJloader.load(fileName,function(obj){
            //添加金属质感
            const metalMaterial=new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.2 });

            obj.traverse((child)=>{
                if(child instanceof THREE.Mesh){
                    child.material=metalMaterial;
                }
            })

            const model = obj;
            model.scale.set(scale.x,scale.y,scale.z);
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            model.children[0].geometry=buffergeometry
            model.name=modelName;
    
            model.position.set(position.x,position.y,position.z);
            // const axesHelper = new THREE.AxesHelper( 500 );
            // scene.add( axesHelper );    
            scene.add(model);
        })
    }
    
    /**
    * 
    * @param {Object} scene 
    * @param {Array} points 生成路径线时插值生成的点数据
    * @param {Object} camera 
    * @param {Object} control 
    * @returns 
    */
    moveAndControl(camera,control) {
       let index = 0
       return function(scene,points,name,number){
           if(number){
               index = number;
           }
           if(index===1){
                camera.position.set(points[0].x, points[0].y,points[0].z)
               control.target.set(points[0].x, points[0].y,points[0].z);
           }
           if(index >= points.length-1){
               index %= (points.length-1)
           }
           scene.children.map((value)=>{
               if(value.name === name){
                   // value.position.set(points[index].x, points[index].y,0);
                   value.position.set(points[index].x, points[index].y,points[index].z);
                   // control.target.set(points[index].x, points[index].y, 0);
                   control.target.set(points[index].x, points[index].y, points[index].z);
                   let x = control.object.position.clone().sub(value.position).x+points[index+1].x 
                   let y = control.object.position.clone().sub(value.position).y+points[index+1].y
                   let z = control.object.position.clone().sub(value.position).z+points[index+1].z 
    
                   scene.children[1].position.set(x,y,z);
                   camera.position.set(x,y,z)
               }
           })
           index++
           return index;
       }
    }


    move(){
        let index=0;
        return function(scene,points,name,number){
            if(number){
                index = number;
            }
            if(index >= points.length-1){
                index %= (points.length-1)
            }
            // console.log(scene);
            scene.children.map((model)=>{
                if(model.name ===name){
                    model.position.set(points[index].x, points[index].y,points[index].z)
                }
            })
            index++;
            return index;
        }  
    }

     /**
     * 
     * @param {俯仰角} PitchAngle  绕z
     * @param {偏航角} YawAngle    绕y
     * @param {滚转角} RollAngle   绕x
     */
     rotate(scene,modelName,PitchAngle=0.3,YawAngle=0.3,RollAngle=0.3){
        scene.children.map((value)=>{
            if(value.name === modelName){
                // if(YawAngle>=360){
                //     YawAngle %=360
                // }
                let PitchRad = PitchAngle * Math.PI / 180
                value.rotateZ(PitchRad)

                let YawRad = YawAngle * Math.PI / 180
                value.rotateY(YawRad)

                let RollRad = RollAngle * Math.PI / 180
                value.rotateX(RollRad)
            }
        })
    }
}

