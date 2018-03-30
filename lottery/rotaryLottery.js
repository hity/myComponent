/**
* Created by hity on 03/08/17
* rotaryLottery.js
* 相关参数：
*     ［选填］pClass: 指定父容器 默认为body
*     ［选填］customClass: 自定义转盘类名
*     ［必填］chanceCount: 剩余抽奖次数
*     *
* 自定义ui：
*     ［选填］isCustomUi: 是否自定义ui  默认false
*
* 当isCustomUi为false时，以字段生效：
*     newLotteryWidth: 新的lotteryWidth
*     newDesignWidth: 新设计稿宽度
*     top: 转盘距离抽奖模块的高度
*     newAreaHeight: 抽奖模块的高度
*     lotteryImgs:{
*         boxBg: 抽奖模块背景,
*         btn: {
*             disabledUrl: 抽奖进行中按钮图,
*             startUrl: 开始按钮图
*         },
*         panBg: 抽奖转盘背景图
*     }
*
* 当isCustomUi为true时，以下必填：
*     lotteryDom: 抽奖的html;
*     lotteryStyle: 样式
*
* 逻辑部分:
*     ［选填］startBtnClass: 按钮类名 默认 start-btn
*     ［选填］lotteryPromise: 是否可以开始抽奖
*     ［选填］lotteryCircle: 旋转几圈 默认5圈
*     ［必填］prizeId: 中奖位置
*     ［必填］prizeCount: 奖品数
*
* 相关方法：
*     ［选填］beforeLottery: 抽奖前的处理
*     ［选填］afterLottery: 结束抽奖的回调函数
*
*/

var RotaryLottery = function(opts) {
    this.opts = $.extend({
        isCustomUi: false,
        newDesignWidth: 750,
        startBtnClass: 'start-btn',
        lotteryCircle: 5,
        lotteryPromise: $.Deferred().resolve(),
        prizeCount: 10,
        lotteryImgs: {
            "boxBg": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162929300-196126566.jpg",
            "btn": {
                "disabledUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330163028374-1712894936.png",
                "startUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330163103127-81489395.png"
            },
            "panBg": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330163133248-182776378.png"
        },
        beforeLottery: function() {
            console.log('beginLottery');
        },
        afterLottery: function() {
            console.log('afterLottery! beginResult');
        }
    }, opts);

    this._init();
};

