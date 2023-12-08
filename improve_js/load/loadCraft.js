import * as THREE from "three";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import Transform from "../utils/Transform.js";
import tools from "../utils/tools.js";

export default class Craft{
    constructor(path,position,scale){
        this.OBJloader = new OBJLoader().setPath(path || "../../model/craft/");
        this.position = position || [0,100,0];
        this.scale = scale || [0.6,0.6,0.6];
    }

    async loadModel(scene,name){
        let position = this.position;
        let scale = this.scale;
        await this.OBJloader.load(name || "whole.obj",function(obj){
            const model = obj;
            model.position.set(position[0],position[1],position[2]);
            model.scale.set(scale[0],scale[1],scale[2])
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            // console.log(geometry)
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            // console.log(buffergeometry)
            model.children[0].geometry = buffergeometry
            model.name = 'craft'
            // console.log(model.children[0])
            // tools.normalizeGeometry([model.children[0]])
            scene.add(model);
        })
        this.OBJloader.load(name || "solarpanel.obj",function(obj){
            const model = obj;
            model.position.set(position[0],position[1],position[2]);
            model.scale.set(scale[0],scale[1],scale[2])
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            // console.log(geometry)
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            // console.log(buffergeometry)
            model.children[0].geometry = buffergeometry
            // model.name = 'craft'
            // console.log(model.children[0])
            // tools.normalizeGeometry([model.children[0]])
            scene.add(model);
        })
        this.OBJloader.load(name || "cabin.obj",function(obj){
            const model = obj;
            model.position.set(position[0],position[1],position[2]);
            model.scale.set(scale[0],scale[1],scale[2])
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            // console.log(geometry)
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            // console.log(buffergeometry)
            model.children[0].geometry = buffergeometry
            // model.name = 'craft'
            // console.log(model.children[0])
            // tools.normalizeGeometry([model.children[0]])
            scene.add(model);
        })
        this.OBJloader.load(name || "relayantenna.obj",function(obj){
            const model = obj;
            model.position.set(position[0],position[1],position[2]);
            model.scale.set(scale[0],scale[1],scale[2])
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            // console.log(geometry)
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            // console.log(buffergeometry)
            model.children[0].geometry = buffergeometry
            // model.name = 'craft'
            // console.log(model.children[0])
            // tools.normalizeGeometry([model.children[0]])
            scene.add(model);
        })
    }

    setPosition(scene,points,camera,control) {
        let index = 0
        return function(){
            if(index >= points.length){
                index %= points.length
            }
            scene.children.map((value)=>{
                if(value.name === 'craft'){
                    value.position.set(points[index].x, points[index].y,points[index].z);
                    // camera.position.set(points[index].x, points[index].y,points[index].z)
                    control.target.set(points[index].x, points[index].y,points[index].z)
                    index++
                }
            })
        }
        
    }
    /**
     * 
     * @param {俯仰角} PitchAngle  绕z
     * @param {偏航角} YawAngle    绕y
     * @param {滚转角} RollAngle   绕x
     */
    rotate(scene,PitchAngle=0.3,YawAngle=0.3,RollAngle=0.3){
        return function(){
            // console.log(">>>")
            scene.children.map((value)=>{
                // console.log(value.name)
                if(value.name === 'craft'){
                    // if(YawAngle>=360){
                    //     YawAngle %=360
                    // }
                    let PitchRad = PitchAngle * Math.PI / 180
                    value.rotateZ(PitchRad)

                    let YawRad = YawAngle * Math.PI / 180
                    value.rotateY(YawRad)

                    let RollRad = RollAngle * Math.PI / 180
                    value.rotateX(RollRad)


                    // console.log(value)
                    // value.position.set(points[index].x, points[index].y,points[index].z);
                    // camera.position.set(points[index].x, points[index].y,points[index].z)
                    // control.target.set(points[index].x, points[index].y,points[index].z)
                    // YawAngle +=0.01
                }
            })
        }
    }
} 