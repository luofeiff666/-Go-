/**
 * Created by AC on 2017/5/31.
 */
//获取非行间样式即计算后的样式
function getStyle(obj, name) {
    if (obj.currentStyle) {
        return obj.currentStyle[name]
    } else {
        return getComputedStyle(obj, false) [name];
    }
}
moulde.expand=getStyle;//模版 代码可能写错了