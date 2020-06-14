import _ from 'lodash'
import md5 from 'js-md5'
import axios from 'axios'

const ua = navigator.userAgent.toLowerCase() //判断浏览器类型
let date = null,
	sysPlatform = '',
	offSet = 60 * 1000 * (new Date(0)).getTimezoneOffset();
let week = {
    '0': '日',
    '1': '一',
    '2': '二',
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六'
};

let regObj = {
    'chsName': /^[\u4E00-\u9FFF]([\u4E00-\u9FFF]{0,3})[\u4E00-\u9FFF]$/, // 2-5汉字
    'vCode4': /^\d(\d{2})\d$/, // 4位验证码
    'vCode6': /^\d(\d{4})\d$/, // 6位验证码
    'mobile': /^1\d{10}$/, // 通用手机号
    'email': /^(\w)+[(\.\w+)|(\-\w+)]*@(\w)+(([\.|\-]\w+)+)$/, // 邮箱
    'strongPwd': /^(?=.*[A-Za-z]+)(?=.*\d+)(?=.*[\~\!\@\#\$%\^&\*\(\)_\+\{\}\:\;\"\"\'\/\`\?\<\>\.\,\[\]\-\=\\\|]+)[A-Za-z\d\x21-\x7e]{8,16}$/, // 强密码
    'normalPwd': /^[A-Za-z0-9]{6,}$/g // 数字、字母不少于6位
}

const arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] // 加权因子
const arrValid = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'] // 校验码
let regFunc = {
    idNum(cid) {
        if (/^\d{17}(\d|x|X)$/i.test(cid)) {
            let sum = 0
            let idx = 0
            for (var i = 0; i < cid.length - 1; i++) {
                // 对前17位数字与权值乘积求和
                sum += parseInt(cid.substr(i, 1), 10) * arrExp[i]
            }
            // 计算模（固定算法）
            idx = sum % 11
            // 检验第18为是否与校验码相等
            return arrValid[idx] === cid.substr(17, 1).toUpperCase()
        } else if (/^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(cid)) {
            return true
        } else {
            return false
        }
    }
}

let crypts = {
    encode(val) {
        if (val === undefined) {
            return window.encodeURIComponent('')
        }

        if (typeof val === typeof 1) {
            val += ''
        }

        if (_.isObject(val)) {
            return window.encodeURIComponent(JSON.stringify(val))
        } else if (typeof val === typeof 'a') {
            return window.encodeURIComponent(val)
        } else {
            return window.encodeURIComponent('')
        }
    },
    decode(val) {
        try {
            return JSON.parse(window.decodeURIComponent(val))
        } catch (e) {
            return window.decodeURIComponent(val)
        }
    }
}
if (/iphone|ipad|ipod/.test(ua)) { //调用设备对象的test方法判断设备类型
	sysPlatform = 'IOS'
} else if (/android/.test(ua)) {
	sysPlatform = 'ANDROID'
} else {
	sysPlatform = ''
}
let cookiePosBegin = -1
let cookiePosEnd = -1

export const validator = (val, type) => {
    if (type === 'idNum') {
        return regFunc.idNum(val)
    } else if (typeof type === typeof 'a' && !!regObj[type]) {
        regObj[type].lastIndex = 0
        return regObj[type].test(val)
    } else {
        return false
    }
}

export const dateFormatter = (datetime, fmt, fix) => {
    offSet = !fix ? 0 : offSet
    if (datetime instanceof Date) {
        date = datetime
    } else {
        date = new Date(+datetime + offSet)
    }
    let o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': (date.getHours() % 24) === 0 ? 0 : (date.getHours() % 24), // 小时
        'H+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[date.getDay() + ''])
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
    }
    return fmt
}
export const cookieCan = (name, value, options, noMd5) => {
    if (typeof name !== typeof 'a') {
        return ''
    }

    if (
        typeof value === typeof 'a' || // 字符串
        typeof value === typeof 1 || // 数字
        !_.isEmpty(value) || // 非空对象
        _.isEqual(value, {}) ||
        _.isEqual(value, [])
    ) {
        // 存
        if (typeof value === typeof 1) {
            value += ''
        }

        options = options || {
            expires: 30
        }
        date = new Date()
        date.setMilliseconds(date.getMilliseconds() + (+options.expires * 24 * 60 * 60 * 1000))
        document.cookie = [
            (!noMd5 ? md5(name) : name),
            '=', crypts.encode(value),
            options.expires ? '; expires=' + date.toUTCString() : '',
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join('')

        return ''
    } else {
        // 取值
        if (document.cookie.length > 0) {
            if (!noMd5) {
                cookiePosBegin = document.cookie.indexOf(md5(name)) + md5(name).length + 1
            } else {
                cookiePosBegin = document.cookie.indexOf(name) + name.length + 1
            }
            cookiePosEnd = document.cookie.indexOf(';', cookiePosBegin)
            if (cookiePosEnd === -1) {
                cookiePosEnd = document.cookie.length
            }
            return crypts.decode(document.cookie.substring(cookiePosBegin, cookiePosEnd))
        } else {
            return ''
        }
    }
}

export const sessionCan = (name, obj) => {
    if (
        (typeof name === typeof 'a') &&
        _.isEmpty(obj) &&
        !_.isEqual(obj, {}) &&
        !_.isEqual(obj, [])
    ) { // 取
        if (!window.sessionStorage) {
            return cookieCan(name) || {}
        } else {
            return crypts.decode(window.sessionStorage.getItem(md5(name))) || {}
        }
    } else if (
        (typeof name === typeof 'a') &&
        (!_.isEmpty(obj) || _.isEqual(obj, {}) || _.isEqual(obj, []))
    ) { // 存
        if (!window.sessionStorage) {
            cookieCan(name, obj)
        } else {
            window.sessionStorage.setItem(md5(name), crypts.encode(obj))
        }
        return {}
    } else {
        return {}
    }
}

export const storageCan = (name, obj) => {
    if (
        (typeof name === typeof 'a') &&
        _.isEmpty(obj) &&
        !_.isEqual(obj, {}) &&
        !_.isEqual(obj, [])
    ) { // 取
        if (!window.localStorage) {
            return cookieCan(name) || {}
        } else {
            return crypts.decode(window.localStorage.getItem(md5(name))) || {}
        }
    } else if (
        (typeof name === typeof 'a') &&
        (!_.isEmpty(obj) || _.isEqual(obj, {}) || _.isEqual(obj, []))
    ) { // 存
        if (!window.localStorage) {
            cookieCan(name, obj)
        } else {
            window.localStorage.setItem(md5(name), crypts.encode(obj))
        }
        return {}
    } else {
        return {}
    }
}

// only get val from cookie when key is NOT md5 encoded
export const pureCookie = (name, value, options) => {
    return cookieCan(name, value, options, true)
}

/*
 * 数组重排方法，
 * @params  origin 原始数组
 *          target 需要挪动的数组
 *          direction 方向 'left' or 'right'
 */
export const reAlignArray = (origin, target, direction) => {
    let newArr = origin ? _.clone(origin) : []
    let index = -1
    let edgeIndex = -1
    let item = null

    target = target || []
    direction = direction || 'right'

    if (direction === 'right') { // 右移
        edgeIndex = newArr.indexOf(target[target.length - 1])
        // 边界条件
        if (edgeIndex >= (newArr.length - 1) || edgeIndex === -1) {
            return newArr
        }
        // 倒序循环
        for (let i = target.length - 1; i >= 0; i--) {
            item = target[i]
            index = newArr.indexOf(item)
            if (index < (newArr.length - 1)) {
                newArr[index] = newArr[index + 1]
                newArr[index + 1] = item
            }
        }
    } else { // 左移
        edgeIndex = newArr.indexOf(target[0])
        // 边界条件
        if (edgeIndex <= 0 || edgeIndex === -1) {
            return newArr
        }
        // 正序循环
        for (var i = 0; i < target.length; i++) {
            item = target[i]
            index = newArr.indexOf(item)
            if (index > 0) {
                newArr[index] = newArr[index - 1]
                newArr[index - 1] = item
            }
        }
    }
    return newArr
}

export const convertSecondToTime = sec => {
    if (sec === 0) {
        return sec
    }
    let hh = 0
    let mm = 0
    let ss = 0
    const step = 60
    const fix = t => {
        return t < 10 ? '0' + t : t + ''
    }
    const timeOffset = (t, step) => {
            return [Math.floor(t / step), t % step]
        }
        [mm, ss] = timeOffset(sec, step)
    if (mm > 59) {
        [hh, mm] = timeOffset(mm, step)
    }
    return [fix(hh), fix(mm), fix(ss)].join(':')
}

export const goodTime = str => {
  if(str != null){
    let now = new Date().getTime()
    let oldTime = new Date(str.replace(/-/g, "/")).getTime()
    let d = new Date(str.replace(/-/g, "/"));
    let year_1 = d.getFullYear();
    let month_1 = d.getMonth() + 1;
    let date_1 = d.getDate();
    let my_hours = d.getHours();
    let my_minutes = d.getMinutes();
    let difference = now - oldTime
    let result = ''
    let minute = 1000 * 60
    let hour = minute * 60
    let day = hour * 24
    let month = day * 30
    let year = month * 12
    let _year = difference / year
    let _month = difference / month
    let _week = difference / (7 * day)
    let _day = difference / day
    if (month_1 < 10) {
      month_1 = '0' + month_1
    }
    if (date_1 < 10) {
      date_1 = '0' + date_1
    }
    if (_year >= 1) {
      result = year_1 + '-' + month_1 + '-' + date_1
    } else if (_month >= 1) {
      result = month_1 + '-' + date_1
    } else if (_week >= 1) {
      result = month_1 + '-' + date_1
    } else if (_day >= 1) {
      result = month_1 + '-' + date_1
    } else {
      if (my_minutes < 10) {
        my_minutes = '0' + my_minutes
      }
      if (my_hours < 10) {
        my_hours = '0' + my_hours
      }
      result =  my_hours + ':' + my_minutes
    }
    return result
  }
}


export const amountFormat = (x) => {
    if (isNaN(parseFloat(x))) {
        return false;
    }
    let f = Math.round(x * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}

/**
 * 获取URL参数
 **/
export const getQueryString = (key) => {
    // let hashSearch = window.location.hash.split('?')[1];
    let hashSearch = window.location.href.split('?')[1];
    let reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    if (hashSearch) {
        let result = hashSearch.match(reg);
        return result ? decodeURIComponent(result[2]) : null;
    }
}

/**
 * 获取 toolType
 **/
export const getToolType = () => {
    let ua = navigator.userAgent.toLowerCase();
    let isIos = /\(i[^;]+;( u;)? cpu.+mac os x/i.test(ua); // IOS
    let isAndroid = /android/i.test(ua) || /linux/i.test(ua); // 安卓
    let isWechat = ua.match(/micromessenger\/(\d+\.\d+\.\d+)/) || ua.match(/micromessenger\/(\d+\.\d+)/); // 微信
    let isAliPay = ua.match(/alipaydefined\/(\d+\.\d+\.\d+)/) || ua.match(/aliapp\/(\d+\.\d+)/) || ua.match(/alipayclient\/(\d+)/); // 支付宝
    let isWeibo = /weibo/i.test(ua); // 微博
    let isIosQQ = isIos && / qq/i.test(ua); // IOS qq
    let isAndroidQQ = isAndroid && /mqqbrowserqq/i.test(ua); // 安卓 qq
    let toolType = null
    if (getQueryString('toolType')) {
        toolType = getQueryString('toolType')
    } else {
        if (isWechat) {
            toolType = 1;
        } else if (isAliPay) {
            toolType = 2;
        } else if (isWeibo) {
            toolType = 7;
        } else if (isIosQQ || isAndroidQQ) {
            toolType = 6;
        } else {
            toolType = 3;
        }
    }
    return toolType
}
/**
 * 微信授权
 **/
export const weChat = (shareObj) => {
    let hostName = window.location.host;
    let urlIp = '';
    if ((hostName === '10.164.235.138') || (hostName === 'cms-web.lovehaimi.com')) {
        urlIp = 'https://sdk.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + encodeURIComponent(shareObj.link);
    } else if (hostName === '10.164.239.110') {
        urlIp = 'http://sdk-uat.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + encodeURIComponent(shareObj.link);
    } else if (hostName === '10.164.239.51') {
        urlIp = 'http://sdk.sit.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + encodeURIComponent(shareObj.link);
    } else {
        urlIp = 'http://sdk.sit.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + encodeURIComponent(shareObj.link);
    }
    // if ((hostName === '10.164.235.138') || (hostName === 'cms-web.lovehaimi.com')) {
    //   urlIp = 'https://sdk.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + shareObj.link;
    // } else if (hostName === '10.164.239.110') {
    //   urlIp = 'http://sdk-uat.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + shareObj.link;
    // } else if (hostName === '10.164.239.51') {
    //   urlIp = 'http://sdk.sit.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + shareObj.link;
    // } else {
    //   urlIp = 'http://sdk.sit.lovehaimi.com/sdk-web-haimi/outer/initJs?url=' + shareObj.link;
    // }
    return axios({
        method: 'get',
        url: urlIp,
    }).then(function (res) {
        if (res.data.code == 0) {
            let timestamp = res.data.content.timestamp;
            let nonceStr = res.data.content.nonceStr;
            let signature = res.data.content.signature;
            let appId = res.data.content.appid;

            wx.config({
                debug: true, // 开fff启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: appId,
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: nonceStr, // 必填，生成签名的随机串
                signature: signature, // 必填，签名
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            wx.ready(function (res) {
                wx.onMenuShareAppMessage({
                    title: shareObj.title,
                    desc: shareObj.desc,
                    link: shareObj.link,
                    imgUrl: shareObj.imgUrl,
                    trigger: function (res) {},
                    success: function (res) {},
                    cancel: function (res) {},
                    fail: function (res) {}
                });
                wx.onMenuShareTimeline({
                    title: shareObj.title,
                    desc: shareObj.desc,
                    link: shareObj.link,
                    imgUrl: shareObj.imgUrl,
                    trigger: function (res) {},
                    success: function (res) {},
                    cancel: function (res) {},
                    fail: function (res) {}
                });
            });
        }
    }).catch(function (err) {
        console.log(err)
    })
}

/**
 * 获取IP地址
 **/
export const getIpObj = () => {
    let ipObj;
    let hostName = window.location.host;
    let ipUrl = '';
    if ((hostName === '10.164.235.138') || (hostName === '10.164.235.139') || (hostName === 'cms-web.lovehaimi.com')) {
        ipUrl = 'https://burypoint.lovehaimi.com/bury-point-web/bury-point/ip/get';
    } else if (hostName === '10.164.239.110') {
        // urlIp = 'https://burypoint-uat.lovehaimi.com';
        ipUrl = 'http://10.164.239.113:8080/bury-point-web/bury-point/ip/get';
    } else if (hostName === '10.164.239.51') {
        ipUrl = 'http://10.164.239.51:8082/bury-point-web/bury-point/ip/get';
    } else {
        ipUrl = 'http://10.164.239.51:8082/bury-point-web/bury-point/ip/get';
    }

    axios({
        method: 'post',
        url: ipUrl,
    }).then(function (resp) {
        if (resp.data && (resp.data.code === '000')) {
            ipObj = resp.data.content.ip
            console.log(ipObj)
            return ipObj
        }
    }).catch(function (err) {
        console.log(err)
    })

    // setTimeout(function () {
    //   console.log(ipObj)
    //   return ipObj
    // }, 600)

}

/**
 * 发送埋点
 **/
export const buryPoint = (name, sign) => {
    let hostName = window.location.host;
    let urlIp = '';
    if ((hostName === '10.164.235.138') || (hostName === '10.164.235.139') || (hostName === 'cms-web.lovehaimi.com')) {
        urlIp = 'https://burypoint.lovehaimi.com';
    } else if (hostName === '10.164.239.110') {
        // urlIp = 'https://burypoint-uat.lovehaimi.com';
        urlIp = 'http://10.164.239.113:8080';
    } else if (hostName === '10.164.239.51') {
        urlIp = 'http://10.164.239.51:8082';
    } else {
        urlIp = 'http://10.164.239.51:8082';
    }
    let ajaxUrl = urlIp + '/bury-point-web/bury-point/' + name + '/add'; // 拼接为完整URL
    let ipUrl = urlIp + '/bury-point-web/bury-point/ip/get';
    let headObj = {};
    sign.ipAddress = '';
    sign.toolType = getToolType();

    getQueryString('mobile') ? sign.mobile = getQueryString('mobile') : '';
    getQueryString('deviceId') ? sign.deviceId = getQueryString('deviceId') : '';
    getQueryString('appVersion') ? headObj.mmAppVer = getQueryString('appVersion') : '';
    getQueryString('phoneBrand') ? headObj.phoneBrand = getQueryString('phoneBrand') : '';
    getQueryString('phoneType') ? headObj.phoneType = getQueryString('phoneType') : '';
    getQueryString('versionNo') ? headObj.versionNo = getQueryString('versionNo') : '';

    axios({
        method: 'post',
        url: ipUrl,
    }).then(function (resp) {
        if (resp.data && (resp.data.code === '000')) {
            let content = resp.data.content
            sign.ipAddress = content && content.ip ? content.ip : '';
        }
    }).catch(function (err) {
        console.log(err);
    })

     !sign.ipAddress && returnCitySN ? sign.ipAddress =returnCitySN["cip"] : '';
    // sign.ipAddress = returnCitySN["cip"];

    setTimeout(function () {
        return axios({
            method: 'post',
            url: ajaxUrl,
            data: sign,
            // headers: {
            //   'mmAppVer': headObj.mmAppVer,
            //   'phoneBrand': headObj.phoneBrand,
            //   'phoneType': headObj.phoneType,
            //   'versionNo': headObj.versionNo,
            // }
            // headers: headObj,
        }).then(function (resp) {}).catch(function (err) {
            console.log(err);
        })
    }, 500)
}

/**
 * 显示遮罩层
 **/
export const toShare = () => {
    let _dom = {
        // dom show
        show: function ($dom) {
            $dom && ($dom.style.display = "block");
        },
        // dom hide
        hide: function ($dom) {
            $dom && ($dom.style.display = "none");
        },
        // append dom
        appendDom: function ($parent, $el) {
            $parent.appendChild($el);
        },
        // remove dom
        removeDom: function ($el) {
            $el.parentNode.removeChild($el);
        },
        // append dom to body
        appendToBody: function ($el) {
            document.body.appendChild($el);
        },
        // add class
        addClass: function ($el, className) {
            if ($el.classList) {
                $el.classList.add(className);
            } else {
                $el.className += ' ' + className;
            }
        },
        // remove class
        removeClass: function ($el, className) {
            if ($el.classList) {
                $el.classList.remove(className);
            } else {
                $el.className = $el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },
        //判断中文字符
        isChinese: function (str) {
            let strGroup = /[u00-uFF]/;
            return !strGroup.test(str);
        },
        strlen: function (str) {
            let strlength = 0;
            for (let i = 0; i < str.length; i++) {
                if (_dom.isChinese(str.charAt(i)) == true) {
                    strlength = strlength + 2;
                } else {
                    strlength = strlength + 1;
                }
            }
            return strlength;
        }
    };
    if (document.getElementsByClassName("open-sarari-tip").length > 0) {
        return;
    }
    if (document.getElementsByClassName("open-sarari-tip").length > 0) {
        return;
    }
    let $node = document.createElement("div");
    _dom.addClass($node, 'open-sarari-tip');
    $node.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        _dom.removeDom(document.getElementsByClassName("open-sarari-tip")[0]);
    };
    document.body.appendChild($node);
}

/**
 * 设置 cookie
 **/
export const setCookie = (name, value, day) => {
    let exp = new Date();
    exp.setTime(exp.getTime() + day * 60 * 60 * 1000 * 24);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

/**
 * 获取 cookie
 **/
export const getCookie = (name) => {
    let arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) return unescape(arr[2]);
    return null;
}

/**
 * 删除 cookie
 **/
export const delCookie = (name) => {
    let exp = new Date();
    exp.setTime(exp.getTime() - 1);
    let cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

export const hideMobile = (value) => {
    if (!value || value.length !== 11) return value;
    value = String(value);
    const len = value.length
    let str = ''
    str = value.substring(0, 3) + ' **** ' + value.substring(len - 4, len)
    return str
}

export const hideIdentification = (value) => {
    if (!value || value.length < 7) return value;
    value = String(value);
    const len = value.length
    let str = ''
    str = value.substring(0, 3) + ' ********* ' + value.substring(len - 4, len)
    return str
}
export const getStatusVal = (value) => {
	let type = ''
	if(value.status == 0){
		type = '下架'
	}else if(value.status == 1){
		type = '上架'
	}
	return type
}
export const getproductStatusVal = (value) => {
	let type = ''
	if(value.productStatus == 0){
		type = '下架'
	}else if(value.productStatus == 1){
		type = '上架'
	}
	return type
}

export const getReturnStatusVal = (value) => {
	let type = ''
	if(value.returnOrdersStatus == 0){
		type = '下架'
	}else if(value.returnOrdersStatus == 1){
		type = '上架'
	}
	return type
}
/**
 * 金钱展示
 **/
export const formatMoney = (amount, fixed) => {
	//  /* 千分位方法，支持小数*/
	const toThousands = num => {
		let arr = [],
			result = '';

		num = (num || 0).toString()
		if(num.indexOf('.') != -1) {
			arr = num.split('.')
			num = arr[0]
		}
		while(num.length > 3) {
			result = ',' + num.slice(-3) + result
			num = num.slice(0, num.length - 3)
		}
		num ? result = num + result : ''
		arr.length > 0 ? result += '.' + arr[1] : ''
		return result
	}
	if(~~(amount) === 0) {
		return '0.00'
	}
	fixed = fixed || 0

	let tmpNumber = fixed == 1 ? (amount).toFixed(2) : parseInt(amount, 10)
	return tmpNumber >= 1000 ? toThousands(tmpNumber) : tmpNumber
}


export const moneyFormat = (row, column) => {
	let type = ''
  type = row.productNum*row.salePrice
	return type
}
// export const formatMoney = (row, column) => {
// 	var value = row[column.property];
// 	var val = ''
// 	if(value == 0){
// 		val = 0
// 	}else if(value > 0){
// 		val = parseFloat(value)/100
// 	}else if(!value){
// 		val = ''
// 	}
// 	return val
// }
/*
 * 控制页面字体大小
 */
export const resetFontSize = (doc, win) => {
	let docEle = doc.documentElement,
		// evt = 'orientationchange' in window ? 'orientationchange' : 'resize,
		fn = function() {
			setTimeout(function() {
				let width = docEle.clientWidth
				width && (docEle.style.fontSize = 10 * (width / 375) + 'px')
			}, 1000 / 60)
		}
	'orientationchange' in win ? win.addEventListener('orientationchange', fn, false) : ''
	win.addEventListener('resize', fn, false)
	doc.addEventListener('DOMContentLoaded', fn, false)
	fn()
}
/*
 * 移动端重绘
 */
export const resetWindow = () => {
	// 重设 viewport 的 height ，防止在 ios 低版本下高度的bug
	const resetViewHeight = (h) => {
		let vpList = document.getElementsByName('viewport')
		_.forEach(vpList, vp => {
			let content = vp.getAttribute('content')
			vp.setAttribute('content', content.replace(/height=.+?,/gi, 'height=' + h + ','))
		})
	}
	const resetWidth = () => {
		let winW = window.innerWidth || document.documentElement.clientWidth
		// console.log(winW)
		document.documentElement.style.width = winW + 'px'
		document.body.style.width = winW + 'px'
		document.body.style.overflowX = 'hidden'
		localStorage.setItem('width', winW)
	}
	const resetHeight = () => {
		let winH = window.innerHeight || document.documentElement.clientHeight
		// console.log(winH)
		document.documentElement.style.height = winH + 'px'
		document.body.style.height = winH + 'px'
		let pageContainers = document.querySelectorAll('.page-container')
		_.forEach(pageContainers, pc => {
			pc.style.minHeight = winH + 'px'
			pc.style.height = winH + 'px'
		})
		sysPlatform === 'IOS' ? resetViewHeight(winH) : ''
		// console.log('window height:' + winH)
	}
	resetWidth()
	resetHeight()
	window.addEventListener('resize', () => {
		resetWidth()
		resetHeight()
	})
	window.addEventListener('orientationchange', () => {
		resetWidth()
		resetHeight()
	})
	document.addEventListener('focusout', () => {
		window.scrollTo(0, 0)
	})
	// ios下解决点出去不失焦的问题
	const objBlur = (item, time) => {
		time = time || 300
		let obj = item,
			docTouchend = event => {
				if(event.target !== obj) {
					setTimeout(() => {
						obj.blur()
						document.removeEventListener('touchend', docTouchend, false)
					}, time)
				}
			}
		if(obj) {
			obj.addEventListener('focus', () => {
				document.addEventListener('touchend', docTouchend, false)
			}, false)
		}
	}
	if(sysPlatform === 'IOS') {
		let ipts = document.querySelectorAll('input')
		_.forEach(ipts, item => {
			// eslint-disable-next-line
			let input = new objBlur(item)
			input = null
		})
	}
}
export default {
	dateFormat:function(row, column) {
    var date = row[column.property];
    return date ? dateFormatter(new Date(date).getTime(), 'yyyy-MM-dd HH:mm:ss'):'/';
  },
 /* getId:function(scheduledList,arrlist){
	console.log(scheduledList)
	console.log(arrlist)
	let arrName = ''
	for(var j = 0;j<scheduledList.length;j++){
		for(var i=0;i<arrlist.length;i++){
		if(scheduledList[j].id == arrlist[i].id){
			arrName = arrlist[i].name
			console.log(arrName)
		}
	}
	}
	return arrName
},*/
    validator,
    dateFormatter,
    storageCan,
    sessionCan,
    cookieCan,
    pureCookie,
    reAlignArray,
    convertSecondToTime,
    amountFormat,
    goodTime,
    getQueryString,
    getToolType,
    buryPoint,
    toShare,
    setCookie,
    getCookie,
    delCookie,
    weChat,
    getIpObj,
    hideMobile,
    hideIdentification,
    getStatusVal,
    getproductStatusVal,
    getReturnStatusVal,
    formatMoney,
    moneyFormat,
    resetFontSize,
    resetWindow
}
