var canvas, scene, renderer, camera, controls;
var gridWithDiagonals, gridWithDiagonals2, grid, raycaster, locationX, locationZ;
var ground; // A square base on which the cylinders stand.
var cylinder; // A cylinder that will be cloned to make the visible cylinders.
var line_vert;
var line_hor;
var home;
var scene; // An Object3D that contains all the mesh objects in the scene.
// Rotation of the scene is done by rotating the world about its
// y-axis.  (I couldn't rotate the camera about the scene since
// the Raycaster wouldn't work with a camera that was a child
// of a rotated object.)

var ROTATE = 1,
    DRAG = 2,
    ADD = 3,
    DELETE = 4; // Possible mouse actions
ADD_machine = 5;
ADD_LINE = 6;
ADD_LINE_HOR = 7;
ADD_HOME = 8;
var mouseAction; // currently selected mouse action
var dragItem; // the cylinder that is being dragged, during a drag operation
var intersects; //the objects intersected

var targetForDragging; // An invisible object that is used as the target for raycasting while
// dragging a cylinder.  I use it to find the new location of the
// cylinder.  I tried using the ground for this purpose, but to get
// the motion right, I needed a target that is at the same height
// above the ground as the point where the user clicked the cylinder.

var objects = [];
var mouse, plane;
var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff80, overdraw: 0.5 });


// call functions to initialise trackballcontrols
//init();
// animate();

function download() {
    var dt = canvas.toDataURL('PathPlanner/jpeg');
    this.href = dt;
}
document.getElementById('download').addEventListener('click', download, false);

const fs = require('fs');
const jpeg = require('jpeg-js');
const PathFromImage = require('path-from-image');

const bluePointCoords = [62, 413];
const redPointCoords = [514, 39];

const image = jpeg.decode(fs.readFileSync('road.jpg'), true);
const pathFromImage = new PathFromImage({
    width: image.width,
    height: image.height,
    imageData: image.data,
    colorPatterns: [{ r: [60, 255], g: [0, 70], b: [60, 255] }], // description of the mauve / ping color
});
const path = pathFromImage.path(bluePointCoords, redPointCoords); // => [[62, 413], [63, 406], [69, 390], ...]


function init() {

    canvas = document.getElementById("canvas");
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        //preserveDrawingBuffer - whether to preserve the buffers until manually cleared or overwritten. Default is false.
        //Copy the drawing buffer to the display buffer.
        //This operation is slower obviously as copying thousands or millions pixels is not a free operation
        preserveDrawingBuffer: true
    });



    document.getElementById("mouseRotate").checked = true;
    mouseAction = ROTATE;
    document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    document.getElementById("mouseAdd").onchange = doChangeMouseAction;
    document.getElementById("mouseAddHome").onchange = doChangeMouseAction;
    document.getElementById("mouseAddMachine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLineHor").onchange = doChangeMouseAction;
    document.getElementById("mouseDelete").onchange = doChangeMouseAction;
    createScene();


    setUpMouseHander(canvas, doMouseDown, doMouseMove);
    setUpTouchHander(canvas, doMouseDown, doMouseMove);
    raycaster = new THREE.Raycaster();
    render();

    controls = new THREE.OrbitControls(camera, canvas);
    controls.rotateSpeed = 0.4;
    controls.zoomSpeed = 1;
    controls.addEventListener('change', render, renderer.domElement);
    controls.update();
}

// loop that causes the renderer to draw the scene 60 times per second.
function render() {
    renderer.render(scene, camera);
}

