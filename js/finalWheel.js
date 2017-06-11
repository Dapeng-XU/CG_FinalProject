/**
 * Created by 40637 on 2017/5/21.
 */

var ERROR_MISMATCHED_TYPE = 'Error: Mismatched type!';
var THREE = window.THREE;

function dpRay(origin, direction) {
    "use strict";
    if (!(origin instanceof THREE.Vector3) || !(direction instanceof THREE.Vector3)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.origin = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.origin.copy(origin);
    this.direction.copy(direction);
    this.direction.normalize();
}

dpRay.prototype = {
    getPoint: function(t) {
        "use strict";
        var ret = new THREE.Vector3();
        ret.copy(this.direction);
        ret.multiplyScalar(t);
        ret.add(this.origin);
        return ret;
    }
};

function dpIntersection(object, position, rayPosition, normal, color) {
    "use strict";
    this.object = object;
    this.position = position;
    this.rayPosition = rayPosition;
    this.normal = normal;
    this.color = color;
}

function dpPlane(normal, point, material) {
    "use strict";
    if (!(normal instanceof THREE.Vector3) || !(point instanceof THREE.Vector3)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.normal = new THREE.Vector3();
    this.normal.copy(normal);
    this.normal.normalize();
    this.point = point;
    this.material = material;
}

dpPlane.prototype = {
    intersectsRay: function (ray) {
        "use strict";
        if (!(ray instanceof dpRay)) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var nd = this.normal.dot(ray.direction);
        if (nd === 0) {
            return null;
        }
        var diff = new THREE.Vector3();
        diff.subVectors(this.point, ray.origin);
        var t = ( this.normal.dot(diff) ) / nd;
        return new dpIntersection(this, ray.getPoint(t), t, this.normal, null);
    },
    getU_UV: function () {
        var u = new THREE.Vector3(0, 0, 0);
        if (this.normal.x === 0) {
            if (this.normal.y === 0) {
                u.x = 1;
            } else {
                u.y = - this.normal.z / this.normal.y;
                u.z = 1;
                u.normalize();
            }
        } else {
            u.x = - this.normal.z / this.normal.x;
            u.z = 1;
            u.normalize();
        }
        return u;
    }
};

function dpTriangle(a, b, c, material) {
    "use strict";
    if (!(a instanceof THREE.Vector3) || !(b instanceof THREE.Vector3) || !(c instanceof THREE.Vector3)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.a = new THREE.Vector3().copy(a);
    this.b = new THREE.Vector3().copy(b);
    this.c = new THREE.Vector3().copy(c);
    var ba = new THREE.Vector3();
    ba.copy(a).sub(b);
    var bc = new THREE.Vector3();
    bc.copy(c).sub(b);
    var normal = new THREE.Vector3();
    normal.crossVectors(ba, bc);
    this.area = normal.length();
    this.normal = normal.normalize();
    this.material = material;
}

dpTriangle.prototype = {
    getArea: function () {
        "use strict";
        var ba = new THREE.Vector3();
        ba.copy(this.b).sub(this.a);
        var bc = new THREE.Vector3();
        bc.copy(this.b).sub(this.c);
        return ba.cross(bc).length();
    },
    intersectsRay: function (ray) {
        "use strict";
        if (!(ray instanceof dpRay)) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }

        // get the intersection
        var plane = new dpPlane(this.normal, this.b);
        var intersection = plane.intersectsRay(ray);
        if (intersection === null) {
            return null;
        }
        var point = intersection.position;

        var pa = new THREE.Vector3();
        pa.subVectors(this.a, point);
        var pb = new THREE.Vector3();
        pb.subVectors(this.b, point);
        var pc = new THREE.Vector3();
        pc.subVectors(this.c, point);
        var tmp1 = new THREE.Vector3();
        tmp1.crossVectors(pa, pb);
        var area_pab = tmp1.length();
        tmp1.crossVectors(pb, pc);
        var area_pbc = tmp1.length();
        tmp1.crossVectors(pc, pa);
        var area_pca = tmp1.length();
        if (area_pab + area_pbc + area_pca > this.area) {
            return null;
        } else {
            return new dpIntersection(this, point, intersection.rayPosition, intersection.normal, null);
        }
    }
};

function dpCube(position, length, material) {
    "use strict";
    if (!(position instanceof THREE.Vector3)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.center = new THREE.Vector3();
    this.center.copy(position);
    this.radius = length / 2;
    this.material = material;

}

dpSphere.prototype = {
    intersectsRay: function(ray) {
        "use strict";
        var center2 = new THREE.Vector3();
        var direction = new THREE.Vector3();
        var plane;
        var minRayPosition = new dpIntersection(null, null, Infinity, null, null);
        var intersection = new dpIntersection(null, null, null, null, null);

        // left:
        direction.set(-this.radius,0,0);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.y - intersection.position.y) < this.radius &&
            Math.abs(this.center.z - intersection.position.z) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        // Right
        direction.set(this.radius,0,0);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.y - intersection.position.y) < this.radius &&
            Math.abs(this.center.z - intersection.position.z) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        // Up
        direction.set(0,this.radius,0);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.x - intersection.position.x) < this.radius &&
            Math.abs(this.center.z - intersection.position.z) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        // Down
        direction.set(0,-this.radius,0);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.x - intersection.position.x) < this.radius &&
            Math.abs(this.center.z - intersection.position.z) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        // Front
        direction.set(0,0,this.radius);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.x - intersection.position.x) < this.radius &&
            Math.abs(this.center.y - intersection.position.y) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        // Back
        direction.set(0,0,-this.radius);
        center2.addVectors(this.center, direction);
        plane = new dpPlane(direction, center2, null);
        intersection = plane.intersectsRay(ray);
        if (Math.abs(this.center.x - intersection.position.x) < this.radius &&
            Math.abs(this.center.y - intersection.position.y) < this.radius) {
            if (intersection.rayPosition < minRayPosition.rayPosition) {
                minRayPosition = intersection;
            }
        }

        if (minRayPosition.rayPosition === Infinity) {
            return null;
        } else {
            return minRayPosition;
        }
    }
};

