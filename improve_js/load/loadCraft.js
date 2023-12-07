import * as THREE from "three";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import Transform from "../utils/Transform.js";

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
            scene.add(model);
        })
    }

    setPosition(scene) {
        // this.model.position.set(position);
    }
} 