function createScene() {

    renderer.setClearColor(0x222222);
    // First parameter is FOV in degrees. Second: Aspect ratio. Third/Fourth: Near/Far clipping plane
    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 10000);
    camera.position.z = -15;
    camera.position.y = 75;

    /**Creating the scene */
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera.lookAt(new THREE.Vector3(0, 1, 0));
    camera.add(new THREE.PointLight(0xffffff, 0.7)); // point light at camera position
    scene.add(camera);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5)); // light shining from above.

    //if grid size is changed, make sure to change clamping co-ords
    grid = new THREE.GridHelper(80, 10, 0x0000f0, 0x000000);
    // grid.position.y = 5;
    scene.add(grid);

    // var gridGeometry = new THREE.PlaneBufferGeometry(80, 80, 10, 10);
    // gridGeometry.rotateY(Math.PI);
    // gridGeometry.rotateX(-Math.PI * 0.5);
    // var gridMaterial = new THREE.MeshBasicMaterial({
    //     color: "black",
    //     wireframe: true
    // });
    // gridWithDiagonals = new THREE.Mesh(gridGeometry, gridMaterial);
    // gridWithDiagonals.position.y = -5;
    // scene.add(gridWithDiagonals);

    // var gridGeometry2 = new THREE.PlaneBufferGeometry(80, 80, 10, 10);
    // gridGeometry2.rotateY(Math.PI);
    // gridGeometry2.rotateX(-Math.PI * -0.5);
    // var gridMaterial2 = new THREE.MeshBasicMaterial({
    //     color: "red",
    //     wireframe: true
    // });
    // gridWithDiagonals2 = new THREE.Mesh(gridGeometry2, gridMaterial2);
    // gridWithDiagonals2.position.y = -0.02;
    // scene.add(gridWithDiagonals2);

    var geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    scene.add(line);

    targetForDragging = new THREE.Mesh(
        new THREE.BoxGeometry(80, 0.1, 80),
        new THREE.MeshBasicMaterial()
    );

    targetForDragging.material.visible = false;

    //Geometry for node
    cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.8),
        new THREE.MeshLambertMaterial({ color: "green" })
    );
    cylinder.position.y = 0.01; // places base at y = 0;

    //Geometry for machine
    var geometry2 = new THREE.BoxGeometry(3, 0.8, 3);
    var material = new THREE.MeshBasicMaterial({ color: "blue" });
    cube = new THREE.Mesh(geometry2, material);
    cube.position.y = 0.01;

    var geometry5 = new THREE.BoxGeometry(3, 0.8, 3);
    var material4 = new THREE.MeshBasicMaterial({ color: "red" });
    home = new THREE.Mesh(geometry5, material4);
    home.position.y = 0.01;

    var geometry3 = new THREE.BoxGeometry(0.8, 1, 7);
    var material2 = new THREE.MeshBasicMaterial({ color: "gray" });
    line_vert = new THREE.Mesh(geometry3, material2);
    line_vert.position.y = 0.01;

    var geometry4 = new THREE.BoxGeometry(7, 1, 0.8);
    var material3 = new THREE.MeshBasicMaterial({ color: "gray" });
    line_hor = new THREE.Mesh(geometry4, material3);
    line_hor.position.y = 0.01;
}

function addCube(x, z) {
    var obj = cube.clone();
    obj.position.x = x;
    obj.position.z = z;
    scene.add(obj);
}

function addHome(x, z) {
    var obj = home.clone();
    obj.position.x = x;
    obj.position.z = z;
    scene.add(obj);
}

function addLine(x, z) {
    var obj = line_vert.clone();
    obj.position.x = x;
    obj.position.z = z;
    scene.add(obj);
}

function addLineHor(x, z) {
    var obj = line_hor.clone();
    obj.position.x = x;
    obj.position.z = z;
    scene.add(obj);
}

function addCylinder(x, z) {
    var obj = cylinder.clone();
    obj.position.x = x;
    obj.position.z = z;
    scene.add(obj);
}

function doMouseDown(x, y) {
    //enable rotate
    if (mouseAction == ROTATE) {
        return true;
    }


    // Affecting drag function
    if (targetForDragging.parent == scene) {
        scene.remove(targetForDragging); // I don't want to check for hits on targetForDragging

    }

    var a = 2 * x / canvas.width - 1;
    var b = 1 - 2 * y / canvas.height;
    raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
    intersects = raycaster.intersectObjects(scene.children); // no need for recusion since all objects are top-level

    if (intersects.length == 0) {
        return false;
    }

    var intersect = intersects[0];
    var objectHit = intersect.object;

    switch (mouseAction) {
        case DRAG:
            if (objectHit == grid) {
                return false;
            } else {
                dragItem = objectHit;
                scene.add(targetForDragging);
                targetForDragging.position.set(0, intersect.point.y, 0);
                render();
                return true;
            }
        case ADD:

            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ = intersect.point.z;
                var coords = new THREE.Vector3(locationX, 0, locationZ);
                addCylinder(coords.x, coords.z);
                console.log("Node at: " + coords.x, coords.z);
                render();
            }

            return false;
        case ADD_machine:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX1 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ1 = intersect.point.z;
                var coords1 = new THREE.Vector3(locationX1, 0, locationZ1);
                addCube(coords1.x, coords1.z);
                console.log("Machine at: " + coords1.x, coords1.z);
                render();
            }
            return false;
        case ADD_HOME:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX5 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ5 = intersect.point.z;
                var coords5 = new THREE.Vector3(locationX5, 0, locationZ5);
                addHome(coords5.x, coords5.z);
                console.log("Home at: " + coords5.x, coords5.z);
                render();
            }
            return false;
        case ADD_LINE:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX2 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ2 = intersect.point.z;
                var coords2 = new THREE.Vector3(locationX2, 0, locationZ2);
                addLine(coords2.x, coords2.z);
                render();
            }
            return false;
        case ADD_LINE_HOR:
            if (objectHit == grid) {

                var locationX3 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ3 = intersect.point.z;
                var coords3 = new THREE.Vector3(locationX3, 0, locationZ3);
                addLineHor(coords3.x, coords3.z);
                render();
            }
            return false;

        default: // DELETE
            if (objectHit != gridWithDiagonals2) {
                if (objectHit != grid) {
                    scene.remove(objectHit);
                    render();
                }
            }
            return false;
    }
}

