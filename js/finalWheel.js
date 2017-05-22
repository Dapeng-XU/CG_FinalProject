/**
 * Created by 40637 on 2017/5/21.
 */

var dpOrthographicCamera = {
    left: -100,
    right: 100,
    top: 200,
    bottom: 0,
    near: 1,
    far: 1000,
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    up: new THREE.Vector3(),
    initialize: function() {
        this.position.z = 100;
        this.position.y = 10;
        this.lookAt.y = 10;
    }
};
dpOrthographicCamera.initialize();

var dpPerspectiveCamera = function() {
    "use strict";

    // private attributes and methods

    // public attributes and methods
    var publicSet = {

    };

    return publicSet;
}();

var dpRayTracing = function() {
    "use strict";

    // private attributes and methods
    var backgroundColor;

    function closestIntersection(direction, near, far) {

    }

    function shadeAtPoint(position) {

    }

    function rayTrace(direction) {
        if (direction instanceof THREE.Vector3) {
            var closestPoint = closestIntersection(direction, near, far);
            if (closestPoint instanceof THREE.Vector3) {
                return shadeAtPoint(closestPoint);
            } else
                return backgroundColor;
        } else
            return backgroundColor;
    }

    // public attributes and methods
    var publicSet = {
        tracePixel: function(row, col) {
            if (col == 0) {
                return new THREE.Color(0xff0000);
            }
            if (row == 0) {
                return new THREE.Color(0xff0000);
            }
            return new THREE.Color(0xffffff);
        },
        initialize: function () {
            backgroundColor = new THREE.Color(0x000000);
        },
        setBackgroundColor: function (color) {
            if (color instanceof THREE.Color) {
                backgroundColor.copy(color);
            }
        }
    };

    return publicSet;
}();

var dpCanvas2D = function () {  // open IIFE
    "use strict";

    // private attributes and methods
    var DOM;
    var jQ;
    var context;

    // size of this canvas
    var canvasWidth;
    var canvasHeight;
    var pixelsRatio = 1;

    // frame buffer, in the row-major order
    var frameBuffer;

    function initializeFrameBuffer() {
        var i;
        var size = canvasWidth * canvasHeight;
        frameBuffer = new Array(size);
        dpRayTracing.setBackgroundColor(new THREE.Color(0x000000));
    }

    function showFrameBuffer() {
        var r, c, pixelsAbove;
        for (r = 0; r < canvasHeight; r++) {
            pixelsAbove = canvasWidth * r;
            for (c = 0; c < canvasWidth; c++) {
                context.shadowBlur = 0;
                context.transform(1,0,0,1,0,0);
                context.fillStyle = frameBuffer[pixelsAbove + c].getStyle();
                context.fillRect(c, r, 1, 1);
            }
        }
    }

    // public attributes and methods
    var publicSet = {
        // setPosition(): Set the position of the canvas2d in the window, with the parameter x(the most left point of
        // the window) and the parameter y(the most up point of the window).
        setPosition: function(x, y, width, height) {
            if (window.devicePixelRatio) {
                pixelsRatio = window.devicePixelRatio;
            }
            canvasWidth = Math.floor(width * pixelsRatio);
            canvasHeight = Math.floor(height * pixelsRatio);
            jQ.css("left", x).css("top", y).width(canvasWidth).height(canvasHeight);
            context.canvas.height = canvasHeight;
            context.canvas.width = canvasWidth;
        },
        // redraw(): Fill all pixels inside the canvas one by one.
        redraw: function() {
            var r, c;
            initializeFrameBuffer();
            for (r = 0; r < canvasHeight; r++) {
                for (c = 0; c < canvasWidth; c++) {




                    frameBuffer[r * canvasWidth + c] = dpRayTracing.tracePixel(r, c);
                    // frameBuffer[r * canvasWidth + c] = new THREE.Color(0xffffff);
                    if ( 100 < r && r < 200 ) {
                        if ( 200 < c && c < 400) {
                            frameBuffer[r * canvasWidth + c] = new THREE.Color(0xff0000);
                        }
                    }





                }
            }
            showFrameBuffer();
        }
    };

    (function initialize(){
        DOM = document.getElementById('canvas-2d-wheel');
        context = DOM.getContext('2d');
        jQ = $("#canvas-2d-wheel");
    })();

    return publicSet;
}();    // close IIFE