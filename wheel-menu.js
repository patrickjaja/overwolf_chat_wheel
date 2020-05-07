export default class WheelMenu {
    constructor(el, params) {
        let // Default params
            defaults = {
                size: 100,
                classes: '',
                borderWidth: 20, // Need for correct cursor positioning inside the ring
                inActiveRadius: 20,
                pointerOffset: 10,
                pointerFixed: true,
                pointerSize: 50,
                rotateRing: true, // If ring must be rotated according to active item or not
                transitionDuration: 400,

                // On change callback. Called when mouseup event is triggered,
                // and if active item exists. It receives item array element as parameter.
                onChange: '',

                // Item element can be either string or object.
                // Object must contain 'content' field, it will be used as item's html.
                items: [
                    'Hello',
                    'Set your',
                    'Menu items',
                    'Here'
                ]
            };
        this.opts = this.extend({}, defaults, params);

        this.doc = document;
        this.el = this.doc.querySelector(el);
        this.$body = this.doc.querySelector('body');
        this.$html = this.doc.querySelector('html');
        this.DOMGenerated = false;
        this.idCounter = 1;
        this.idPrefix = 'wheel-menu-';
        this.transformProp = '';
        this.$el = {};
        this.$ring = {};
        this.$cursor = {};
        this.$pointer = {};
        this.visible = false;

        this.getTransform();
        if (!this.DOMGenerated) {
            this.createDOM();
        }

        this.init();
    }

    getTransform () {
        var styles = getComputedStyle(document.documentElement),
            names = ['transform', 'msTransform', 'mozTransform', 'webkitTransform'];

        names.forEach((name) => {
            if (this.transformProp) return;
            if (name in styles) this.transformProp = name;
        })
    }

    init () {
        this.cache = [];
        this.cacheInited = false;
        this.currentActive = '';
        this.removeClassTimeout = '';

        this.createItemsDOM();
        this._saveCursorDimensions();
        // this.el.addEventListener('touchstart', this.onMouseDown.bind(this));
        // this.$html.addEventListener('touchend', this.onMouseUp.bind(this));
        // this.$html.addEventListener('touchmove', this.onMouseMove.bind(this));

        this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.$html.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.$html.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    /**
     * Show menu
     */
    show () {
        this.visible = true;

        if (this.removeClassTimeout) {
            clearTimeout(this.removeClassTimeout);
        }

        if (this.opts.classes) {
            this.$el.classList.add(this.opts.classes);
            this._saveCursorDimensions();
        }

        this.disable(); // Disable previous active item if exist

        this.$itemsConteiner.style.left = this.currentX - this.opts.size/2 + 'px';
        this.$itemsConteiner.style.top = this.currentY - this.opts.size/2 + 'px';

        this.setMenuItemsPosition();
        this.$el.classList.add('active');
        this.$ring.classList.add('active');
        this.$cursor.classList.add('active');
        this.$itemsConteiner.classList.add('active');
        this.$html.classList.add('-wheel-menu-visible-');


        this.setCursorPosition();
        this.setRingRotation(this.getVector(this.cache[0].x, this.cache[0].y, true));

        this.setPiePosition();
    }

    /**
     * Hide menu
     */
    hide () {
        var _this = this;

        this.visible = false;

        this.$el.classList.remove('active');
        this.$ring.classList.remove('active');
        this.$cursor.classList.remove('active');
        this.$pointer.classList.remove('active');
        this.$itemsConteiner.classList.remove('active');
        this.$html.classList.remove('-wheel-menu-visible-','-wheel-menu-moving-');

        if (this.opts.classes) {
            this.removeClassTimeout = setTimeout(() => {
                this.$el.classList.remove(_this.opts.classes);
            }, this.opts.transitionDuration)
        }

        this.$ring.style.transform = '';

        this.$ring.style.top = 0 + 'px';
        this.$ring.style.left = 0 + 'px';

        // Reset item cache
        this.cache = [];
        this.cacheInited = false;
    }

    /**
     * Activates received item.
     * @param {Object} item - Cached menu item from this.cache
     */
    activate (item) {
        if (this.currentActive && this.currentActive == item) return;

        if (this.currentActive) {
            this.disable(this.currentActive);
        }

        var vector = this.getVector(item.x, item.y, true);

        this.setPointerPosition(vector);
        item.item.classList.add('active');

        this.$pointer.classList.add('active');
        this.$el.classList.add('-item-activated-');
        this.setPointerPosition(vector);
        this.setRingRotation(vector);
        this.currentActive = item;

        // Refresh items position, because of style changes may happen
        this.setMenuItemsPosition();
    }


    /**
     * Disables received item.
     *  @param {Object} [item] - Cached menu item from this.cache
     */
    disable (item) {
        item = item ? item : this.currentActive;

        if (!item) return;

        this.$pointer.classList.remove('active');

        item.item.classList.remove('active');
        this.$el.classList.remove('-item-activated-');
        this.setMenuItemsPosition();
        this.currentActive = ''
    }

    /**
     * Sets circle position
     */
    setPiePosition () {
        var x = this.centerX - this.opts.size / 2,
            y = this.centerY - this.opts.size / 2;

        this.$ring.style.top = y + 'px';
        this.$ring.style.left = x + 'px';
    }

    /**
     * Loops through each menu item and sets its position.
     * Refreshes items cache array.
     */
    setMenuItemsPosition (pos) {
        var step = Math.PI*2 / this.opts.items.length,
            angle = Math.PI/2,
            opts = this.opts,
            range,
            _this = this,
            position;



        Array.prototype.forEach.call(this.$items, function ($item, i) {
            position = _this.getItemPosition($item, angle);

            if (!pos) {
                $item.style.left = position.x + 'px';
                $item.style.top = position.y + 'px';
            } else {
                $item.style.left = position.fromX + 'px';
                $item.style.top = position.fromY + 'px';
            }

            if (!_this.cacheInited) {
                _this.cache.push({
                    item: $item,
                    correctedX: position.x,
                    correctedY: position.y,
                    x: position.originalX,
                    y: position.originalY,
                    fromX: position.fromX,
                    fromY: position.fromY,
                    range: position.range
                });
            }

            angle -= step;
        });

        this.cacheInited = true;
    }

    getX (angle, size) {
        return Math.cos(angle) * (size || this.opts.size + this.opts.pointerSize)/2 + this.opts.size/2
    }

    getY (angle, size) {
        return -Math.sin(angle) * (size || this.opts.size + this.opts.pointerSize)/2 + this.opts.size/2
    }

    /**
     * Computes correct 'x' and 'y' item position
     * @param {Object} item - DOM item object
     * @param {Number} angle - Angle at which item should be positioned
     * @returns {{x: *, y: *}}
     */
    getItemPosition (item, angle) {
        var width = item.offsetWidth,
            height = item.offsetHeight,
            opts = this.opts,
            degrees = angle * 180/Math.PI,
            range = this.getAngleRange(angle),
            x, y,
            fromX, fromY,
            originalX, originalY;

        x = originalX = this.getX(angle);
        y = originalY = this.getY(angle);
        fromX = this.getX(angle, this.opts.size / 4);
        fromY = this.getY(angle, this.opts.size / 4);

        // Correct x position
        switch (true) {
            case degrees == 90 || degrees == -90:
                x = x - width/2;
                fromX = fromX - width /2;
                break;
            case  degrees <= -90 && degrees >= -270:
                x = x - width;
                fromX = fromX - width;
                break;
            default:
                break;
        }

        // Correct y position
        switch (true) {
            case degrees == 90:
                y = y - height;
                fromY = fromY - height;
                break;
            case degrees == -90:
                break;
            case degrees == 0 || degrees == -180:
                y = y - height/2;
                fromY = fromY - height/2;
                break;
            default:
                y = y - height/2;
                fromY = fromY - height/2;
                break;
        }

        return {
            x: x,
            y: y,
            originalX: originalX,
            originalY: originalY,
            fromX: fromX,
            fromY: fromY,
            range: range
        }
    }

    /**
     * Defines to what angle range item is belong to. Need for activating proper item
     * @param {Number} angle - Angle in radians to compute range from.
     * @returns {Array} - Range array [from, to] in degrees. 'from' can be larger then 'to'
     */
    getAngleRange (angle) {
        var range = [],
            opts = this.opts,
            halfStep = (Math.PI*2 / this.opts.items.length) / 2,
            from = angle - halfStep,
            to = angle + halfStep,
            fromX, fromY,
            toX, toY;

        fromX = this.getX(from);
        fromY = this.getY(from);

        toX = this.getX(to);
        toY = this.getY(to);

        range[0] = -Math.atan2(-(fromY - this.opts.size/2), -(fromX - this.opts.size/2)) * 180/Math.PI + 180;

        range[1] = -Math.atan2(-(toY - this.opts.size/2), -(toX - this.opts.size/2)) * 180/Math.PI + 180;

        return range;
    }

    /**
     * Defines and saves menu's center position
     * @param {Event} e - Mousedown event
     */
    defineCoordsCenter (e) {
        this.centerX = e.pageX;
        this.centerY = e.pageY;
    }

    /**
     * Creates base elements and appends them to the body.
     */
    createDOM () {
        this.DOMGenerated = true;

        var html = '' +
            '<div class="wheel-menu--ring"></div>' +
            '<div class="wheel-menu--pointer"></div>' +
            '<div class="wheel-menu--cursor"></div>';

        this.$el = this.doc.createElement('div');
        this.$el.classList.add('wheel-menu-container');

        this.$el.innerHTML = html;

        this.$ring =  this.$el.querySelector('.wheel-menu--ring');
        this.$pointer =  this.$el.querySelector('.wheel-menu--pointer');
        this.$cursor =  this.$el.querySelector('.wheel-menu--cursor');

        this.$ring.style.width = this.opts.size + 'px';
        this.$ring.style.height = this.opts.size + 'px';

        this.$body.appendChild( this.$el);
    }

    /**
     * Creates menu items html and appends it to the menu container
     */
    createItemsDOM () {
        var $itemsContainer = this.doc.createElement('div'),
            itemHtml,
            items = '';

        $itemsContainer.classList.add('wheel-menu--items');
        $itemsContainer.setAttribute('id', this.idPrefix + this.idCounter++);
        $itemsContainer.style.width = this.opts.size + 'px';
        $itemsContainer.style.height = this.opts.size + 'px';

        this.opts.items.forEach(function (item) {
            if (typeof item == 'string') {
                itemHtml = item;
            } else {
                itemHtml = item.content ? item.content : 'undefined'
            }
            items += '<span class="wheel-menu--item">' + itemHtml + '</span>';
        });

        $itemsContainer.innerHTML = items;

        this.$el.appendChild($itemsContainer);

        this.$itemsConteiner = $itemsContainer;
        this.$items = $itemsContainer.querySelectorAll('.wheel-menu--item');
    }

    saveCurrentMousePosition (event) {
        this.currentX = event.pageX;
        this.currentY = event.pageY;
    }

    defineVector () {
        this.vector = this.getVector(this.currentX, this.currentY);
    }

    getVector (x, y, isItem) {
        var _x = x - this.centerX,
            _y = y - this.centerY;

        if (isItem) {
            _x = x - this.opts.size/2;
            _y = y - this.opts.size/2;
        }


        var length = Math.sqrt(_x * _x + _y * _y);

        return {
            x: _x,
            y: _y,
            length: length
        };
    }

    /**
     * Calculates angle between vector point and circle center in degrees
     * Begins from 0 to 360
     * @param {Object} [vector] - Vector to calculate from. 'this.vector' by default.
     * @returns {number} - Angle in degrees
     */
    getCursorAngle (vector) {
        vector = vector ? vector : this.vector;

        return -Math.atan2(-vector.y, -vector.x) * 180/Math.PI + 180;
    }

    setPointerPosition (vector) {
        vector = vector ? vector : this.vector;

        var width = this.$pointer.offsetWidth,
            height = this.$pointer.offsetHeight;

        var x = vector.x / vector.length * (this.opts.size/2 + this.opts.pointerOffset) + this.centerX - width/2,
            y = vector.y / vector.length * (this.opts.size/2 + this.opts.pointerOffset) + this.centerY - height/2,
            angle = this.getCursorAngle(vector);

        this.$pointer.style.left = x + 'px';
        this.$pointer.style.top = y + 'px';
        this.$pointer.style[this.transformProp] = 'rotate(' + -angle.toFixed(1) + 'deg)'
    }

    setCursorPosition () {
        var x = this.currentX - this.cursorDims.width/2,
            y = this.currentY - this.cursorDims.height/ 2,
            dims = this.cursorDims,
            vector = this.vector;

        if (this.vector.length > this.opts.size/2 - this.opts.borderWidth - dims.width/2) {
            x = vector.x / vector.length * (this.opts.size/2 - this.opts.borderWidth - dims.width/2) + this.centerX - dims.width/2;
            y = vector.y / vector.length * (this.opts.size/2 - this.opts.borderWidth - dims.height/2) + this.centerY - dims.height/2;
        }

        this.cursorDims.x = x;
        this.cursorDims.y = y;

        this.$cursor.style.left = x + 'px';
        this.$cursor.style.top = y + 'px';
    }

    setRingRotation (vector) {
        var active = this.currentActive,
            angle;

        vector = vector || this.getVector(active.x, active.y);
        angle = this.getCursorAngle(vector);

        this.$ring.style[this.transformProp] = 'rotate(' + -angle.toFixed(1) + 'deg)';
    }

    /**
     * Detects intersection between mouse cursor (vector from center to mouse position)
     * and menu item. If detects, activates this item.
     */
    intersection () {
        var tan = this.vector.y / this.vector.x,
            _this = this,
            from, to,
            cursorDegree = -Math.atan2(-this.vector.y, -this.vector.x) * 180/Math.PI + 180;


        for (var i= 0, max = this.cache.length; i < max; i++) {
            var item = _this.cache[i];

            from = item.range[0];
            to = item.range[1];

            // If one of item's sides area is on the edge state. For example
            // when we have item which 'from' begins from 157 and ends to -157, when all
            // 'cursorDegree' values are appear hear. To not let this happen, we compare
            // 'from' and 'to' and reverse comparing operations.
            if (from > to) {
                if (cursorDegree <= from && cursorDegree <= to || cursorDegree >= from && cursorDegree >= to) {
                    _this.activate(item);
                }
            } else {
                if (cursorDegree >= from && cursorDegree <= to) {
                    _this.activate(item);
                }
            }
        }
        this.cache.forEach(function (item) {

        })
    }

    /**
     * Defines if mouse cursor is in inActive radius
     * @returns {boolean} - True if so
     * @private
     */
    _isInactive () {
        return this.vector.length < this.opts.inActiveRadius
    }

    _saveCursorDimensions () {
        this.cursorDims = {
            width: this.$cursor.offsetWidth,
            height: this.$cursor.offsetHeight
        }
    }

    //  Events
    // -------------------------------------------------

    onMouseDown (e) {
        this.defineCoordsCenter(e);
        this.saveCurrentMousePosition(e);
        this.defineVector();
        this.show();
    }

    onMouseUp (e) {
        if (!this.visible) return;

        if (this.currentActive && this.opts.onChange) {
            var index = this.cache.indexOf(this.currentActive);
            this.opts.onChange(this.keyStrokeParser(this.opts.items[index]));
        }

        this.hide();
    }

    onMouseMove (e) {
        if (this.visible) {
            this.saveCurrentMousePosition(e);
            this.defineVector();
            this.setCursorPosition();

            if (!this.opts.pointerFixed) {
                this.setPointerPosition();
            }
            if (this._isInactive()) {
                this.disable();
            } else {
                this.$html.classList.add('-wheel-menu-moving-');
                this.intersection();
            }
        }
    }

    extend (target) {
        target = arguments[0];

        var objects = Array.prototype.splice.call(arguments,1);

        objects.forEach(function (obj) {
            for(var prop in obj) {
                target[prop] = obj[prop]
            }
        });

        return target;
    }

    keyStrokeParser(value) {
        if (value === 'Current Time') {
            value = (new Date()).toLocaleTimeString();
        }
        return value;
    }
}
