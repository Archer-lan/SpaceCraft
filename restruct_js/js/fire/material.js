import * as THREE from 'three';

const SPRITE_ROW_LENGTH = 4;
const ONE_SPRITE_ROW_LENGTH = 1 / SPRITE_ROW_LENGTH;

let texture;

function getTexture(){
    if ( !! texture ) return texture;

	const image = new Image();

	texture = new THREE.Texture();
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.image = image;

	image.onload = () => {
		texture.needsUpdate = true;
	};

    image.src = './restruct_js/js/fire/data-image.png'
	return texture;
}

export class Material {
    constructor( parameters ) {

        const uniforms = {
            color            : { value: null },
            size             : { value: 0.0 },
            map              : { value: getTexture() },
            time             : { value: 0.0 },
            heightOfNearPlane: { value: 0.0 }
        };

        const material = new THREE.ShaderMaterial({

            uniforms      : uniforms,

            vertexShader  : [
                'attribute float random;', //从缓冲区中获取每个粒子的随机值。
                'attribute float sprite;',	//从缓冲区中获取每个粒子的精灵图
                'uniform float time;',	//用于动画中的时间控制
                'uniform float size;',	//表示粒子的大小
                'uniform float heightOfNearPlane;',	//表示近裁剪平面的高度

                'varying float vSprite;',	//将精灵图传递给片元着色器的varying变量
                'varying float vOpacity;',	//将透明度传递给片元着色器的varying变量。

                'float PI = 3.14;',

                'float quadraticIn( float t ) {',	//定义一个平方缓入的函数。

                    'float tt = t * t;',
                    'return tt * tt;',

                '}',

                'void main() {',
                    //计算当前动画时间的分数部分，用于动画的变化
                    'float progress = fract( time + ( 2.0 * random - 1.0 ) );',
                    // 计算动画的逆进度，用于调整影响
                    'float progressNeg = 1.0 - progress;',
                    //// 通过平方缓入函数，将进度映射为缓动效果
                    'float ease = quadraticIn( progress );',
                    // 通过正弦函数，生成影响值，用于在动画中调整位置
                    'float influence = sin( PI * ease );',
                    // 根据缓动效果调整粒子位置
                    'vec3 newPosition = position * vec3( 1.0, ease, 1.0 );',
                    // 计算粒子在屏幕上的位置，以及它在屏幕上的大小
                    'gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );',
                    'gl_PointSize = ( heightOfNearPlane * size ) / gl_Position.w;',
                    // 计算透明度，考虑缓动效果和动画进度
                    'vOpacity = min( influence * 4.0, 1.0 ) * progressNeg;',
                    // 传递精灵图索引给片元着色器
                    'vSprite = sprite;',

                '}'
            ].join( '\n' ),

            fragmentShader: [
                'uniform vec3 color;',	//表示粒子的颜色
                'uniform sampler2D map;',	//表示粒子的纹理贴图

                'varying float vSprite;',
                'varying float vOpacity;',

                'void main() {',
                    // 计算精灵纹理坐标
                    'vec2 texCoord = vec2(',
                        'gl_PointCoord.x * ' + ONE_SPRITE_ROW_LENGTH + ' + vSprite,',
                        'gl_PointCoord.y',
                    ');',
                    // 从纹理中获取颜色，考虑粒子的透明度、精灵图索引和整体颜色
                    'gl_FragColor = vec4( texture2D( map, texCoord ).xyz * color * vOpacity, 1.0 );',

                '}'
            ].join( '\n' ),

            blending   : THREE.AdditiveBlending,
            depthTest  : true,
            depthWrite : false,
            transparent: true,
            // fog        : true

        } );

        material.color = new THREE.Color( 0xff2200 );
        material.size = 0.4;

        if ( parameters !== undefined ) {
            material.setValues( parameters );
        }

        material.uniforms.color.value = material.color;
        material.uniforms.size.value = material.size;

        material.update = function( delta ) {

            material.uniforms.time.value = ( material.uniforms.time.value + delta ) % 1;

        }

        material.setPerspective = function( fov, height ) {

            material.uniforms.heightOfNearPlane.value = Math.abs( height / ( 2 * Math.tan( THREE.MathUtils.degToRad( fov * 0.5 ) ) ) );

        }

        return material;

    }
}