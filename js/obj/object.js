/**
 * 单个物体类用于管理物体数据
 */
export default class Obj{
    constructor(mesh,line,rotate,fire){
        this.mesh = mesh;//单个飞行器的mesh
        this.line = line;//飞行器坠落轨迹
        this.rotate = rotate;
        this.index=0;//用于控制当前飞行器位置的参数
        this.fire=fire;//用于存放火焰的mesh
    }
}