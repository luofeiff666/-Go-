/**
 * Created by AC on 2017/6/21.
 */
//名字空间模块
var app = {
    util: {},
    EventUtil: {}
};
//工具方法模块
app.util = {
    //获取DOM工具
    $: function (selector, node) {
        return (node || document).querySelector(selector);
    },
    _$: function (selector, node) {
        return (node || document).querySelectorAll(selector);
    },
    $$: function (node, cName, value, Ihtml) {
        var elem = document.createElement(node);
        for (var i = 0; i < cName.length; i++) {
            elem.setAttribute(cName[i], value[i]);
        }
        if (Ihtml) {
            elem.innerHTML = Ihtml;
        }

        /* else {
             elem.setAttribute(cName, value);
         }*/
        return elem;
    },

    //设置cookie
    setCookie: function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }
        if (path) {
            cookieText += "; path=" + path;
        }
        if (domain) {
            cookieText += "; domain=" + domain;
        }
        if (secure) {
            cookieText += "; secure=";
        }
        document.cookie = cookieText;
    },

    //获取cookie
    getCookie: function (name) {
        var all = document.cookie,
            cookieName = encodeURIComponent(name) + "=",
            cookieStart = all.indexOf(cookieName),
            cookieValue = null;
        if (cookieStart > -1) {
            var cookieEnd = all.indexOf(';', cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = all.length;
            }
            cookieValue = decodeURIComponent(all.substring(cookieStart + cookieName.length, cookieEnd))
        }
        return cookieValue;
    },

    //删除cookie
    unsetCookie: function (name) {
        this.setCookie(name, "", new Date(0))
    },

    //运动模块
    getMove: function (element, Obj, speedC, fnEnd) {
        //获取计算后样式
        function getStyle(obj, name) {
            if (obj.currentStyle) {
                return obj.currentStyle[name]
            } else {
                return getComputedStyle(obj, false) [name];
            }
        }

        clearInterval(element.times);
        element.times = setInterval(move, 5);//每5毫秒调用move()一次即动一次
        function move() {
            var aStop = true;
            for (var attr in Obj) {
                var current = null;//当前属性的动态值 每调用一次move获取一次
                if (attr === 'opacity') {
                    current = Math.round(parseFloat(getStyle(element, attr)) * 100);//扩大100倍处理
                } else {
                    current = parseInt(getStyle(element, attr));
                }
                var speed = (Obj[attr] - current) / speedC;
                speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                if (current !== Obj[attr]) aStop = false;

                if (attr === 'opacity') { //如果传进来的样式是透明度
                    element.style.filter = 'alpha(opacity=' + (current + speed) + ')';//IE下

                    element.style.opacity = (current + speed) / 100;//换算成opacity
                } else {
                    element.style[attr] = current + speed + 'px';
                }
                if (aStop) {
                    clearInterval(element.times);
                    if (fnEnd) fnEnd();
                }
            }
        }
    },

    //Ajax方法
    ajax: function (obj) {
        var xhr = (function () {
            /*创建XMLHttpRequest对象*/
            if (typeof XMLHttpRequest !== 'undefined') {
                // IE7+, Firefox, Chrome, Opera, Safari
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== 'undefined') {
                //  IE6, IE5
                var version = [
                    'MSXML2.XMLHttp.6.0',
                    'MSXML2.XMLHttp.3.0',
                    'MSXML2.XMLHttp'
                ];
                for (var i = 0; version.length; i++) {
                    try {
                        return new ActiveXObject(version[i]);
                    } catch (e) {
                        /* 忽略这些异常 */
                    }
                }
            } else {
                throw new Error('您的系统或浏览器不支持XHR对象！');
            }
        })();
        /*url加当前时间，防止缓存*/
        obj.url = obj.url + '?rand=' + new Date();
        /*请求参数格式化，encodeURIComponent编码参数可以出现&*/
        obj.data = (function (data) {
            var arr = [];
            for (var i in data) {
                arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
            }
            return arr.join('&');
        })(obj.data);
        if (obj.method === 'get') obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data : '&' + obj.data;
        if (obj.async === true) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    callback();
                }
            };
        }
        xhr.open(obj.method, obj.url, obj.async);
        if (obj.method === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(obj.data);
        } else {
            xhr.send();
        }

        if (obj.async === false) {
            callback();
        }

        function callback() {
            if (xhr.status == 200) {
                obj.success(xhr.responseText);			//回调传递参数
            } else {
                alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
            }
        }
    }
};

