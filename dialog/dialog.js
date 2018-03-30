/**
 * popup.js
 * Created by hity on 03/08/17
 * 相关参数：closeClass：关闭按钮类名（仅限dialog容器内的元素）
 *          popupOnInit：是否new的时候弹出；默认为true，弹出
 *          removeOnClose：是否关闭的时候销毁；默认为true，销毁
 *          popupHtml：dialog容器内的内容
 *          open：生命周期钩子，打开前的回调
 *          opened：生命周期钩子，打开后的回调
 *          close：生命周期钩子，关闭前的回调
 *          closed：生命周期钩子，关闭后的回调
 *          popup：弹出方法
 *          closeModal：关闭方法
 *          destory：销毁方法
 *          styleString: 样式
 *          $containerWp: 安装dialog的容器，默认为body
 *          containClass: popup-container的自定义类名
 *          animationTime: 显现和消失的时间
 *
 *更新日志：增加this.$content，容器默认增加一层，从而优化弹窗样式
 */

var Popup = function(options) {
    if (options.popupHtml == undefined || $.trim(options.popupHtml).length == 0) {
        return;
    }

    this.opts = $.extend({
        closeClass: 'close-popup',
        popupOnInit: true,
        removeOnClose: true,
        $containerWp: $('body'),
        styleString: '.popup-container{position:fixed; top:0; left:0; width:100%; height:100%; background:gray;}',
        open: function() {},
        opened: function() {},
        close: function() {},
        closed: function() {}
    }, options);
    this._init();
};

Popup.prototype = {
    constructor: Popup,
    _init: function() {
        var self = this;

        self._styleReady();
        self._render();
        self._event();
        if (self.opts.popupOnInit) {
            self.popup();
        }

    },
    _styleReady: function() {
        var self = this;

        var $style = $('<style></style>');
        $style.html(self.opts.styleString);
        $('head').append($style);
    },
    _render: function() {
        var self = this;

        var containerClass = self.opts.containClass ? (' ' + self.opts.containClass + ' ') : '';
        self.$container = $('<div class="popup-container' + containerClass + '"></div>');
        self.$content = $('<div class="popup-content"></div>');
        self.$content.html(self.opts.popupHtml);
        self.$container.append(self.$content).hide();
        self.opts.$containerWp.append(self.$container);

    },
    _event: function() {
        var self = this;

        $(self.$container).on('click', '.' + self.opts.closeClass, function() {
            self.closeModal(self.$container);
        });
    },
    _createBtns: function() {
        var self = this;
        var btnArray = self.opts.btns;

        if (btnArray.length <= 0) {
            return;
        }

        var $btnGroup = $('<div class="btnGroup"></div>');
        for (var i = 0; i < btnArray.length; i++) {
            var $btn = $('<span class="popup-btn">' + btnArray[i].name + '</span>');
            $btn.on('click', btnArray[i].callback);
            $btnGroup.append($btn);
        }

        self.$content.append($btnGroup);

    },
    popup: function() {
        var self = this;

        self.opts.open();
        self.$container.show(self.opts.animationTime, self.opts.opened);


    },
    closeModal: function() {
        var self = this;

        self.opts.close();
        self.$container.hide(self.opts.animationTime, function() {
            self.opts.closed();
            if (self.opts.removeOnClose) {
                self.destroy();
            }
        });

    },
    destroy: function() {
        var self = this;
        $(self.$container).off('click').remove();
        self = null;
    }
};

var Dialog = function(options) {
    options = $.extend({
        moreBtns: false
    }, options);
    Popup.call(this, options);
    if (this.opts.moreBtns) {
        this._createBtns();
    }

};

function object(o) {
    function F() {}

    F.prototype = o;
    return new F();
}

function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

inheritPrototype(Dialog, Popup);

Dialog.prototype._createBtns = function() {
    var self = this;
    var btnArray = self.opts.btns;

    if (btnArray.length <= 0) {
        return;
    }

    var $btnGroup = $('<div class="btnGroup"></div>');
    for (var i = 0; i < btnArray.length; i++) {
        var $btn = $('<span class="popup-btn">' + btnArray[i].name + '</span>');
        $btn.on('click', btnArray[i].callback);
        $btnGroup.append($btn);
    }

    self.$content.append($btnGroup);

};

window.Dialog = Dialog;


