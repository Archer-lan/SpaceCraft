// class obj{
//     constructor(){
//         this.value=4;
//     }
// }
// let object = new obj();
// console.log(object.valueOf()===object);
// object.prototype.valueOf = function(){
//     return this.value
// }
// console.log(object.prototype.valueOf())
let obj={
    age: 18,
    nature: ['smart', 'good'],
    names: {
        name1: 'fx',
        name2: 'xka'
    },
    love: function () {
        console.log('fx is a great girl')
    }
}

function shallowCopy(obj){
    const newObj ={}
    console.log(Object.keys(obj));
    for(let key in obj){
        if(obj.hasOwnProperty(key)){
            newObj[key] = obj[key];
        }
    }
    return newObj;
}
shallowCopy(obj);

//深拷贝
const obj2 = JSON.parse(JSON.stringify(obj));
//此方法存在弊端，会忽略对象中的undefined、symbol和函数
console.log(obj2);