function dpSphere(position, radius, material) {
    "use strict";
    if (!(position instanceof THREE.Vector3)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.center = new THREE.Vector3();
    this.center.copy(position);
    this.radius = radius;
    this.material = material;
}

dpSphere.prototype = {
    intersectsRay: function(ray) {
        "use strict";
        var cp = new THREE.Vector3();
        cp.subVectors(ray.origin, this.center);
        var cp_d = cp.dot(ray.direction);
        var d_square = ray.direction.lengthSq();
        var delta = cp_d;
        delta = delta * delta;
        delta -= cp.lengthSq() * d_square;
        delta += this.radius * this.radius;
        if (delta < 0)
            return null;
        else {
            var part1 = - cp_d / d_square;
            var part2 = Math.sqrt(delta) / d_square;
            // var t = (part1 - part2 > 0) ? (part1 - part2) : (part1 + part2);
            var t = part1 - part2;
            var point = ray.getPoint(t);
            var normal = new THREE.Vector3();
            normal.subVectors(point, this.center).normalize();
            return new dpIntersection(this, point, t, normal, null);
        }
    }
};

function dpPerspectiveCamera(fov, aspect, near, far) {
    "use strict";
    this.position = new THREE.Vector3(0,0,0);
    this.lookAt = new THREE.Vector3(0,0,0);
    this.up = new THREE.Vector3(0,0,0);
    this.right = new THREE.Vector3(0,0,0);

    this.direction = new THREE.Vector3(0,0,0);

    this.IUp_n = new THREE.Vector3(0,0,0);
    this.IRight_n = new THREE.Vector3(0,0,0);

    this.fov = degrees2radians(fov);
    this.aspect = aspect;
    this.near = near;
    this.far = far;
}

dpPerspectiveCamera.prototype = {
    DISTANCE_FROM_CAMERA_TO_IMAGEPLANE: 1,
    move: function(position, lookAt, up) {
        "use strict";
        if (!(position instanceof THREE.Vector3) || !(lookAt instanceof THREE.Vector3) || !(up instanceof THREE.Vector3)) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        this.position = position;
        this.lookAt = lookAt;

        // compute the main pole of the camera
        this.direction.subVectors(lookAt, position).normalize();

        // compute the vector IUp_n
        var IUp = new THREE.Vector3();
        IUp.subVectors(up,
            (new THREE.Vector3()).copy(this.direction).multiplyScalar(up.dot(this.direction))
        );
        this.IUp_n.copy(IUp.normalize().negate());

        // compute the vector IRight_n
        this.IRight_n.copy((new THREE.Vector3()).crossVectors(this.direction, IUp).normalize().negate());
    },
    getViewerRay: function (x, y, canvasWidth, canvasHeight) {
        "use strict";
        var endpoint = new THREE.Vector3();
        endpoint.copy(this.position);
        var newDirection = new THREE.Vector3();
        newDirection.copy(this.direction).multiplyScalar(this.DISTANCE_FROM_CAMERA_TO_IMAGEPLANE);
        var tmp_up = new THREE.Vector3();
        tmp_up.copy(this.IUp_n).multiplyScalar( y / canvasHeight - 0.5 );
        var IUP_length = 2 * this.DISTANCE_FROM_CAMERA_TO_IMAGEPLANE * Math.tan(this.fov / 2);
        tmp_up.multiplyScalar(IUP_length);
        var tmp_right = new THREE.Vector3();
        tmp_right.copy(this.IRight_n).multiplyScalar( x / canvasWidth );
        tmp_right.multiplyScalar(this.aspect * IUP_length);
        newDirection.add(tmp_up).add(tmp_right);
        return new dpRay(this.position, newDirection);
    }
};

function dpDirectionalLight(direction, intensity, color) {
    "use strict";
    if (!(direction instanceof THREE.Vector3) || !(color instanceof THREE.Color)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.direction = new THREE.Vector3();
    this.direction.copy(direction).normalize();
    this.intensity = intensity;
    this.color = color;
}

dpDirectionalLight.prototype = {

};

function dpPointLight(position, intensity, color) {
    "use strict";
    if (!(position instanceof THREE.Vector3) || !(color instanceof THREE.Color)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.position = position;
    this.intensity = intensity;
    this.color = color;
}

dpPointLight.prototype = {

};

function dpCheckboardMaterial(size) {
    "use strict";
    this.size = Math.max(1, Math.round(size));
}

dpCheckboardMaterial.prototype = {
    BLACK: new THREE.Color(0x000000),
    WHITE: new THREE.Color(0xFFFFFF),
    initialize: function (position, normal) {
        // find the center point, the normalized U and V vectors
        this.UVPlane = new dpPlane(normal, position);
        this.u = this.UVPlane.getU_UV();
        this.v = new THREE.Vector3();
        this.v.crossVectors(this.u, normal).normalize();
        this.UVCenter = new THREE.Vector3(0, 0, 0);
        if (normal.z !== 0) {
            this.UVCenter.z = normal.dot(position) / normal.z;
        } else if (normal.y !== 0) {
            this.UVCenter.y = normal.dot(position) / normal.y;
        } else {
            this.UVCenter.x = normal.dot(position) / normal.x;
        }
    },
    getColor: function(position, incident, distance, viewer, normal, light) {
        "use strict";
        if ( !(position instanceof THREE.Vector3) || !(normal instanceof THREE.Vector3) ) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }

        if ( !(this.UVPlane instanceof dpPlane) ) {
            this.initialize(position, normal);
        }

        // do the projection first
        var point = new THREE.Vector3(0, 0, 0);
        point.subVectors(position, this.UVCenter);
        var _x = Math.floor(point.dot(this.u) / this.size);
        var _y = Math.floor(point.dot(this.v) / this.size);

        // determine which color it should be shaded
        if ( (_x + _y) % 2 === 0) {
            return this.BLACK;
        } else {
            return this.WHITE;
        }
    }
};

function dpPhongIlluminationMaterial(ambient, diffuse, specular, k_a, k_d, k_s, n_shiny, reflectiveness) {
    "use strict";
    if (!(ambient instanceof THREE.Color) || !(diffuse instanceof THREE.Color) || !(specular instanceof THREE.Color)) {
        errout(ERROR_MISMATCHED_TYPE, true, true);
    }
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;

    this.k_a = k_a;
    this.k_s = k_s;
    this.k_d = k_d;

    this.n_shiny = n_shiny;
    this.reflectiveness = reflectiveness;
}

dpPhongIlluminationMaterial.prototype = {
    d: {
        a: 0,
        b: 0,
        c: 1
    },
    getColor: function(position, incident, distance, viewer, normal, light) {
        "use strict";
        if ( !(incident instanceof THREE.Vector3) || !(viewer instanceof THREE.Vector3)
            || !(normal instanceof THREE.Vector3) || !(position instanceof THREE.Vector3)
            || !( (light instanceof dpDirectionalLight) || (light instanceof dpPointLight) ) ) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var finalColor = new THREE.Color(0x000000);
        var tempColor = new THREE.Color(0x000000);
        var diffuseColor = new THREE.Color(0x000000);
        var specularColor = new THREE.Color(0x000000);

        // compute the occluded coefficient of scatter and diffuse
        var occlusion;
        // for the circumstance that we have a directional light
        if ( light instanceof dpDirectionalLight ) {
            occlusion = 1;
        } else if ( light instanceof dpPointLight ) {
            occlusion = Math.min(1, 1 / (this.d.a + this.d.b * distance + this.d.c * distance * distance));
        } else {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }

        // compute the reflection vector
        var reflective = new THREE.Vector3(0, 0, 0);
        reflective.copy(normal).multiplyScalar(2 * normal.dot(incident)).sub(incident);

        // the ambient part
        tempColor.copy(this.ambient).multiplyScalar(this.k_a);
        finalColor.add(tempColor);

        // the diffuse and specular parts
        diffuseColor.copy(this.specular).multiplyScalar(
            this.k_d * Math.max(incident.dot(normal), 0)
        );
        specularColor.copy(this.specular).multiplyScalar(
            this.k_s * Math.pow(
                Math.max(reflective.dot(viewer), 0),
                this.n_shiny
            )
        );
        tempColor.addColors(diffuseColor, specularColor).
        multiplyScalar(light.intensity * occlusion).multiply(light.color);
        finalColor.add(tempColor);

        return finalColor;
    }
};

var light_group = [
    new dpPointLight(new THREE.Vector3(6,6,6), 40, new THREE.Color(0xffff00)),
    new dpDirectionalLight(new THREE.Vector3(0,-1,0), 5, new THREE.Color(0xdddddd))
    // new dpDirectionalLight(new THREE.Vector3(-1,-1,-1), 5, new THREE.Color(0xdddddd))
];

// var object_group = [
//     new dpSphere(new THREE.Vector3(1,1,1), 0.5, new dpPhongIlluminationMaterial(
//         new THREE.Color().setStyle('darkgreen'),
//         new THREE.Color().setStyle('green'),
//         new THREE.Color().setStyle('greenyellow'),
//         0.2, 0.4, 0.4, 75)
//     ),
//     new dpPlane(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), new dpCheckboardMaterial(4))
// ];

var checkboard_scalar = 1;

var object_group = [
    new dpSphere(new THREE.Vector3(2,2,4), 2, new dpPhongIlluminationMaterial(
        new THREE.Color().setStyle('darkgreen'),
        new THREE.Color().setStyle('green'),
        new THREE.Color().setStyle('greenyellow'),
        0.2, 0.4, 0.6, 5)
    ),
    new dpSphere(new THREE.Vector3(6,2,4), 2, new dpPhongIlluminationMaterial(
        new THREE.Color().setStyle('blue'),
        new THREE.Color().setStyle('midnightblue'),
        new THREE.Color().setStyle('whitesmoke'),
        0.2, 0.4, 0.6, 5)
    ),
    // new dpPlane(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), new dpCheckboardMaterial(4 * checkboard_scalar)),
    new dpPlane(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), new dpCheckboardMaterial(1 * checkboard_scalar))
    // new dpPlane(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), new dpCheckboardMaterial(1 * checkboard_scalar))
];

var dpRayTracing = function() {
    "use strict";

    // private attributes and methods
    var backgroundColor = new THREE.Color(0xFF8888);

    function shadeAtPoint(position, viewer, normal, material) {
        if (!(position instanceof THREE.Vector3) || !(viewer instanceof THREE.Vector3) ||
            !(normal instanceof THREE.Vector3) || material === null || material === undefined) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var incident = new THREE.Vector3();
        var distance = 0;
        var currentColor = new THREE.Color();
        var finalColor = new THREE.Color(0x000000);
        for (const light of light_group) {
            if ( light instanceof dpPointLight ) {
                incident.subVectors(light.position, position);
                distance = incident.length();
                incident.normalize();
                currentColor = material.getColor(position, incident, distance, viewer, normal, light);
                finalColor.add(currentColor);
            } else if ( light instanceof dpDirectionalLight ) {
                incident.copy(light.direction).normalize();
                currentColor = material.getColor(position, incident, distance, viewer, normal, light);
                finalColor.add(currentColor);
            }
        }
        return finalColor;
    }

    function closestIntersection(ray, camera) {
        if (!(ray instanceof dpRay)) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var minRayPosition = new dpIntersection(null, null, Infinity, null, null);
        var intersection = new dpIntersection(null, null, null, null, null);
        for (const object of object_group) {
            if (typeof object.intersectsRay === "function") {
                intersection = object.intersectsRay(ray);
                if ( intersection instanceof dpIntersection )
                    if (0 < intersection.rayPosition && intersection.rayPosition < camera.far &&
                        intersection.rayPosition < minRayPosition.rayPosition) {
                        minRayPosition = intersection;
                    }
            }
        }
        if (minRayPosition.rayPosition === Infinity) {
            return null;
        } else {
            return minRayPosition;
        }
    }

    // function rayTrace(ray) {
    //     if (!(ray instanceof dpRay)) {
    //         errout(ERROR_MISMATCHED_TYPE, true, true);
    //     }
    //     var closest = closestIntersection(ray);
    //     if ( closest !== null ) {
    //         return shadeAtPoint(closest.position, ray.direction, closest.normal, closest.object.material);
    //     } else {
    //         return backgroundColor;
    //     }
    // }

    var MAX_DEPTH = 2;
    var REFLECTIVENESS = 0.25;

    function recursiveRayTracer(ray, depth, camera) {
        if ( !(ray instanceof dpRay) ) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var closest = closestIntersection(ray, camera);
        if ( closest !== null ) {
            if (closest.object === null || closest.position === null ||
                closest.rayPosition === null || closest.normal === null) {
                errout(ERROR_MISMATCHED_TYPE, true, true);
            }

            var finalColor = new THREE.Color();
            if (depth < MAX_DEPTH) {
                var reflectionVector = new THREE.Vector3();
                reflectionVector.copy(closest.normal).multiplyScalar(-2 * closest.normal.dot(ray.direction));
                reflectionVector.add(ray.direction);
                var reflectionRay = new dpRay(closest.position, reflectionVector);
                var reflectiveColor = recursiveRayTracer(reflectionRay, depth + 1, camera);
                var shadingColor = shadeAtPoint(closest.position, ray.direction, closest.normal, closest.object.material);
                reflectiveColor.multiplyScalar(REFLECTIVENESS);
                shadingColor.multiplyScalar(1 - REFLECTIVENESS);
                finalColor.addColors(shadingColor, reflectiveColor);
            } else {
                finalColor = shadeAtPoint(closest.position, ray.direction, closest.normal, closest.object.material);
            }

            return finalColor;
        } else {
            return backgroundColor;
        }
    }

    // public attributes and methods
    var publicSet = {
        nTrace: function (ray, camera) {
            return recursiveRayTracer(ray, 0, camera);
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

    var camera;

    function initializeFrameBuffer() {
        var i;
        var size = canvasWidth * canvasHeight;
        frameBuffer = new Array(size);
        camera = new dpPerspectiveCamera(90, canvasWidth / canvasHeight, 1, 500);
        camera.move( new THREE.Vector3(0,1,10), new THREE.Vector3(0,1,0), new THREE.Vector3(0,1,0) );
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

    function drawRectangle(x1, y1, x2, y2, color) {
        if (!(color instanceof THREE.Color)) {
            errout(ERROR_MISMATCHED_TYPE, true, true);
        }
        var r, c;
        for ( r = y1; r <= y2; r++ ) {
            for ( c = x1; c <= x2; c++) {
                frameBuffer[r * canvasWidth + c] = color;
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
            var averageColor = new THREE.Color();
            var sum_r = 0, sum_g = 0, sum_b = 0;
            var colors = [null, null, null, null, null];
            for (r = 0; r < canvasHeight; r++) {
                for (c = 0; c < canvasWidth; c++) {
                    // frameBuffer[r * canvasWidth + c] = dpRayTracing.nTrace(camera.getViewerRay(c, r, canvasWidth, canvasHeight), camera);
                    colors[0] = dpRayTracing.nTrace(camera.getViewerRay(c - 0.25, r - 0.25, canvasWidth, canvasHeight), camera);
                    colors[1] = dpRayTracing.nTrace(camera.getViewerRay(c + 0.25, r - 0.25, canvasWidth, canvasHeight), camera);
                    colors[2] = dpRayTracing.nTrace(camera.getViewerRay(c + 0.00, r + 0.00, canvasWidth, canvasHeight), camera);
                    colors[3] = dpRayTracing.nTrace(camera.getViewerRay(c - 0.25, r + 0.25, canvasWidth, canvasHeight), camera);
                    colors[4] = dpRayTracing.nTrace(camera.getViewerRay(c + 0.25, r + 0.25, canvasWidth, canvasHeight), camera);
                    sum_r = 0; sum_g = 0; sum_b = 0;
                    for (var i = 0; i < 5; i++) {
                        sum_r += colors[i].r;
                        sum_g += colors[i].g;
                        sum_b += colors[i].b;
                    }
                    frameBuffer[r * canvasWidth + c] = new THREE.Color(sum_r / 5, sum_g / 5, sum_b / 5);
                }
            }
            // drawRectangle(200, 100, 240, 120, new THREE.Color(0xff0000));
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

var debug_object;