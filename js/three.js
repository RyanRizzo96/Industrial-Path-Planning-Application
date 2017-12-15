var canvas, scene, renderer, camera, controls;
var gridWithDiagonals, gridWithDiagonals2, grid, raycaster, locationX, locationZ;
var line_vert, line_hor, home, scene, cylinder, ground;
var ROTATE = 1,
    DRAG = 2,
    ADD_NODE = 3,
    DELETE = 4,
    ADD_MACHINE = 5,
    ADD_LINE = 6,
    ADD_LINE_HOR = 7,
    ADD_HOME = 8,
    GET_IMAGE = 9;
var mouseAction; // currently selected mouse action
var dragItem; // the cylinder that is being dragged, during a drag operation
var intersects; //the objects intersected
var mouseX, mouseY, newMouseX, newMouseY;
var n = 0;
var CheckMovement;
var targetForDragging; // An invisible object that is used as the target for raycasting while dragging a cylinder.

var xCordMachine, yCordMachine, xCordHome, yCordHome;
var coords_node, coords_machine, coords_home;

//Function to find shortest path
function findPath() {
    const fs = require('fs');
    const jpeg = require('jpeg-js');
    const PathFromImage = require('path-from-image');

    // const startCoords = [xCordHome, yCordHome];
    // const finishCoords = [xCordMachine, yCordMachine];

    const startCoords = [751, 420];
    const finishCoords = [876, 300];

    const image = jpeg.decode(fs.readFileSync('Images/PathPlannerYY.jpg'), true);
    const pathFromImage = new PathFromImage({
        width: image.width,
        height: image.height,
        imageData: image.data,
        colorPatterns: [{ r: [60, 75], g: [0, 0], b: [60, 130] }], // description of the mauve / ping color
    });
    const path = pathFromImage.path(startCoords, finishCoords); // => [[62, 413], [63, 406], [69, 390], ...]
    var i = 0;
    var xChanged = false;
    var yChanged = false;
    var x = 0;
    var y = 1;
    var directionR = false;
    var directionL = false;

    console.log(path.length);
    //console.log(path);
    while (i < path.length) {
        console.log(path[i]);
        // console.log(path[i][x]);
        // console.log(path[i][y]);
        i++;
    }
    i = 0;

    start:
        while (i < path.length + 1) {
            var changeX = path[i][0] - path[i + 1][0];
            var changeY = path[i][1] - path[i + 1][1];

            if (yChanged == false && xChanged == false && (changeY > 15 || changeY < 15)) {
                console.log('Forward');
                yChanged = true;
                xChanged = false;
                console.log(i);
                i++;
                continue start;
            }
            //i++;

            if (yChanged == true && xChanged == false && (changeX > 20 || changeX < -20)) {
                if (changeX > 20) {
                    console.log('Left');
                    console.log(i);
                    console.log('Forward');
                    directionL = true;
                    i++;
                } else if (changeX < -20) {
                    console.log('Right');
                    console.log(i);
                    console.log('Forward');
                    directionR = true;
                    i++;
                }
                xChanged = true;
                yChanged = false;
                console.log(i);
                i++;
                continue start;
            }

            if (directionR == true && xChanged == true && yChanged == false && (changeY > 20 || changeY < -20)) {
                if (changeY > 20) {
                    console.log('Left');
                    console.log(i);
                    console.log('Forward');
                    i++;
                } else if (changeY < -20) {
                    console.log('Right');
                    console.log(i);
                    console.log('Forward');
                    i++;
                }
                yChanged = true;
                xChanged = false;
                console.log(i);
                i++;
                directionR = false;
                continue start;
            }


            if (directionL == true && xChanged == true && yChanged == false && (changeY > 20 || changeY < -20)) {
                if (changeY > 20) {
                    console.log('Right');
                    console.log(i);
                    console.log('Forward');
                    i++;
                } else if (changeY < -20) {
                    console.log('Left');
                    console.log(i);
                    console.log('Forward');
                    i++;
                }
                yChanged = true;
                xChanged = false;
                console.log(i);
                directionL = false;
                i++;
                continue start;
            }
            //i++;


        }

}

//Function to downlaod image to user workspace
function download() {
    var dt = canvas.toDataURL('image/jpeg');
    this.href = dt;
}
document.getElementById('download').addEventListener('click', download, false);

//Function to initialise canvas and scene
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

    canvas.addEventListener('mousemove', function(evt) {
        CheckMovement = setTimeout(function() {
            HasMouseStopped(evt);
        }, 2000);
    }, true);

    function HasMouseStopped(evt) {

        var mousePos = getMousePos(canvas, evt);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        // Math.round to get rid of long decimal place
        xCordMachine = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        yCordMachine = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
        // console.log('x: ' + xCordMachine + ' y: ' + yCordMachine);
        xCordHome = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        yCordHome = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
    }


    // document.getElementById("mouseRotate").checked = true;
    // mouseAction = ROTATE;
    //document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    // document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    document.getElementById("mouseAdd").onchange = doChangeMouseAction;
    document.getElementById("mouseAddHome").checked = true;
    mouseAction = ADD_HOME;
    document.getElementById("mouseAddHome").onchange = doChangeMouseAction;
    document.getElementById("mouseAddMachine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLineHor").onchange = doChangeMouseAction;
    document.getElementById("mouseDelete").onchange = doChangeMouseAction;
    // document.getElementById("mouseImage").onchange = doChangeMouseAction;
    createScene();

    setUpMouseHander(canvas, doMouseDown, doMouseMove);
    setUpTouchHander(canvas, doMouseDown, doMouseMove);
    raycaster = new THREE.Raycaster();
    render();

    // controls = new THREE.OrbitControls(camera, canvas);
    // controls.enableRotate = true;
    // controls.rotateSpeed = 0.4;
    // controls.zoomSpeed = 1;
    // //Disable right click movement to center pixel co-ords
    // controls.enablePan = false;
    // controls.addEventListener('change', render, renderer.domElement);
    // controls.update();
}