//事件处理函数
app.EventUtil = {
    //绑定
    addHandler: function (element, event, fn) {//添加事件
        if (element.addEventListener) {//主流
            element.addEventListener(event, fn, false);
        } else if (element.attachEvent) {//IE
            element.attachEvent("on" + event, fn);
            //在IE中this指向全局
            //给同一个事件添加多个函数不是按照添加的顺序执行 而是相反的顺序
        } else {
            element["on" + event] = fn;//向下兼容DOM0级的操作
        }
    },
    //获取事件
    getEvent: function (event) {
        //FF有个BUG  需要引入事件
        return event ? event : window.event
    },
    //事件的目标
    getTarget: function (event) {
        return event.target || event.srcElement;
    },
    //阻止事件冒泡
    stopPropagation: function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    //取消默认事件
    preventDefault: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    //删除事件 注意传入匿名函数无法删除
    removeHandler: function (element, event, fn) {
        if (element.removeEventListener) {
            element.removeEventListener(event, fn, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + event, fn);
        } else {
            element["on" + event] = null;
        }
    }
};

//处理功能
(function (util, EventUtil) {
    var $ = util.$,
        _$ = util._$;
    //不再提示区
    (function () {
        var title = $('.t-right');
        var coloseTitle = function (e) {
            var name = "title",
                value = "colose";
            util.setCookie(name, value, new Date('january 1,2200'));//设定饼干保质期
            $('.title').style.display = "none";
        };
        //判断是否有记录关闭的cookie
        EventUtil.addHandler(title, 'click', coloseTitle);
        if (util.getCookie('title') === "colose") coloseTitle();
    })();

    //登录区
    (function () {
        var attention = $('.attention'),//关注按钮
            l_mark = $('.l-mark'),//弹框
            l_close = $('.l-colose'),//关闭
            nav_af = $('.nav_af'),
            nav_afOk = $('.nav_afOk');
        if (util.getCookie('followSuc') === 'followSuc') {
            nav_af.style.display = "none";
            nav_afOk.style.display = "block";
        }

        //登录数据处理
        function loCation() {
            var userName = $('.l-text'),//帐号框
                password = $('.l-password');//密码框

            //判断是否设置登录cookie-loginSuc
            if (util.getCookie('loginSuc') === 'ok') {
                nav_af.style.display = "none";
                nav_afOk.style.display = "block";
            } else {
                l_mark.style.display = 'block';//登录//如果已有帐号密码直接登录 变成以关注
                var l_button = $('.l-button'),//登录按钮
                    l_nameTitle = $('.l-nameTitle');//帐号提示信息
                var l_passwordTitle = $('.l-passwordTitle');

                //失去焦点判断帐号格式以及是否允许登陆
                EventUtil.addHandler(userName, 'blur', onBlur);

                function onBlur() {
                    var getName = userName.value,
                        pattern = /^[\w]+(@[\w]+\.)?[\w]+$/;
                    if (pattern.test(getName)) {
                        EventUtil.addHandler(l_button, 'click', submit);//帐号格式正确才可以登录按钮
                    }
                    if (getName === "") {
                        userName.style.borderColor = 'red';
                        l_nameTitle.innerHTML = '请输入帐号';
                        l_nameTitle.style.display = 'block';
                        EventUtil.removeHandler(l_button, 'click', submit);//不可以登录按钮
                    } else if (!pattern.test(getName)) {
                        userName.style.borderColor = 'red';
                        l_nameTitle.innerHTML = '帐号格式错误';
                        l_nameTitle.style.display = 'block';
                        EventUtil.removeHandler(l_button, 'click', submit);//不可以登录按钮
                    }
                }

                //鼠标按下时清空内容以及提示信息
                EventUtil.addHandler(userName, 'mousedown', onMDN);

                function onMDN() {
                    userName.value = "";
                    userName.style.borderColor = '#CCC';
                    l_nameTitle.style.display = 'none';
                }

                //鼠标按下时清空内容以及提示信息
                EventUtil.addHandler(password, 'mousedown', onMDP);

                function onMDP() {
                    password.value = "";
                    password.style.borderColor = '#CCC';
                    l_passwordTitle.style.display = 'none';
                }

                //提交按钮
                function submit() {
                    var getpassword = password.value;
                    if (getpassword === "") {//假如密码没填登录给出警示
                        password.style.borderColor = 'red';
                        l_passwordTitle.style.display = 'block';//显示提示信息
                        l_passwordTitle.innerHTML = '请输入密码';//显示提示信息
                    } else {//验证账号密码
                        var getName = userName.value,
                            getPassword = password.value,
                            md5_userName = md5(getName),//加密md5
                            md5_password = md5(getPassword),
                            data_l = {
                                userName: md5_userName,//
                                password: md5_password//
                            };
                        getLocation(data_l);

                        function getLocation(data) {
                            util.ajax({
                                method: 'get',
                                url: 'http://study.163.com/webDev/login.htm',
                                data: data,
                                success: function (data) {//服务器返回的数据date
                                    set_LCookie(data);
                                },
                                async: true
                            });
                        }

                        //按照请求返回数据处理函数
                        function set_LCookie(data) {
                            if (data === '1') {//判断登陆成功
                                //设置cookie
                                util.setCookie('userName', md5_userName, new Date('Jul 07 2018'));//设定饼干保质期
                                util.setCookie('password', md5_password, new Date('Jul 07 2018'));
                                util.setCookie('loginSuc', 'ok', new Date('Jul 07 2018'));
                                password.style.borderColor = '#CCC';//
                                l_passwordTitle.style.display = 'none';
                                markClose();//登录成功关闭浮层
                                (function success_LCookie() {
                                    util.ajax({//验证关注
                                        method: 'get',
                                        url: 'http://study.163.com/webDev/attention.htm',
                                        success: function (data) {//返回
                                            if (data === '1') {
                                                util.setCookie('followSuc', 'followSuc', new Date('Jul 07 2018'));//设置关注cookie
                                                nav_af.style.display = "none";
                                                nav_afOk.style.display = "block";//设置成已关注
                                            } else {
                                                return;
                                            }
                                        },
                                        async: true
                                    });
                                })()
                            }

                            if (data === '0') {//账号或密码错误
                                password.style.borderColor = 'red';//
                                l_passwordTitle.style.display = 'block';//显示提示信息
                                l_passwordTitle.innerHTML = "帐号或密码错误,请重新输入"
                            }

                        }
                    }
                }
            }
            //禁用鼠标滚动条
            (function () {
                disabledMouseWheel();

                function disabledMouseWheel() {
                    if (document.addEventListener) {
                        document.addEventListener('DOMMouseScroll', scrollFunc, false);
                    }//W3C
                    window.onmousewheel = document.onmousewheel = scrollFunc;//IE/Opera/Chrome
                }

                function scrollFunc() {
                    return false;
                }
            })();
        }

        EventUtil.addHandler(attention, 'click', loCation);

        //点击取消关注事件
        (function () {
            var fansOK = $('.fansOK');
            EventUtil.addHandler(fansOK, 'click', function () {
                nav_af.style.display = "block";
                nav_afOk.style.display = "none";
                util.unsetCookie('userName');
                util.unsetCookie('password');
                util.unsetCookie('loginSuc');
                util.unsetCookie('followSuc');
            })
        })();

        //关闭登录浮层
        EventUtil.addHandler(l_close, 'click', markClose);

        function markClose() {
            l_mark.style.display = 'none';//关闭
            //启用鼠标滚动条
            (function () {
                disabledMouseWheel();

                function disabledMouseWheel() {
                    if (document.addEventListener) {
                        document.addEventListener('DOMMouseScroll', scrollFunc, false);
                    }//W3C
                    window.onmousewheel = document.onmousewheel = scrollFunc;//IE/Opera/Chrome
                }

                function scrollFunc(evt) {
                    return true;
                }
            })();
        }
    })();

    //轮播区
    (function () {
        var ul = $('.pic'),//UL
            li = ul.children,//li
            coin = $('.coin').getElementsByTagName('span'),//导航按钮
            nowZIndex = 2,//ZIndex属性 从2开始  347行代码
            now = 0;//来个空位置
        for (var i = 0; i < coin.length; i++) {
            coin[i].index = i;//把位置给index方便342行代码拿到位置
            EventUtil.addHandler(coin[i], 'mouseover', function (event) {
                EventUtil.getEvent(event);
                if (EventUtil.getTarget(event).index === now) return; //如果点击的就是当前所处的那么后面不执行
                now = EventUtil.getTarget(event).index;//记录当前的位置
                tabP(now);//调用切换函数
            });
        }

        function tabP(now) {
            li[now].style.zIndex = nowZIndex++;//每执行一次自增一次
            li[now].style.filter = 'alpha(opacity=' + 0 + ')';//IE下
            li[now].style.opacity = 0;//淡入0-1
            util.getMove(li[now], {opacity: 100}, 100);//每5ms调用一次 速度是1 从0-100  100次  用时500ms
            for (var i = 0; i < coin.length; i++) {
                coin[i].className = '';//遍历所有的导航按钮 清空CSS
            }
            coin[now].className = 'active';//当前的按钮CSS
        }

        //自动轮播
        var setInterval_Btn = function () {
            function Next() {
                now++;
                if (now === coin.length) now = 0;
                tabP(now);
            }

            var timer = setInterval(Next, 5000);
            EventUtil.addHandler(ul, 'mouseover', function () {
                clearInterval(timer);
            });
            EventUtil.addHandler(ul, 'mouseout', function () {
                timer = setInterval(Next, 5000);
            });
        };
        setInterval_Btn();
    })();

    //内容课程区
    (function () {
        var size = {//记录请求数据
            x: "1",
            y: "10",
            z: "16"
        };
        //获取课程
        getClass(size);

        function getClass(size) {
            util.ajax({
                method: 'get',
                url: 'http://study.163.com/webDev/couresByCategory.htm',
                data: {
                    'pageNo': size.x,//当前页码
                    'psize': size.z, //每页的数据个数
                    'type': size.y//筛选类型
                },
                success: function (data) {//成功获取JSON数据
                    setCars(data);
                },
                async: true
            });
        }

        //设置添加课程
        function setCars(data) {
            var oUl = $('#classUL'),
                //判断如果存在li则删除之前的li
                aLi = oUl.getElementsByTagName('li');
            for (var i = aLi.length - 1; i >= 0; i--) {
                oUl.removeChild(aLi[i])
            }
            var _data = JSON.parse(data);
            for (i = 0; i < _data.list.length; i++) {
                var oLi = util.$$('li', ["id"], [_data.list[i].id]);

                //创建小卡//设置属性
                var small = util.$$('div', ["class"], ['small']);
                var _img = util.$$('img', ["class", "src"], ["middlePhotoUrl", _data.list[i].bigPhotoUrl]);
                var _name = util.$$('p', ["class"], ["name"], _data.list[i].name);

                var _price = util.$$('span', ["class"], ["price"]);
                if (_data.list[i].price === 0) {//判断免费还是咋滴收费 出现不同样式
                    _price.innerHTML = '免费学习';
                    _price.style.color = '#39a030';
                } else {
                    _price.innerHTML = "￥ " + _data.list[i].price;//如果0元显示免费
                }
                var _provider = util.$$('span', ["class"], ["provider"], _data.list[i].provider);
                var _learnerCount = util.$$('div', ["class"], ["learnerCount"], _data.list[i].learnerCount);

                //大卡providerLink
                var big = util.$$('div', ["class"], ['big']);
                var big_top = util.$$('div', ["class"], ['big_top']);
                var _img_big = util.$$('img', ["class", "src"], ["bigPhotoUrl", _data.list[i].bigPhotoUrl]);
                var _a_big = util.$$('a', ["href"], [_data.list[i].providerLink]);
                var _h3name = util.$$('h3', ["class"], ['name'], _data.list[i].name);
                var big_top_s = util.$$('span', ["class"], ['big_top_s learnerCount'], _data.list[i].learnerCount + '人在学');
                var provider_big = util.$$('span', ["class"], ['provider_big'], '发布者: ' + _data.list[i].provider);
                var categoryName = util.$$('span', ["class"], ['categoryName'], '要&nbsp;&nbsp;&nbsp;&nbsp;求: ' + _data.list[i].targetUser);
                var _description = util.$$('p', ["class"], ['description'], _data.list[i].description);

                //添加
                small.appendChild(_img);
                small.appendChild(_name);
                small.appendChild(_provider);
                small.appendChild(_learnerCount);
                small.appendChild(_price);

                big_top.appendChild(_img_big);
                big_top.appendChild(_h3name);
                big_top.appendChild(big_top_s);
                big_top.appendChild(_a_big);
                big_top.appendChild(categoryName);
                _a_big.appendChild(provider_big);

                big.appendChild(big_top);
                big.appendChild(_description);
                oLi.appendChild(small);
                oLi.appendChild(big);
                oUl.appendChild(oLi);
            }
        }

        //tab课程分类区
        (function () {
            var sec_art_h = $('.sec_art_h').getElementsByTagName('div');
            var now = 0;
            for (var i = 0; i < sec_art_h.length; i++) {
                sec_art_h[i].index = i; //this的index是i
                EventUtil.addHandler(sec_art_h[i], 'click', tab);

                function tab(event) {
                    EventUtil.getEvent(event);
                    if (EventUtil.getTarget(event).index === now) return;
                    now = EventUtil.getTarget(event).index;
                    for (var i = 0; i < sec_art_h.length; i++) {
                        sec_art_h[i].className = 'sec_art_h1' + '';
                    }
                    EventUtil.getTarget(event).className = 'sec_art_h1' + ' sec_art_h_active';

                    //判断Tab项 然后获取对应课程
                    (now === 0) ? size.y = '10' : size.y = '20';
                    //每次切换TAB分类使得页码回归第一页
                    size.x = '1';
                    nowIndex = 0;
                    setColor(size, nowIndex);
                    getClass(size);
                }
            }
        })(size, setColor);

        //翻页区 setPage
        var buttonPage = _$('.button'),
            nowIndex = 0;
        for (var k = 0; k < buttonPage.length; k++) {
            buttonPage[k].index = k;
            EventUtil.addHandler(buttonPage[k], 'click', function () {
                if (this.index === nowIndex) return;
                nowIndex = this.index;
                setColor(size, nowIndex);
            })
        }

        //设置页码标记
        setColor(size, nowIndex);

        function setColor(size, nowIndex) {
            for (var i = 0; i < buttonPage.length; i++) {
                buttonPage[i].style.color = '';
            }
            buttonPage[nowIndex].style.color = '#47c93c';
            size.x = (parseInt(nowIndex) + 1).toString();
            getClass(size);
            aBtnMove(size);

            //翻页按钮
            function aBtnMove(size) {
                var aBtnPrev = $('.le'),
                    aBtnNext = $('.ri');
                aBtnPrev.onclick = function () {//上翻
                    //问题怎么这里换成EventUtil.addHandler()就出现课程卡片翻页后闪烁的BUG
                    nowIndex--;
                    if (nowIndex === -1) {
                        nowIndex = 0;
                    }
                    setColor(size, nowIndex);
                };
                aBtnNext.onclick = function () {
                    nowIndex++;
                    if (nowIndex === buttonPage.length) {//下翻
                        nowIndex = 7;
                    }
                    setColor(size, nowIndex);
                };
            }
        }
    })();

    //视频浮层
    (function () {
        var v_close = $('.v-close'), //视频关闭按钮
            video = $('.video'), //视频
            v_button = $('.v-button'), //视频点击弹窗按钮
            v_mark = $('.v-mark'); //遮罩层

        EventUtil.addHandler(v_button, 'click', function () {
            var _scrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
                _scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            v_mark.style.width = _scrollWidth + 'px';
            v_mark.style.height = _scrollHeight + 'px';
            v_mark.style.display = 'block';
            video.play();
        });
        EventUtil.addHandler(v_close, 'click', function () {
            v_mark.style.display = 'none';
            video.pause();
        });
    })();

    //热门课程
    (function () {
        util.ajax({
            method: 'get',
            url: 'http://study.163.com/webDev/hotcouresByCategory.htm',
            success: function (data) {//成功获取JSON数据
                var sec_ul = $('.sec_ul'),
                    _data = JSON.parse(data);
                for (var i = 0; i < _data.length; i++) {
                    //创建元素
                    var s_li = util.$$('li', ["id"], [_data[i].id]),
                        s_a = util.$$('a', ["href"], [_data[i].providerLink]),
                        s_img = util.$$('img', ["src", "class"], [_data[i].smallPhotoUrl, 'smallPhotoUrl']),
                        s_name = util.$$('h3', ["class"], ['name'], _data[i].name),
                        s_learnerCount = util.$$('span', ["class"], ['learnerCount'], _data[i].learnerCount);

                    //添加到父级
                    s_a.appendChild(s_img);
                    s_a.appendChild(s_name);
                    s_a.appendChild(s_learnerCount);
                    s_li.appendChild(s_a);
                    sec_ul.appendChild(s_li)
                }

                //轮播热门
                (function () {
                    sec_ul.innerHTML = sec_ul.innerHTML + sec_ul.innerHTML;
                    var topC = 0,
                        timer = setInterval(getMoveLi, 5000);

                    //鼠标悬停停止滚动
                    EventUtil.addHandler(sec_ul, 'mouseover', function () {
                        clearInterval(timer);
                    });

                    //鼠标离开继续
                    EventUtil.addHandler(sec_ul, 'mouseout', function () {
                        timer = setInterval(getMoveLi, 5000);
                    });

                    function getMoveLi() {
                        topC -= 70;
                        if (topC === -1470) {
                            topC = -70;
                            sec_ul.style.top = 0;
                        }
                        util.getMove(sec_ul, {top: topC}, 10);
                    }
                })()
            },
            async: true
        });
    })();

})(app.util, app.EventUtil);