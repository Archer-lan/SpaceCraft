// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import * as THREE from "three";


const _VS = `
uniform float pointMultiplier; 

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const _FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

//主要功能：存储插值点，并提供插值功能
//用于计算粒子的大小、颜色和透明度等属性的插值结果
class LinearSpline {
    constructor(lerp) {
        this._points = []; // 存储插值点
        this._lerp = lerp;
    }
    // 用于添加插值点。t是插值点的参数，d是插值点的值
    AddPoint(t, d) {
        this._points.push([t, d]);
    }
    //用于获取参数t对应的插值结果
    Get(t) {
        //用于找到参数t在_points数组中的位置
        let p1 = 0;
        for (let i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }
        //找到参数t的下一个插值点
        const p2 = Math.min(this._points.length - 1, p1 + 1);
        //如果参数t的前后插值点相同，直接返回该插值点的值
        if (p1 == p2) {
            return this._points[p1][1];
        }
        //如果前后插值点不同，就使用lerp函数在两个插值点之间进行插值，得到参数t的插值结果
        return this._lerp(
            (t - this._points[p1][0]) / (
                this._points[p2][0] - this._points[p1][0]),
            this._points[p1][1], this._points[p2][1]);
    }
}

//主要功能：创建和管理一个粒子系统
export default class ParticleSystem {
    constructor(params) {
        console.log(params);

        const uniforms = {
            diffuseTexture: {
                value: new THREE.TextureLoader().load('model/fire/fire.png')
            },
            pointMultiplier: { //保证在不同屏幕和窗口大小下，粒子的视觉大小保持一致。
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        };
        console.log(uniforms.diffuseTexture);

        this._material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            blending: THREE.AdditiveBlending, //材质的混合模式，这里使用加法混合
            depthTest: true,    //是否开启深度测试
            depthWrite: false,  //是否允许写入深度缓冲
            transparent: true,  //是否启用透明度
            vertexColors: true,  //是否支持顶点颜色
        });
        

        this._camera = params.camera;
        this._particles = [];    //用于存储粒子

        // console.log(params.initialPosition);
        this._initialPosition1 = new THREE.Vector3(0, 0, 0);
        this._initialPosition1.set(params.initialPosition.x, params.initialPosition.y, params.initialPosition.z) //每个火焰的初始位置
        // console.log(this._initialPosition1);
        // console.log(params.initialPosition);
        this._initialVelocity = params.initialVelocity || new THREE.Vector3(34, -104, 80); //每个火焰的初始方向和速度

        this._geometry = new THREE.BufferGeometry();
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
        this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
        this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));
        //创建一个新的Points对象，它将被用于渲染粒子，并将它添加到父对象中
        this._points = new THREE.Points(this._geometry, this._material);
        params.parent.add(this._points);

        //计算粒子的透明度
        this._alphaSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._alphaSpline.AddPoint(0.0, 1.0);
        this._alphaSpline.AddPoint(0.1, 1.0);
        this._alphaSpline.AddPoint(0.6, 1.0);
        this._alphaSpline.AddPoint(1.0, 1.0);
        

        //计算粒子的颜色
        this._colorSpline = new LinearSpline((t, a, b) => {
            const c = a.clone();
            return c.lerp(b, t);
        });
        this._colorSpline.AddPoint(0.0, new THREE.Color(0xFFFF80));
        this._colorSpline.AddPoint(1.0, new THREE.Color(0xFF8080));

        //计算粒子的大小
        this._sizeSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._sizeSpline.AddPoint(0.0, 0.5);
        this._sizeSpline.AddPoint(0.5, 1.0);
        this._sizeSpline.AddPoint(1.0, 0.5);
        // this._sizeSpline.AddPoint(0.0, 1);
        // this._sizeSpline.AddPoint(0.5, 2.0);
        // this._sizeSpline.AddPoint(1.0, 1);

        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

        this._UpdateGeometry();
    }

    //空格释放时，会调用_AddParticles方法，添加新的粒子
    _onKeyUp(event) {
        switch (event.keyCode) {
            case 32: // SPACE
                this._AddParticles();
                break;
        }
    }

    //计算给定的时间步长中需要添加多少粒子，创建这些并将它们添加到粒子系统中
    _AddParticles(timeElapsed) {
        //无论每帧的时间间隔多大，都能保证粒子生成速率恒定，即每秒大约50个新粒子
        if (!this.frame) {
            this.frame = 0.0;
        }
        this.frame += timeElapsed;
        const n = Math.floor(this.frame * 50.0);
        this.frame -= n / 50.0;

        for (let i = 0; i < n; i++) {
            //每个粒子生命周期是随机的，范围在2.5到5.0之间  
            const life = (Math.random() * 0.75 + 0.25) * 5;
            this._particles.push({
                position: this._initialPosition1.clone(),
                size: (Math.random() * 0.5 + 0.5) * 4.0,
                colour: new THREE.Color(),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                velocity: this._initialVelocity.clone(), //使用传入的初始速度
            });
        }
    }

    //根据当前粒子系统中的粒子属性更新几何体属性  
    _UpdateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for (let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            // colours.push(p.colour.r, p.colour.g, p.colour.b, 1.0);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        this._geometry.setAttribute(
            'position', new THREE.Float32BufferAttribute(positions, 3));
        this._geometry.setAttribute(
            'size', new THREE.Float32BufferAttribute(sizes, 1));
        this._geometry.setAttribute(
            'colour', new THREE.Float32BufferAttribute(colours, 4));
        this._geometry.setAttribute(
            'angle', new THREE.Float32BufferAttribute(angles, 1));

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.size.needsUpdate = true;
        this._geometry.attributes.colour.needsUpdate = true;
        this._geometry.attributes.angle.needsUpdate = true;
    }

    //更新粒子系统中每个粒子的属性
    _UpdateParticles(timeElapsed) {
        for (let p of this._particles) {
            p.life -= timeElapsed;
        }

        this._particles = this._particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife;

            p.rotation += timeElapsed * 0.5;
            p.alpha = this._alphaSpline.Get(t);
            p.currentSize = p.size * this._sizeSpline.Get(t);
            p.colour.copy(this._colorSpline.Get(t));

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

            //drag表示粒子收到的阻力的向量
            const drag = p.velocity.clone();
            drag.multiplyScalar(timeElapsed * 0.1);
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
            p.velocity.sub(drag);
        }

        // 根据粒子与相机距离位置排序，离相机更近的粒子应该被渲染在离相机更远的粒子之上
        this._particles.sort((a, b) => {
            const d1 = this._camera.position.distanceTo(a.position);
            const d2 = this._camera.position.distanceTo(b.position);

            if (d1 > d2) {
                return -1;
            }
            if (d1 < d2) {
                return 1;
            }
            return 0;
        });
    }

    _UpdatePosition(newPosition,camera) {
        this._initialPosition1.copy(newPosition);
        this._camera=camera;
    }

    Step(timeElapsed) {
        this._AddParticles(timeElapsed);
        this._UpdateParticles(timeElapsed);
        this._UpdateGeometry();
    }
}