/** 
 * Email Auto-complete Library written in pure Vanilla JS
 *
 * Author: Sugato Sengupta <thcdesigning@gmail.com>
 *
 * Special Thanks to Low Yong Zhen <yz@stargate.io> for the jQuery version of this library.
 
	License Type: MIT License

	Copyright (c) 2016 Sugato Sengupta

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

 **/
;
var EmailAutoComplete = function (elem, options) {
    var defaults = {
        suggClass: "eac-sugg",
		suggOpacity: "0.7",
        domains: ["yahoo.com", "hotmail.com", "gmail.com", "me.com", "aol.com", "mac.com", "live.com", "comcast.net", "googlemail.com", "msn.com", "hotmail.co.uk", "yahoo.co.uk", "facebook.com", "verizon.net", "sbcglobal.net", "att.net", "gmx.com", "outlook.com", "icloud.com"]
    };
    /* extend */
    var extend = function () {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;
        }
        var merge = function (obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
        for (; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    };
    /* end extend*/
    options = extend({}, defaults, options);
    /* get computedstyle hack*/
    var classSelectorRE = /^\.([\w-]+)$/,
            idSelectorRE = /^#([\w-]+)$/,
            tagSelectorRE = /^[\w-]+$/;
    $$ = function (element, selector) {
        var found;
        return (element === document && idSelectorRE.test(selector)) ?
                ((found = element.getElementById(RegExp.$1)) ? [found] : []) :
                Array.prototype.slice.call(
                        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
                        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
                        element.querySelectorAll(selector)
                        );
    }
    function hasClass(target, className) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
    }
    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function wrap(toWrap, wrapper) {
        wrapper = wrapper || document.createElement('div');
        if (toWrap.nextSibling) {
            toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
        } else {
            toWrap.parentNode.appendChild(wrapper);
        }
        return wrapper.appendChild(toWrap);
    }
    /* if indexOf does not work*/
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
    }
    /* end indexOf hack*/
    function addEvent(elem, event, fn) {
        // avoid memory overhead of new anonymous functions for every event handler that's installed
        // by using local functions
        function listenHandler(e) {
            var ret = fn.apply(this, arguments);
            if (ret === false) {
                e.stopPropagation();
                e.preventDefault();
            }
            return(ret);
        }
        function attachHandler() {
            // set the this pointer same as addEventListener when fn is called
            // and make sure the event is passed to the fn also so that works the same too
            var ret = fn.call(elem, window.event);
            if (ret === false) {
                window.event.returnValue = false;
                window.event.cancelBubble = true;
            }
            return(ret);
        }
        if (elem.addEventListener) {
            elem.addEventListener(event, listenHandler, false);
            return {elem: elem, handler: listenHandler, event: event};
        } else {
            elem.attachEvent("on" + event, attachHandler);
            return {elem: elem, handler: attachHandler, event: event};
        }
    }
    function removeEvent(token) {
        if (token.elem.removeEventListener) {
            token.elem.removeEventListener(token.event, token.handler);
        } else {
            token.elem.detachEvent("on" + token.event, token.handler);
        }
    }
    /* end addEvent*/
    if (!window.getComputedStyle)
        window.getComputedStyle = function (el) {
            var __style = el.currentStyle,
                    _style = {};
            for (var i in __style) {
                _style[i] = __style[i];
            }
            // IE8 returns border widths as adjectives
            if (style.indexOf("border") === 0)
                switch (_style[style]) {
                    case "thin":
                        _style[style] = 2;
                        break;
                    case "medium":
                        _style[style] = 4;
                        break;
                    case "thick":
                        _style[style] = 6;
                        break;
                    default:
                        _style[style] = 0;
                }
            var leftCopy = el.style.left;
            var runtimeLeftCopy = el.runtimeStyle.left;
            _styleParams = {
                left: 1,
                right: 1,
                top: 1,
                bottom: 1,
                width: 1,
                height: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                paddingLeft: 1,
                paddingRight: 1,
                paddingTop: 1,
                paddingBottom: 1,
                marginLeft: 1,
                marginRight: 1,
                marginTop: 1,
                marginBottom: 1
            }
            for (var key in _styleParams) {
                el.runtimeStyle.left = el.currentStyle.left;
                el.style.left = _style[key];
                _style[key] = el.style.pixelLeft;
                el.style.left = leftCopy;
                el.runtimeStyle.left = runtimeLeftCopy;
            }
            // opacity for IE8
            if (_style.filter.match('alpha')) {
                _style.opacity = _style.filter.substr(14);
                _style.opacity = parseInt(_style.opacity.substring(0, _style.opacity.length - 1)) / 100;
            } else {
                _style.opacity = 1;
            }
        }
    /* end get computedstyle hack*/
    /** classlist hack*/
    if ("document" in self && !("classList" in document.createElement("_"))) {
        (function (j) {
            "use strict";
            if (!("Element" in j)) {
                return
            }
            var a = "classList", f = "prototype", m = j.Element[f], b = Object, k = String[f].trim || function () {
                return this.replace(/^\s+|\s+$/g, "")
            }, c = Array[f].indexOf || function (q) {
                var p = 0, o = this.length;
                for (; p < o; p++) {
                    if (p in this && this[p] === q) {
                        return p
                    }
                }
                return -1
            }, n = function (o, p) {
                this.name = o;
                this.code = DOMException[o];
                this.message = p
            }, g = function (p, o) {
                if (o === "") {
                    throw new n("SYNTAX_ERR", "An invalid or illegal string was specified")
                }
                if (/\s/.test(o)) {
                    throw new n("INVALID_CHARACTER_ERR", "String contains an invalid character")
                }
                return c.call(p, o)
            }, d = function (s) {
                var r = k.call(s.getAttribute("class") || ""), q = r ? r.split(/\s+/) : [], p = 0, o = q.length;
                for (; p < o; p++) {
                    this.push(q[p])
                }
                this._updateClassName = function () {
                    s.setAttribute("class", this.toString())
                }
            }, e = d[f] = [], i = function () {
                return new d(this)
            };
            n[f] = Error[f];
            e.item = function (o) {
                return this[o] || null
            };
            e.contains = function (o) {
                o += "";
                return g(this, o) !== -1
            };
            e.add = function () {
                var s = arguments, r = 0, p = s.length, q, o = false;
                do {
                    q = s[r] + "";
                    if (g(this, q) === -1) {
                        this.push(q);
                        o = true
                    }
                } while (++r < p);
                if (o) {
                    this._updateClassName()
                }
            };
            e.remove = function () {
                var t = arguments, s = 0, p = t.length, r, o = false;
                do {
                    r = t[s] + "";
                    var q = g(this, r);
                    if (q !== -1) {
                        this.splice(q, 1);
                        o = true
                    }
                } while (++s < p);
                if (o) {
                    this._updateClassName()
                }
            };
            e.toggle = function (p, q) {
                p += "";
                var o = this.contains(p), r = o ? q !== true && "remove" : q !== false && "add";
                if (r) {
                    this[r](p)
                }
                return !o
            };
            e.toString = function () {
                return this.join(" ")
            };
            if (b.defineProperty) {
                var l = {get: i, enumerable: true, configurable: true};
                try {
                    b.defineProperty(m, a, l)
                } catch (h) {
                    if (h.number === -2146823252) {
                        l.enumerable = false;
                        b.defineProperty(m, a, l)
                    }
                }
            } else {
                if (b[f].__defineGetter__) {
                    m.__defineGetter__(a, i)
                }
            }
        }(self))
    }
    ;
    /*end classlist hack*/
    /* init()*/
    function init() {
        var fieldLeftOffset = null;
        var val = null;
        var suggestion = null;
        var $field = elem;
        if ($field === null || $field.length < 1) {
            throw new Error('field cannot be blank.');
            return false;
        }
        if (!hasClass($field.parentNode, 'eac-input-wrap')) {
            var $wrap = document.createElement("div");
            document.body.setAttribute("tabindex", 1);
            $wrap.classList.add('eac-input-wrap');
            $wrap.style.display = getDisplayType($field);
            $wrap.style.position = getComputedStyle($field).position === 'static' ? 'relative' : getComputedStyle($field).position;
            $wrap.style.fontSize = getComputedStyle($field).fontSize;
            $wrap.style.width = getOuterWidth($field) + "px";
			$wrap.style.height = getOuterHeight($field) + "px";
            wrap($field, $wrap);
        } else {
            var $wrap = $field.parentNode;
            $field.parentNode;
            var $c = $$($wrap, '.eac-cval');
            if ($c.length) {
                $c[0].parentNode.removeChild($c[0]);
            }
            var $s = $$($wrap, '.' + options.suggClass);
            if ($s.length) {
                $s[0].parentNode.removeChild($s[0]);
            }
        }
        var $cval = document.createElement("span");
        $cval.classList.add('eac-cval');
        $field.style.position = "absolute";
        $cval.style.visibility = 'hidden';
        $cval.style.position = 'absolute';
        $cval.style.display = 'inline-block';
        $cval.style.fontFamily = getComputedStyle($field).fontFamily;
        $cval.style.fontWeight = getComputedStyle($field).fontWeight;
        $cval.style.letterSpacing = getComputedStyle($field).letterSpacing;
        insertAfter($field, $cval);
		$cval.style.fontSize = getComputedStyle($field).fontSize;
		$cval.style.paddingLeft = getComputedStyle($field).paddingLeft;
        var c = (parseFloat(getOuterHeight($field)) - parseFloat(getComputedStyle($field).height)) / 2;
        if (isNaN(c)) {
            return false;
        }
       
        var $suggOverlay = document.createElement("span");
        $suggOverlay.classList.add(options.suggClass);
        $suggOverlay.style.display = 'block';
        $suggOverlay.style.boxSizing = 'content-box';
        
        $suggOverlay.style.lineHeight = getOuterHeight($field) + "px";
        $suggOverlay.style.height = getOuterHeight($field) + "px";
        $suggOverlay.style.fontFamily = getComputedStyle($field).fontFamily;
        $suggOverlay.style.fontWeight = getComputedStyle($field).fontWeight;
        $suggOverlay.style.letterSpacing = getComputedStyle($field).letterSpacing;
        $suggOverlay.style.position = 'absolute';
        $suggOverlay.style.opacity = options.suggOpacity;
        $suggOverlay.style.top = 0;
        $suggOverlay.style.left = 0;
        $suggOverlay.style.zIndex = 99999;
        insertAfter($field, $suggOverlay);
        addEvent($field, 'keyup', function (e) {
            displaySuggestion(e);
        });
        addEvent($field, 'keydown', function (a) {
			
            if (39 === a.which || 9 === a.which) {
				if($suggOverlay.innerHTML != ""){
					a.preventDefault();
				}
                autocomplete($field);
            }
        });
        addEvent(document, 'click', function (a) {
            if (a.target.className === options.suggClass) {
                $field.value += $suggOverlay.innerHTML;
                $suggOverlay.innerHTML = "";
            }
        });
        addEvent($field, 'blur', function (a) {
            setTimeout(function () {
                $suggOverlay.innerHTML = "";
            }, 150);
        });
        function autocomplete() {
            if ("undefined" == typeof suggestion || suggestion.length < 1) {
                return false;
            } else {
                $field.value = val + suggestion;
            }
            $cval.innerHTML = "";
            $suggOverlay.innerHTML = "";
            return true;
        }
        function getDisplayType(element) {
            var cStyle = element.currentStyle || window.getComputedStyle(element, "");
            return cStyle.display;
        }
        function displaySuggestion(e) {
            val = $field.value;
            suggestion = suggest(val);
            suggestion.length ? e.preventDefault() : $suggOverlay.innerHTML = "";
            $suggOverlay.innerHTML = suggestion;
            $cval.innerHTML = val;
            null === fieldLeftOffset && (fieldLeftOffset = (getOuterWidth($field) - $field.offsetWidth) / 2);
            var b = $cval.offsetWidth;
            getOuterWidth($field) > b && ($suggOverlay.style.left = fieldLeftOffset + b + "px");
        }
        function suggest(a) {
            var b = a.split("@");
            if (!(b.length > 1))
                return "";
            if (a = b.pop(), !a.length)
                return "";
            var c = options.domains.filter(function (b) {
                return 0 === b.indexOf(a)
            }).shift() || "";
            return c.replace(a, "")
        }
        
		function getOuterWidth($elem) {
                var cwidth = parseFloat(getComputedStyle($elem).width);
                var rwidth = parseFloat($elem.getBoundingClientRect().width);
                return cwidth > rwidth ? cwidth : rwidth;
        }

		function getOuterHeight($elem) {
			var cheight = parseFloat(getComputedStyle($elem).height);
			var rheight = parseFloat($elem.getBoundingClientRect().height);
			return cheight > rheight ? cheight : rheight;
		}
    }
    /* end init()*/
    init();
}