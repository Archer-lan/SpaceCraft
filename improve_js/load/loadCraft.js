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
            console.log(model)
            let geometry = tools.normalizeGeometry([model.children[0]])[0]
            console.log(geometry)
            let buffergeometry = new THREE.BufferGeometry().fromGeometry(geometry)
            console.log(buffergeometry)
            model.children[0].geometry = buffergeometry
            // console.log(model.children[0])
            // tools.normalizeGeometry([model.children[0]])
            scene.add(model);
        })
    }

    setPosition(scene) {
        // this.model.position.set(position);
    }
} 