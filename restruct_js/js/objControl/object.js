/**
 * 单个物体类用于管理物体数据
 */
export default class Obj{
    constructor(mesh,line,rotate,fire){
        this.mesh = mesh;
        this.line = line;
        this.rotate = rotate;
        this.index=0;
        this.fire=fire;
    }
}