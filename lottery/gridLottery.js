/**
* Created by hity on 03/08/17
* gridLottery.js
* 相关参数：
*     ［选填］pClass: 指定父容器 默认为body
*     ［选填］customClass: 自定义九宫格类名
*
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
*         coverUrl: active状态，cover图,
*         prizeList: [{imgUrl: 九宫格奖品图片列表}]
*     }
*
* 当isCustomUi为true时，以下必填：
*     lotteryDom: 抽奖的html; 当用户自定义ui时，请确保每个item包含data-prize-id="n"属性，逻辑处理需要用到
*     lotteryStyle: 样式
*
* 逻辑部分:
*     ［选填］startBtnClass: 按钮类名 默认 start-btn
*     ［选填］lotteryPromise: 是否可以开始抽奖
*     ［选填］lotteryCircle: 旋转几圈 默认4圈＋
*     ［必填］prizeId: 中奖位置
*     ［必填］chanceCount: 剩余抽奖次数
*
* 相关方法：
*     ［选填］beforeLottery: 抽奖前的处理
*     ［选填］afterLottery: 结束抽奖的回调函数
*/

var GridLottery = function(opts) {
    this.opts = $.extend({
        isCustomUi: false,
        newDesignWidth: 750,
        startBtnClass: 'start-btn',
        lotteryCircle: 4,
        lotteryPromise: $.Deferred().resolve(),
        lotteryImgs: {
            "boxBg": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162132571-551738812.png",
            "btn": {
                "disabledUrl": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162215763-690433804.png",
                "startUrl": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162254691-748888223.png"
            },
            "coverUrl": "https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162323211-1482372425.png",
            "prizeList": [{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162348333-354468437.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162533197-606298021.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162600708-1631640330.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162659399-358256104.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162717607-2127527742.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162634926-493357116.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162738914-1395826048.png"
            },{
                "imgUrl":"https://images2018.cnblogs.com/blog/1094893/201803/1094893-20180330162759043-1420707745.png"
            }]
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

GridLottery.prototype = {
    constructor: GridLottery,
    resultPromise: $.Deferred(),
    animateMovement: null,
    during: 100,
    currPoint: undefined,
    steps: undefined,
    $pElem: null,
    prizeCount: undefined,

    // 创建gridLottery
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
        return (oldPx * 320 / this.opts.newDesignWidth / 20) * (this.opts.newLotteryWidth / 750) + 'rem';
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

        var styleArray = [
            '.lottery-area, .lottery-area * {margin: 0; padding: 0; list-style: none; }',
            '.lottery-area { position: relative;  width: 100%; height: ' + self._px2rem(self.opts.newAreaHeight) + '; background-repeat: no-repeat; background-position: center top; background-size: 100% auto; }',
            '.lottery-box { position: relative; top:' + self._px2rem(self.opts.top) + '; margin:auto; width: ' + self._px2remAndO2N(750) + '; height: ' + self._px2remAndO2N(750) + '; overflow: hidden; }',
            '.lottery-box ul { position: relative; display: block; margin-top: ' + self._px2remAndO2N(12) + '; margin-left: ' + self._px2remAndO2N(12) + ';}',
            '.lottery-box li {display: block; position: absolute; width: ' + self._px2remAndO2N(206) + '; height: ' + self._px2remAndO2N(206) + '; margin: ' + self._px2remAndO2N(18) + '; background-repeat: no-repeat; background-position: center; background-size: 100% auto; }',
            '.lottery-box .active:after { content: " "; position: absolute; top: ' + self._px2remAndO2N(-9) + '; left: ' + self._px2remAndO2N(-9) + '; width: ' + self._px2remAndO2N(223) + '; height: ' + self._px2remAndO2N(223) + '; background-size: 100% auto; background-repeat:no-repeat; background-position:center center; }',
            '.lottery-area .remain-count { position: absolute; bottom:' + self._px2remAndO2N(20) + '; text-align:center; width: 100%;}'
        ];

        // lottery-box itempos style
        (function() {
            var itemSpace = 206 + 36;

            for (var r = 0; r < 3; r++) {
                for (var c = 0; c < 3; c++) {
                    var pos = r * 3 + (c + 1);
                    var left = self._px2remAndO2N(itemSpace * c);
                    var top = self._px2remAndO2N(itemSpace * r);

                    styleArray.push('.lottery-box .pos-' + pos + '{ left:' + left + '; top: ' + top + ';}');
                }
            }
        })();

        self.opts.lotteryStyle = styleArray.join(' ');
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
            '.lottery-box .start-btn { background-image:url(' + startBtn + ');}',
            '.lottery-box .disabled-btn { background-image:url(' + disabledBtn + ');}',
            '.lottery-box .active:after { background-image:url(' + info.coverUrl + ');}'
        ];

        $.each(info.prizeList, function(i, e) {
            styleArray.push('.lottery-box [data-prize-id=\'' + (i + 1) + '\'] { background-image:url(' + e.imgUrl + ');}');
        });

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

    // 默认dom，当isCustomUi为false时，生效; 当用户自定义ui时，请保留data-prize-id="n"字段，逻辑处理需要用到
    _composeDefaultDom: function() {
        var self = this;
        self.opts.lotteryDom = [
            '<div class="lottery-box">',
            '    <ul>',
            '        <li class="pos-5 start-btn"></li>',
            '        <li class="pos-1" data-prize-id="1"></li>',
            '        <li class="pos-2" data-prize-id="2"></li>',
            '        <li class="pos-3" data-prize-id="3"></li>',
            '        <li class="pos-6" data-prize-id="4"></li>',
            '        <li class="pos-9" data-prize-id="5"></li>',
            '        <li class="pos-8" data-prize-id="6"></li>',
            '        <li class="pos-7" data-prize-id="7"></li>',
            '        <li class="pos-4" data-prize-id="8"></li>',
            '    </ul>',
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
        self.$pElem = $('[data-prize-id]').parent();
        self.prizeCount = self.$pElem.find('[data-prize-id]').length;

        // 定位起始active元素
        if (self.currPoint == undefined) {
            self._findStartElem();
        }

        // 转的圈数＋上一个位置的剩余数 ＋ 目标位置
        self.steps = self.opts.lotteryCircle * self.prizeCount + (self.prizeCount - self.currPoint + self.opts.prizeId);
        self._lotteryAnimation();
        self.resultPromise.promise();

    },

    // 动画
    _lotteryAnimation: function() {
        var self = this;
        if (self.animateMovement) {
            clearTimeout(self.animateMovement);
        }

        // 动画结束
        if (self.steps == -1) {
            self.resultPromise.resolve();
            return ;
        }

        var prePoint = (self.currPoint - 1 + self.prizeCount) % self.prizeCount;

        var $currElem = self._targetElem(self.currPoint);
        var $preElem = self._targetElem(prePoint);

        $preElem.removeClass('active');
        $currElem.addClass('active');

        self.currPoint = (++self.currPoint) % self.prizeCount;
        self.steps--;

        self.animateMovement = setTimeout(function() {
            self._lotteryAnimation();
        }, self.during);
    },

    // 根据id查找奖品elem
    _targetElem: function(id) {
        var self = this;
        return self.$pElem.find('[data-prize-id="' + id + '"]');
    },

    // 查找转盘的起始元素
    _findStartElem: function() {
        var self = this;
        var $activeElem = self.$pElem.find('.active');
        var len = $activeElem.length;

        self.currPoint = 1;

        // 查找active 状态的元素
        if (len) {

            (function() {

                for (var i = 1; i <= self.prizeCount; i++) {

                    if (self._targetElem(i).hasClass('active')) {
                        self.currPoint = i;
                    }

                }

            })();

        }
    }

};

window.GridLottery = GridLottery;

