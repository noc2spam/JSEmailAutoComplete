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
var EmailAutoComplete = function(elem, options) {

    var defaults = {
        suggClass: "eac-sugg",
        domains: ["yahoo.com", "hotmail.com", "gmail.com", "me.com", "aol.com", "mac.com", "live.com", "comcast.net", "googlemail.com", "msn.com", "hotmail.co.uk", "yahoo.co.uk", "facebook.com", "verizon.net", "sbcglobal.net", "att.net", "gmx.com", "outlook.com", "icloud.com"]
    }
    var $suggOverlay, $wrap, $cval, $field, $originalField, suggestion, fieldLeftOffset;
    var classSelectorRE = /^\.([\w-]+)$/;
    var idSelectorRE = /^#([\w-]+)$/;
    var tagSelectorRE = /^[\w-]+$/;
    var extend = function() {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;
        }
        var merge = function(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        }
        for (; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    }
    options = extend({}, defaults, options);
    var $$ = function(element, selector) {
        var found;
        return (element === document && idSelectorRE.test(selector)) ?
            ((found = element.getElementById(RegExp.$1)) ? [found] : []) :
            Array.prototype.slice.call(
                classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
                tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
                element.querySelectorAll(selector)
            );
    }

    function outerWidth(el) {
        var width = el.offsetWidth;
        var style = getComputedStyle(el);
        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        return width;
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

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
    }

    function addEvent(elem, event, fn) {
        function listenHandler(e) {
            var ret = fn.apply(this, arguments);
            if (ret === false) {
                e.stopPropagation();
                e.preventDefault();
            }
            return (ret);
        }

        function attachHandler() {
            var ret = fn.call(elem, window.event);
            if (ret === false) {
                window.event.returnValue = false;
                window.event.cancelBubble = true;
            }
            return (ret);
        }
        if (elem.addEventListener) {
            elem.addEventListener(event, listenHandler, false);
            return {
                elem: elem,
                handler: listenHandler,
                event: event
            };
        } else {
            elem.attachEvent("on" + event, attachHandler);
            return {
                elem: elem,
                handler: attachHandler,
                event: event
            };
        }
    }

    function removeEvent(token) {
        if (token.elem.removeEventListener) {
            token.elem.removeEventListener(token.event, token.handler);
        } else {
            token.elem.detachEvent("on" + token.event, token.handler);
        }
    }

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
        null === fieldLeftOffset && (fieldLeftOffset = (outerWidth($field) - $field.offsetWidth) / 2);
        var b = $cval.offsetWidth;
        outerWidth($field) > b && ($suggOverlay.style.left = fieldLeftOffset + b + "px");
    }

    function suggest(a) {
        var b = a.split("@");
        if (!(b.length > 1))
            return "";
        if (a = b.pop(), !a.length)
            return "";
        var c = options.domains.filter(function(b) {
            return 0 === b.indexOf(a)
        }).shift() || "";
        return c.replace(a, "")
    }

    function outerHght(elem) {
        var curStyle = elem.currentStyle || window.getComputedStyle(elem);
        OH = elem.offsetHeight;
        if (!isNaN(parseInt(curStyle.marginTop))) {
            OH += parseInt(curStyle.marginTop);
        }
        if (!isNaN(parseInt(curStyle.marginBottom))) {
            OH += parseInt(curStyle.marginBottom)
        }
        return OH;
    }




    function getHTML(node) {
        if (!node || !node.tagName) return '';
        if (node.outerHTML) return node.outerHTML;
        var wrapper = document.createElement('div');
        wrapper.appendChild(node.cloneNode(true));
        return wrapper.innerHTML;
    }


    function init() {

        fieldLeftOffset = null;
        var val = null;
        suggestion = null;
        $field = elem;
        if ($field.length < 1) {
            console.log('field cannot be blank.');
            return false;
        }
        if (!hasClass($field.parentNode, 'eac-input-wrap')) {
            $wrap = document.createElement("div");
            document.body.setAttribute("tabindex", 1);
            $wrap.classList.add('eac-input-wrap');
            $wrap.style.display = getDisplayType($field);
            $wrap.style.position = getComputedStyle($field).position === 'static' ? 'relative' : getComputedStyle($field).position;
            $wrap.style.fontSize = getComputedStyle($field).fontSize;
            $wrap.style.width = getComputedStyle($field).width;
            $wrap.style.height = getComputedStyle($field).height;
            wrap($field, $wrap);
        } else {
            $wrap = $field.parentNode;
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
        $cval = document.createElement("span");
        $cval.classList.add('eac-cval');
        $field.style.position = "absolute";
        $field.style.left = "0px";
        $cval.style.visibility = 'hidden';
        $cval.style.position = 'absolute';
        $cval.style.display = 'inline-block';
        $cval.style.fontFamily = getComputedStyle($field).fontFamily;
        $cval.style.fontWeight = getComputedStyle($field).fontWeight;
        $cval.style.letterSpacing = getComputedStyle($field).letterSpacing;
        insertAfter($field, $cval);
        $cval.style.fontSize = getComputedStyle($field).fontSize;
        $cval.style.paddingLeft = getComputedStyle($field).paddingLeft;
		$cval.style.lineHeight = getComputedStyle($field).lineHeight;
        var c = (parseFloat(outerHght($field)) - parseFloat(getComputedStyle($field).height)) / 2;
        if (isNaN(c)) {
            return false;
        }
        $suggOverlay = document.createElement("span");
        var slh = parseFloat(getComputedStyle($wrap).height);
        $suggOverlay.classList.add(options.suggClass);
        $suggOverlay.style.display = 'block';
        $suggOverlay.style.boxSizing = 'content-box';
        $suggOverlay.style.lineHeight = slh + "px";
        $suggOverlay.style.fontFamily = getComputedStyle($field).fontFamily;
        $suggOverlay.style.fontWeight = getComputedStyle($field).fontWeight;
        $suggOverlay.style.letterSpacing = getComputedStyle($field).letterSpacing;
        $suggOverlay.style.position = 'absolute';
        $suggOverlay.style.opacity = '0.4';
        $suggOverlay.style.top = 0;
        $suggOverlay.style.left = 0;
        $suggOverlay.style.zIndex = 99999;
        insertAfter($field, $suggOverlay);

        addEvent($field, 'keyup', function(e) {
            displaySuggestion(e);
        });
        addEvent($field, 'keydown', function(a) {
            if (39 === a.which || 9 === a.which) {
                a.preventDefault();
                autocomplete($field);
            }
        });
        addEvent(document, 'click', function(a) {
            if (a.target.className === options.suggClass) {
                $field.value += $suggOverlay.innerHTML;
                $suggOverlay.innerHTML = "";
            }
        });
        addEvent($field, 'blur', function(a) {
            setTimeout(function() {
                $suggOverlay.innerHTML = "";
            }, 150);
        });
    }
    init();
}