// loop that causes the renderer to draw the scene 60 times per second.
function render() {
    renderer.render(scene, camera);
}

function createScene() {

    renderer.setClearColor(0x222222);
    // First parameter is FOV in degrees. Second: Aspect ratio. Third/Fourth: Near/Far clipping plane
    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 10000);
    camera.position.z = 0;
    camera.position.y = 70;

    /**Creating the scene */
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera.lookAt(new THREE.Vector3(0, 1, 0));
    camera.add(new THREE.PointLight(0xffffff, 0.7)); // point light at camera position
    scene.add(camera);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5)); // light shining from above.

    //if grid size is changed, make sure to change clamping co-ords
    grid = new THREE.GridHelper(100, 10, 0x000000, 0x000000);
    // grid.position.y = 5;
    scene.add(grid);

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

    //Geometry for home
    var geometry5 = new THREE.BoxGeometry(3, 0.8, 3);
    var material4 = new THREE.MeshBasicMaterial({ color: "red" });
    home = new THREE.Mesh(geometry5, material4);
    home.position.y = 0.01;

    var col_gray = new THREE.Color("rgb(75, 0, 130)");
    // var col_gray = new THREE.Color("rgb(75, 0, 130)");

    //Geometry for path
    var geometry3 = new THREE.BoxGeometry(1, 1, 7);
    var material2 = new THREE.MeshBasicMaterial({ color: col_gray });
    line_vert = new THREE.Mesh(geometry3, material2);
    line_vert.position.y = 0.01;

    var geometry4 = new THREE.BoxGeometry(7, 1, 1);
    var material3 = new THREE.MeshBasicMaterial({ color: col_gray });
    line_hor = new THREE.Mesh(geometry4, material3);
    line_hor.position.y = 0.01;
}

function addMachine(x, z) {
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

function addNode(x, z) {
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
        // case DRAG:
        //     if (objectHit == grid) {
        //         return false;
        //     } else {
        //         dragItem = objectHit;
        //         scene.add(targetForDragging);
        //         targetForDragging.position.set(0, intersect.point.y, 0);
        //         render();
        //         return true;
        //     }
        case ADD_NODE:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ = intersect.point.z;
                coords_node = new THREE.Vector3(locationX, 0, locationZ);
                addNode(coords_node.x, coords_node.z);
                // console.log("Node at: " + xCord, yCord);
                render();
            }
            return false;
        case ADD_MACHINE:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX1 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ1 = intersect.point.z;
                coords_machine = new THREE.Vector3(locationX1, 0, locationZ1);
                addMachine(coords_machine.x, coords_machine.z);
                console.log("Machine at: " + xCordMachine, yCordMachine);
                render();
            }
            return false;
        case ADD_HOME:
            // controls.enableRotate = false;
            if (objectHit == grid || objectHit == gridWithDiagonals2) {
                var locationX5 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ5 = intersect.point.z;
                coords_home = new THREE.Vector3(locationX5, 0, locationZ5);
                addHome(coords_home.x, coords_home.z);
                console.log("Home at: " + xCordHome, yCordHome);
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
            // case GET_IMAGE:
            //     if (objectHit == grid) {

            //     }
            //     return false;
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

        // var a = 2 * x / canvas.width - 1;
        // var b = 1 - 2 * y / canvas.height;
        // raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
        // intersects = raycaster.intersectObject(targetForDragging);
        // if (intersects.length == 0) {
        //     return;
        // }
        // var locationX = intersects[0].point.x;
        // var locationZ = intersects[0].point.z;
        // var coords = new THREE.Vector3(locationX, 0, locationZ);
        // scene.worldToLocal(coords);

        // //Clamping cylinders to ground when being dragged. This depends on size of grid
        // a = Math.min(39, Math.max(-39, coords.x));
        // b = Math.min(39, Math.max(-39, coords.z));
        // dragItem.position.set(a, 0, b);
        // render();
    }
}

function doChangeMouseAction() {
    //  if (document.getElementById("mouseRotate").checked) {
    // mouseAction = ROTATE;
    // controls.enableRotate = true;
    //  }
    // else if (document.getElementById("mouseDrag").checked) {
    //     mouseAction = DRAG;
    //     controls.enableRotate = false;

    // } 
    if (document.getElementById("mouseAdd").checked) {
        mouseAction = ADD_NODE;
        //  controls.enableRotate = false;
    } else if (document.getElementById("mouseAddMachine").checked) {
        mouseAction = ADD_MACHINE;
        //  controls.enableRotate = false;
    } else if (document.getElementById("mouseAddLine").checked) {
        mouseAction = ADD_LINE;
        //  controls.enableRotate = false;
    } else if (document.getElementById("mouseAddLineHor").checked) {
        mouseAction = ADD_LINE_HOR;
        // controls.enableRotate = false;
    } else if (document.getElementById("mouseAddHome").checked) {
        //  controls.enableRotate = false;
        mouseAction = ADD_HOME;
    }
    // else if (document.getElementById("mouseImage").checked) {
    //     mouseAction = GET_IMAGE;
    //     controls.enableRotate = false;
    // } 
    else {
        mouseAction = DELETE;
        //   controls.enableRotate = false;
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