RotaryLottery.prototype = {
    constructor: RotaryLottery,
    resultPromise: $.Deferred(),
    animateMovement: null,
    during: 4000,
    currPoint: 0,
    degrees: 0,
    perDegree: 0,

    // 创建rotaryLottery
    _init: function() {
        var self = this;

        // 生成样式
        self._styleReady();

        // 生成dom
        self._domReady();

        // 抽奖事件处理
        self._event();
    },

    // 转盘内size换算
    _px2remAndO2N: function(oldPx) {
        return (oldPx * 320 / this.opts.newDesignWidth / 20) * (this.opts.newLotteryWidth / 714) + 'rem';
    },

    // 非转盘内size换算
    _px2rem: function(px) {
        return (px * 320 / this.opts.newDesignWidth / 20) + 'rem';
    },

    // 生成样式
    _styleReady: function() {
        var self = this;

        var $style = $('<style type="text/css"></style>');

        // 默认样式
        if (!self.isCustomUi) {
            self._composeDefaultStyle();
        }

        $style.html(self.opts.lotteryStyle);
        $('head').append($style);

        // 图片样式
        if (!self.isCustomUi) {
            self._imgStyle();
        }
    },

    // 默认style，当isCustomUi为false时，生效
    _composeDefaultStyle: function() {
        var self = this;
        self.opts.lotteryStyle = [
            '.lottery-area, .lottery-area * {margin: 0; padding: 0; list-style: none; }',
            '.lottery-area { position: relative;  width: 100%; height: ' + self._px2rem(self.opts.newAreaHeight) + '; background-repeat: no-repeat; background-position: center top; background-size: 100% auto; }',
            '.lottery-area .remain-count { position: absolute; bottom:' + self._px2remAndO2N(20) + '; text-align:center; width: 100%;}',
            '.lottery-box { position: relative; top:' + self._px2rem(self.opts.top) + '; margin:auto; width: ' + self._px2remAndO2N(714) + '; height: ' + self._px2remAndO2N(714) + '; overflow: hidden; }',
            '.lottery-box .lottery-bg{ position: absolute; top:0; left:0; width: 100%; height: 100%; background-repeat: no-repeat; background-position: center; background-size: 100% auto; }',
            '.lottery-box .start-btn {z-index:10; position: relative; display: block; width:' + self._px2remAndO2N(224) + '; height:' + self._px2remAndO2N(269) + ';top:' + self._px2remAndO2N(200) + '; background-repeat: no-repeat; background-position: center; background-size: 100% auto; margin: auto;}'
        ].join(' ');
    },

    // 默认图片style，当isCustomUi为false时，生效
    _imgStyle: function() {
        var self = this;
        var $style = $('<style type="text/css"></style>');


        var info = self.opts.lotteryImgs ? self.opts.lotteryImgs : '';
        if (!info) {
            return;
        }

        var startBtn = info.btn ? (info.btn.startUrl ? info.btn.startUrl : '') : '';
        var disabledBtn = info.btn ? (info.btn.disabledUrl ? info.btn.disabledUrl : '') : '';

        var styleArray = [
            '.lottery-area{background-image:url(' + info.boxBg + ');}',
            '.lottery-box .lottery-bg{ background-image:url(' + info.panBg + ');}',
            '.lottery-box .start-btn { background-image:url(' + startBtn + ');}',
            '.lottery-box .disabled-btn { background-image:url(' + disabledBtn + ');}'
        ];

        $style.html(styleArray.join(' '));
        $('head').append($style);
    },

    // 生成dom
    _domReady: function() {
        var self = this;
        var $containerWp = null;
        var lotteryClass = self.opts.customClas;
        lotteryClass = lotteryClass ? lotteryClass : '';
        self.$container = $('<section class="lottery-area ' + lotteryClass + '"><section>');

        if (!self.isCustomUi) {
            self._composeDefaultDom();
        }

        self.$container.html(self.opts.lotteryDom).hide();
        if (self.opts.pClass) {
            $containerWp = $('.' + self.opts.pClass);
        } else {
            $containerWp = $('body');
        }

        $containerWp.append(self.$container);
        self.$container.show();

    },

    // 默认dom，当isCustomUi为false时，生效
    _composeDefaultDom: function() {
        var self = this;
        self.opts.lotteryDom = [
            '<div class="lottery-box">',
            '    <span class="start-btn"></span>',
            '    <div class="lottery-bg"></div>',
            '</div>',
            '<p class="remain-count">剩余次数：' + self.opts.chanceCount + '</p>'
        ].join('');
    },

    // 事件处理
    _event: function() {
        var self = this;

        // 绑定点击事件（抽奖）
        $(self.$container).on('click', '.' + self.opts.startBtnClass, function() {
            var $btn = $(this);

            self.resultPromise = $.Deferred();
            self.opts.lotteryPromise = $.Deferred();

            // 抽奖前的处理逻辑
            self.opts.beforeLottery();

            // 抽奖处理
            $.when(self.opts.lotteryPromise)
                .done(function() {
                    self._doLottery();
                });

            // 结果处理
            $.when(self.resultPromise)
                .done(function() {
                    self.opts.afterLottery();
                });

        });
    },

    // 抽奖
    _doLottery: function() {
        var self = this;

        self.perDegree = 360 / self.opts.prizeCount;
        self.degrees = parseInt(self.opts.lotteryCircle * 360 + (self.opts.prizeId - 1) * self.perDegree);
        self.currPoint = self.opts.prizeId;
        self._lotteryAnimation();
    },

    // 动画
    _lotteryAnimation: function() {
        var self = this;

        if (self.animateMovement) {
            clearTimeout(self.animateMovement);
        }

        $('.lottery-box .lottery-bg').css({
            'transform': 'rotate(-' + self.degrees + 'deg)',
            'transition': 'transform ' + self.during + 'ms'
        });
        self.animateMovement = setTimeout(function() {
            $('.lottery-box .lottery-bg').css({
                'transition': 'transform 0ms'
            }).css({
                'transform': 'rotate(-' + (self.degrees % 360) + 'deg)'
            });
            self.resultPromise.resolve();
            return ;
        }, self.during);
        self.resultPromise.promise();

    }

};

window.RotaryLottery = RotaryLottery;

