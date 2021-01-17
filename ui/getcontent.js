window.addEventListener("message", event => {
    if (event.data.refresh) {
        document.getElementById("myDiv").innerHTML=event.data.content;
    }
}); 

window.oncontextmenu=function(e){
    //取消默认的浏览器自带右键 很重要！！
    e.preventDefault();
    
    //获取我们自定义的右键菜单
    var menu=document.querySelector("#menu");
    
    //根据事件对象中鼠标点击的位置，进行定位
    menu.style.left=e.clientX+'px';
    menu.style.top=e.clientY+'px';
    
    //改变自定义菜单的宽，让它显示出来
    menu.style.width='125px';
    }
    //关闭右键菜单，很简单
window.onclick=function(e){

//用户触发click事件就可以关闭了，因为绑定在window上，按事件冒泡处理，不会影响菜单的功能
　　document.querySelector('#menu').style.width=0;
}

function Show(e) {
    var element = e.element;
    var oldhtml = "test";
    if(element){
        oldhtml = e.element.innerHTML;
    }else{
        element = document.createElement("div")
        element.style.left=e.clientX+'px';
        element.style.top=e.clientY+'px';
        element.innerHTML = "test"

    }

    var newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.value = oldhtml;
    newInput.onblur = function() {
        element.innerHTML = this.value == oldhtml ? oldhtml : this.value;
    }
    
    element.innerHTML = '';
    element.appendChild(newInput);
    newInput.setSelectionRange(0, oldhtml.length);
    newInput.focus();
  }

  window.ondblclick=function(e){
    //用户触发click事件就可以关闭了，因为绑定在window上，按事件冒泡处理，不会影响菜单的功能
    Show(e);
    }