//this function is used when dragging OR rotating
function doMouseMove(x, y, evt, prevX, prevY) {

    if (mouseAction == ROTATE) {


    } else { // drag

        var a = 2 * x / canvas.width - 1;
        var b = 1 - 2 * y / canvas.height;
        raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
        intersects = raycaster.intersectObject(targetForDragging);
        if (intersects.length == 0) {
            return;
        }
        var locationX = intersects[0].point.x;
        var locationZ = intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, 0, locationZ);
        scene.worldToLocal(coords);

        //Clamping cylinders to ground when being dragged. This depends on size of grid
        a = Math.min(39, Math.max(-39, coords.x));
        b = Math.min(39, Math.max(-39, coords.z));
        dragItem.position.set(a, 0, b);
        render();
    }
}

function doChangeMouseAction() {
    if (document.getElementById("mouseRotate").checked) {
        mouseAction = ROTATE;
        controls.enableRotate = true;

    } else if (document.getElementById("mouseDrag").checked) {
        mouseAction = DRAG;
        controls.enableRotate = false;

    } else if (document.getElementById("mouseAdd").checked) {
        mouseAction = ADD;
        controls.enableRotate = false;

    } else if (document.getElementById("mouseAddMachine").checked) {
        mouseAction = ADD_machine;
        controls.enableRotate = false;

    } else if (document.getElementById("mouseAddLine").checked) {
        mouseAction = ADD_LINE;
        controls.enableRotate = false;

    } else if (document.getElementById("mouseAddLineHor").checked) {
        mouseAction = ADD_LINE_HOR;
        controls.enableRotate = false;
    } else if (document.getElementById("mouseAddHome").checked) {
        mouseAction = ADD_HOME;
        controls.enableRotate = false;
    } else {
        mouseAction = DELETE;
        controls.enableRotate = false;

    }
}
window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function(callback) {
        setTimeout(function() {
            callback(Date.now());
        }, 1000 / 60);
    };

function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
           mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
       */
    if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) {
        throw "Illegal arguments in setUpMouseHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpMouseHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doMouseDown(evt) {
        if (dragging) {
            return;
        }
        var r = element.getBoundingClientRect();
        var x = evt.clientX - r.left;
        var y = evt.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = mouseDownFunc(x, y, evt);
        if (dragging) {
            document.addEventListener("mousemove", doMouseMove);
            document.addEventListener("mouseup", doMouseUp);
        }
    }

    function doMouseMove(evt) {
        if (dragging) {
            if (mouseDragFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doMouseUp(evt) {
        if (dragging) {
            document.removeEventListener("mousemove", doMouseMove);
            document.removeEventListener("mouseup", doMouseUp);
            if (mouseUpFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            dragging = false;
        }
    }
    element.addEventListener("mousedown", doMouseDown);
}

function setUpTouchHander(element, touchStartFunc, touchMoveFunc, touchEndFunc, touchCancelFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           touchStartFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           touchMoveFunc(x,y,evt,prevX,prevY,startX,startY)
           touchEndFunc(evt,prevX,prevY,startX,startY)
           touchCancelFunc()   // no parameters
       */
    if (!element || !touchStartFunc || !(typeof touchStartFunc == "function")) {
        throw "Illegal arguments in setUpTouchHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpTouchHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doTouchStart(evt) {
        if (evt.touches.length != 1) {
            doTouchEnd(evt);
            return;
        }
        evt.preventDefault();
        if (dragging) {
            doTouchEnd();
        }
        var r = element.getBoundingClientRect();
        var x = evt.touches[0].clientX - r.left;
        var y = evt.touches[0].clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = touchStartFunc(x, y, evt);
        if (dragging) {
            element.addEventListener("touchmove", doTouchMove);
            element.addEventListener("touchend", doTouchEnd);
            element.addEventListener("touchcancel", doTouchCancel);
        }
    }

    function doTouchMove(evt) {
        if (dragging) {
            if (evt.touches.length != 1) {
                doTouchEnd(evt);
                return;
            }
            evt.preventDefault();
            if (touchMoveFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.touches[0].clientX - r.left;
                var y = evt.touches[0].clientY - r.top;
                touchMoveFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doTouchCancel() {
        if (touchCancelFunc) {
            touchCancelFunc();
        }
    }

    function doTouchEnd(evt) {
        if (dragging) {
            dragging = false;
            element.removeEventListener("touchmove", doTouchMove);
            element.removeEventListener("touchend", doTouchEnd);
            element.removeEventListener("touchcancel", doTouchCancel);
            if (touchEndFunc) {
                touchEndFunc(evt, prevX, prevY, startX, startY);
            }
        }
    }
    element.addEventListener("touchstart", doTouchStart);
}