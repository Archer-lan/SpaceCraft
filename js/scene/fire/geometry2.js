import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

const SPRITE_ROW_LENGTH = 4;
const ONE_SPRITE_ROW_LENGTH = 1 / SPRITE_ROW_LENGTH;

export class Geometry {
    constructor(radius, height, particleCount) {

        const geometry = new THREE.BufferGeometry();

        const halfHeight = height * 0.5;
        const position = new Float32Array(particleCount * 3);
        const random = new Float32Array(particleCount);
        const sprite = new Float32Array(particleCount);

        const outerRadius = radius;  // 外圆半径
        const innerRadius = 0.75 * radius;   // 内圆半径
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
        
            position[i * 3 + 0] = x;
            position[i * 3 + 1] = (radius - innerRadius) / (outerRadius - innerRadius) * halfHeight + halfHeight;
            position[i * 3 + 2] = z;
        
            // 其他粒子属性的设置...
            sprite[i] = ONE_SPRITE_ROW_LENGTH * ((Math.random() * 4) | 0);
            random[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
        geometry.setAttribute('random', new THREE.BufferAttribute(random, 1));
        geometry.setAttribute('sprite', new THREE.BufferAttribute(sprite, 1));

        return geometry;
    }
}