var canvas, scene, renderer, camera, controls;
var gridWithDiagonals, gridWithDiagonals2, grid, raycaster, locationX, locationZ;
var line_vert, line_hor, home, scene, cylinder, ground;
var ROTATE = 1,
    DRAG= 12;
    SELECT_FINISH = 2,
    SELECT_NODE = 11,
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

var xCordMachine, yCordMachine, xCordHome, yCordHome, xCordNode, yCordNode;
var xCordMouse, yCordMouse, xCordMouse, yCordMouse;
var coords_node, coords_machine, coords_home;
var startCoords;
var finishCoords;
var myJSON_Home, myJSON_Machine; 

var node_loc = [];    //initialize array to hold coordinates
var node_weight = []; //initialize array to hold wieghts
var weights_total = [];
var node_counter = -1;
var nodeCoords, weight_y, weight_x, edgeWeight, x, y, e, pos, testflag;
var finish;
var generateGraph_count = 0;
//var c = 95; //ascii a for map
//var d = 95; //ascii a for map
//var C = 65; //ascii A for key value pair

//var s = String.fromCharCode(c);

//var Dijkstra= require('../node_modules/graph-dijkstra/dist/graph-dijkstra');
//var Dijkstra = require('../node_modules/graph-dijkstra/src/graph');

//const Graph = require('graph-dijkstra');

var graph = new Graph();
var path;
var letter;

var myJSON;
var BT_buffer;
var command = [];
var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

connectBluetooth();
console.log("after bt")
function connectBluetooth() {

    btSerial.on('found', function(address, name) {
        btSerial.findSerialPortChannel(address, function(channel) {
            btSerial.connect(address, channel, function() {
                console.log('Bluetooth Connected');

                btSerial.on('data', function(buffer) {
                    console.log(buffer.toString('utf-8'));
                    //console.log('connected2');
                });
            }, function () {
                console.log('cannot connect');
                console.log('test');
            });
     
            // close the connection when you're ready
            btSerial.close();
        }, 
        
        function() {
            console.log('found nothing');
        });
    });
    
    btSerial.inquire();    
}

//Function to stroe simple object in an array. takes in x and y coords
function storeCoordinate(pos, xVal, yVal, array) {
    //The push() method adds one or more elements to the end of an array and returns the new length of the array.
    array.push({p: pos, x: xVal, y: yVal});
}

//Function to stroe simple object in an array. takes in x and y weights
function storeWeight(edge, xVal, yVal, array) {
    //The push() method adds one or more elements to the end of an array and returns the new length of the array.
    array.push({e: edge, x: xVal, y: yVal});
}

function myFunction() {
    for (i = 65; i < 91; i++) {
        letter = String.fromCharCode(i);
    }
}




// function storeDataHome() {
//     //const {app} = require('electron')
//     var fs = require('graceful-fs')
        
//     const storage = require('electron-json-storage');
//     const dataPath = storage.getDataPath();
//     console.log('Saving to: ' + dataPath);

//     fs.writeFile('/Users/ryanr/AppData/Roaming/electron-quick-start/storage', myJSON_Home  + "\r\n", (err) =>  {
//         //if error, catch
//         if (err) throw err;

//         //success case
//         //console.log('Successful Home Coords' + myJSON_Home + 'Saved');
//     });
    
// }

// function storeDataMachine() {
//     //const {app} = require('electron')
//     var fs = require('graceful-fs')
        
//     const storage = require('electron-json-storage');
//     const dataPath = storage.getDataPath();
//     console.log('Saving to: ' + dataPath);

//     fs.appendFile('/Users/ryanr/AppData/Roaming/electron-quick-start/storage', myJSON_Machine, (err) =>  {
//         //if error, catch
//         if (err) throw err;

//         //success case
//         //console.log('Successful Machine Coords' + myJSON_Machine + 'Saved' );
//     }); 
// }

//Press F5 for refresh
	document.addEventListener("keydown", function (e) {
		if (e.which === 123) {
			require('remote').getCurrentWindow().toggleDevTools();
		} else if (e.which === 116) {
			location.reload();
		}
	});


function dijkstra() {

    //graph, nType, starting point, finish point
    var results   = Dijkstra.run(graph,0, 0, finish);
    console.log(results);
    path = Dijkstra.getPath(results.prev, finish);
    console.log("Path: ",path);
    console.log("Path Length: ",path.length);
}

function generateGraph() {
    //Print node co-ordinates
    var route1;

    if (generateGraph_count == 0) {
        for (var i = 0; i < node_loc.length; i++) {
            x = node_loc[i].x;
            y = node_loc[i].y;
            //console.log("N", i, ":", node_loc[i].x, node_loc[i].y);
            graph.addNode(i);
            console.log("GD addNode", i)
        } 

        for (var j = 0; j < node_loc.length-1; j++) {

            weight_x = node_loc[j+1].x - node_loc[j].x;
            weight_y = node_loc[j+1].y - node_loc[j].y;


            edgeWeight = [j,j+1];

            //graph.update(j, {nieghbours: j+1})
            graph.addEdge(j,j+1);
            console.log(graph.edges);

            //if-conditions to cancel out errors
            if ((weight_x <= 10 && weight_x >=0) || (weight_x >= -10 && weight_x <=0)) {
                weight_x = 0;
            }
            if ((weight_y <= 10 && weight_y >=0) || (weight_y >= -10 && weight_y <=0)) {
                weight_y = 0;
            }
            
            //find absolute total weight
            weights_total[j] = Math.abs(weight_x) + Math.abs(weight_y);

            storeWeight(edgeWeight, weight_x, weight_y, node_weight);

            // graph.addNode(j, {weight: weights_total[j]});
            // console.log("GD addNode2", j, "weight", weights_total[j])
            // graph.addEdge(j,j+1);
            // console.log("GD addEdge", j,j+1)
            
        }
    }
    else {
        for (var i = 0; i < node_loc.length; i++) {
            x = node_loc[i].x;
            y = node_loc[i].y;
            //console.log("N", i, ":", node_loc[i].x, node_loc[i].y);
            graph.addNode(i);
            console.log("GD addNode", i)
        } 
    }
    console.log("Total W:", weights_total);
    generateGraph_count++;
    console.log(generateGraph_count);
}

//Function to find shortest path
function findPath() {

        const robot_move= [];

        console.log("For loop");

        for (var i = 0; i <= path.length + (node_counter - path.length); i++) {
            for (var j = 0; j <= path.length + (node_counter - path.length); j++) {
                if (path[i] == node_loc[j].p) {
                    robot_move[i] = [node_loc[j].x, node_loc[j].y]; 
                }
            }
        }

        console.log(robot_move);

        var i = 0;
        var xChanged = false;
        var yChanged = false;
        var x = 0;
        var y = 1;
        var directionR = false;
        var directionL = false;


        // console.log(path.length);
        
        // while (i < path.length) {
        //     console.log(path[i]);
        //     i++;
        // }
        i = 0;
        var count = 0;

        //Remember
        btSerial.write(new Buffer('-', 'utf-8'), function(err, bytesWritten) {
            if (err) console.log(err);
        });

        start:
            for (i = 0; i < robot_move.length-1; i++) {
                count++;
                var changeX = robot_move[i + 1][0] - robot_move[i][0];
                var changeY = robot_move[i + 1][1] - robot_move[i][1];
                
                //Robot in Start position
                if ((yChanged == false && xChanged == false) && (changeY < -15)){
                    console.log(i);
                    console.log('Forward 0');
                    command[count] = 'F0, ';
                    btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                        if (err) console.log(err);
                    });
                    yChanged = true;
                    xChanged = false;
                    continue start;
                }

                //Robot turns either left or right
                if (yChanged == true && xChanged == false){
                    //Robot turns right
                    if(changeX > 15) {
                        console.log(i);
                        console.log('Right 1');
                        command[count] = 'R, ';
                        btSerial.write(new Buffer('R', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        yChanged = false;
                        xChanged = true;
                        directionR = true;
                        //Moving Robot Forward, incrementing step
                        if (directionR == true && changeX > 10) {
                            //i++;
                            console.log(i);
                            console.log('Forward 1'); 
                            command[count+1] = 'F, ';   
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });                
                            continue start;
                        }
                    }
                    //Robot turns left
                    else if(changeX < -15) {
                        console.log(i);
                        console.log('Left 1');
                        command[count] = 'L, ';
                        btSerial.write(new Buffer('L', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        yChanged = false;
                        xChanged = true;
                        directionL = true;
                        //Moving Robot Forward, incrementing step
                        if (directionL == true && changeX < -10) {
                        // i++;
                            console.log(i);
                            console.log('Forward 1');
                            count++;
                            command[count] = 'F, ';
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });
                            continue start;
                    }
                }
            }
            //If robot has just finished move along x-axis
            //Detecting change in y-axis
            if(xChanged == true && yChanged == false) {
                //Robot moving to right must turn left and upwards
                if (directionR == true && changeY < -15) {
                    console.log(i);
                    console.log('Left 2');
                    command[count] = 'L, ';
                    btSerial.write(new Buffer('L', 'utf-8'), function(err, bytesWritten) {
                        if (err) console.log(err);
                    });
                    //Moving robot Forward
                    if (directionR == true && changeY < -15) {
                        //i++;
                        console.log(i);
                        console.log('Forward 2'); 
                        count++;
                        command[count] = 'F, ';
                        btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        if (changeY < -100){
                            console.log(i);
                            console.log('Forward 2.1'); 
                            count++;
                            command[count] = 'F, ';
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });
                        }
                        yChanged = true;
                        xChanged = false;
                        dirctionL = false;
                        continue start;
                    }
                }
                //Robot moving to left must turn right and upwards
                if (directionL == true && changeY < -15) {
                    console.log(i);
                    console.log('Right 2');
                    command[count] = 'R, ';
                    btSerial.write(new Buffer('R', 'utf-8'), function(err, bytesWritten) {
                        if (err) console.log(err);
                    });
                    //Moving Robot Forward
                    if (directionL == true && changeY < -15) {
                    //    i++;
                        console.log(i);
                        console.log('Forward 2'); 
                        count++;
                        command[count] = 'F, ';
                        btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        if (changeY < -100){
                            console.log(i);
                            console.log('Forward 2.1');  
                            count++;
                            command[count] = 'F, ';
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });
                        }
                        yChanged = true;
                        xChanged = false;
                        dirctionR = false;
                        continue start;
                    }
            }
                //Here
                if(xChanged == true && yChanged == false) {
                    //Robot moving to right must turn left and downwards
                    if (directionR == true && changeY > 15) {
                        console.log(i);
                        console.log('Right test');
                        command[count] = 'R, ';
                        btSerial.write(new Buffer('R', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        //Moving robot Forward
                        if (directionR == true && changeY > 15) {
                            //i++;
                            console.log(i);
                            console.log('Forward 2'); 
                            count++;
                            command[count] = 'F, ';
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });
                            if (changeY > 100){
                                console.log(i);
                                console.log('Forward 2.1'); 
                                count++;
                                command[count] = 'F, ';
                                btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                    if (err) console.log(err);
                                });
                            }
                            yChanged = true;
                            xChanged = false;
                            dirctionL = false;
                            continue start;
                        }
                    }
                    //Robot moving to left must turn right and downwards
                    if (directionL == true && changeY > 15) {
                        console.log(i);
                        console.log('Left test');
                        command[count] = 'L, ';
                        btSerial.write(new Buffer('L', 'utf-8'), function(err, bytesWritten) {
                            if (err) console.log(err);
                        });
                        //Moving Robot Forward
                        if (directionL == true && changeY > 15) {
                        //    i++;
                            console.log(i);
                            console.log('Forward 2'); 
                            count++;
                            command[count] = 'F, ';
                            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                if (err) console.log(err);
                            });
                            if (changeY > 100){
                                console.log(i);
                                console.log('Forward 2.1');  
                                count++;
                                command[count] = 'F, ';
                                btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                                    if (err) console.log(err);
                                });
                            }
                            yChanged = true;
                            xChanged = false;
                            dirctionR = false;
                            continue start;
                        }
                    }
                }           
            }
        console.log('Passing here'+ i);
        }
        for (var x = 0; x < 2; x++) {
        btSerial.write(new Buffer('E', 'utf-8'), function(err, bytesWritten) {
            if (err) console.log(err);
        });
        btSerial.write(new Buffer('+++', 'utf-8'), function(err, bytesWritten) {
            if (err) console.log(err);
        });
        // btSerial.write(new Buffer('+', 'utf-8'), function(err, bytesWritten) {
        //     if (err) console.log(err);
        // });
        // btSerial.write(new Buffer('+', 'utf-8'), function(err, bytesWritten) {
        //     if (err) console.log(err);
        // });

        console.log('Commands Sending: ' + count);
    }
}


function arrangeCanvas(){
    // controls.enableRotate = false;
    // controls.enableZoom = false;
    // controls.enablePan = false;
    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 10000);
    camera.position.z = 0;
    camera.position.y = 50;
    camera.lookAt(new THREE.Vector3(0, 1, 0));
}
//document.getElementById('arrangeCanvas').addEventListener('click', arrangeCanvas, false);

//Function to downlaod image to user workspace
function download() {
    var dt = canvas.toDataURL('image/jpeg');
    this.href = dt;
}
//document.getElementById('download').addEventListener('click', download, false);

// $("input").change(function(e) {

//     var c = document.getElementById("canvas");
//     var ctx = c.getContext("2d");
//     // for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {

//     //     var file = e.originalEvent.srcElement.files[i];

//     //     var img = document.createElement("img");
//     //     var reader = new FileReader();
//     //     reader.onloadend = function() {
//     //          img.src = reader.result;
//     //     }
//     //     reader.readAsDataURL(file);
//     //     $("input").after(img);
//     // }


// });

let onDragOver=function(e){
    e.preventDefault();
 }
 let onDrop=function(e){
     e.preventDefault();
     let self=e.target;
     if (e.dataTransfer.files.length == 0)
         return false;
     let file = e.dataTransfer.files[0];
     let reader = new FileReader();
     reader.onload = function(ev)
     {
             let img = new Image();
         img.src = ev.target.result;
         img.onload = function(){
             self.width = img.width;
             self.height = img.height;
             self.getContext("2d").drawImage(img, 0, 0, self.width,     self.height);
         };
     };
     reader.readAsDataURL(file);
 }


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
        }, 100);
    }, true);

    function HasMouseStopped(evt) {

        var mousePos = getMousePos(canvas, evt);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        // Math.round to get rid of long decimal place
        xCordMouse = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        yCordMouse = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
       //console.log('x: ' + xCordMouse + ' y: ' + yCordMouse);

    }


    // document.getElementById("mouseRotate").checked = true;
    // mouseAction = ROTATE;
    //document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    // document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    
    document.getElementById("mouseAddHome").checked = true;
    mouseAction = ADD_HOME;
    document.getElementById("mouseAddHome").onchange = doChangeMouseAction;
    // document.getElementById("mouseAddNode").onchange = doChangeMouseAction;
    document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    document.getElementById("mouseAddMachine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLine").onchange = doChangeMouseAction;
    document.getElementById("mouseAddLineHor").onchange = doChangeMouseAction;
    document.getElementById("mouseDelete").onchange = doChangeMouseAction;
    document.getElementById("mouseSelectFinish").onchange = doChangeMouseAction;
    document.getElementById("mouseSelectNode").onchange = doChangeMouseAction;
    // document.getElementById("mouseImage").onchange = doChangeMouseAction;
    createScene();

    setUpMouseHander(canvas, doMouseDown, doMouseMove);
    setUpTouchHander(canvas, doMouseDown, doMouseMove);
    raycaster = new THREE.Raycaster();
    render();

    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 1;
    //Disable right click movement to center pixel co-ords
    controls.enablePan = false;
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
    camera.position.z = 0;
    camera.position.y = 50;

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

    var geometry = new THREE.BoxBufferGeometry(150, 150, 150);
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xA9A9A9 }));
    scene.add(line);

    targetForDragging = new THREE.Mesh(
        new THREE.BoxGeometry(20, 25, 20),
        new THREE.MeshBasicMaterial({ color: "red" })
    );

    targetForDragging.material.visible = true;

    //Geometry for node
    cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.8),
        new THREE.MeshLambertMaterial({ color: "green" })
    );
    cylinder.position.y = 0.01; // places base at y = 0;

    //Geometry for machine
    var geometry2 = new THREE.BoxGeometry(3, 0.6, 3);
    var material = new THREE.MeshBasicMaterial({ color: "blue" });
    cube = new THREE.Mesh(geometry2, material);
    cube.position.y = 0.01;

    //Geometry for home
    var geometry5 = new THREE.BoxGeometry(3, 0.6, 3);
    var material4 = new THREE.MeshBasicMaterial({ color: "red" });
    home = new THREE.Mesh(geometry5, material4);
    home.position.y = 0.01;

    var col_gray = new THREE.Color("rgb(75, 0, 130)");
    // var col_gray = new THREE.Color("rgb(75, 0, 130)");

    //Geometry for path
    var geometry3 = new THREE.BoxGeometry(0.8, 0.8, 6);
    var material2 = new THREE.MeshBasicMaterial({ color: col_gray });
    line_vert = new THREE.Mesh(geometry3, material2);
    line_vert.position.y = 0.01;

    var geometry4 = new THREE.BoxGeometry(6, 0.8, 0.8);
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
    // if (mouseAction == ROTATE) {
    //     return true;
    // }
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
        case ROTATE:
            // if (mouseAction == ROTATE) {
                console.log('ROTATE');
                controls = new THREE.OrbitControls(camera, canvas);
                controls.enableRotate = true;
                controls.enableZoom = true;
                controls.rotateSpeed = 0.2;
                controls.zoomSpeed = 1;
                controls.keyPanSpeed = 0.8;
                //Disable right click movement to center pixel co-ords
                controls.enablePan = true;
                controls.addEventListener('change', render, renderer.domElement);
                controls.update();
           
        return false;

        case ADD_NODE:
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ = intersect.point.z;
                coords_node = new THREE.Vector3(locationX, 0, locationZ);
                addNode(coords_node.x, coords_node.z);
                xCordNode = xCordMouse;
                yCordNode = yCordMouse;


                console.log("Node at: " + xCordNode, yCordNode);
                render();
            }
            return false;
        case ADD_MACHINE:
            controls.enabled = false;
            if (objectHit == grid || objectHit == gridWithDiagonals2) {

                var locationX1 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ1 = intersect.point.z;

                //Adding Machine at point of intersection
                coords_machine = new THREE.Vector3(locationX1, 0, locationZ1);
                addMachine(coords_machine.x, coords_machine.z);
                
                //Saving co-ordinates of where machine is placed
                xCordMachine = xCordMouse;
                yCordMachine = yCordMouse;
                finishCoords = [xCordMachine, yCordMachine];
                //console.log("Machine at: " + xCordMachine, yCordMachine);

                node_counter++;
                storeCoordinate(node_counter, xCordMachine, yCordMachine, node_loc);
                console.log("Stored node",node_loc[node_counter].p, ": ",node_loc[node_counter].x, node_loc[node_counter].y)
                //route.addNode('A', )
                //graph.addNode(node_counter)

                //stringifying finsihCoords to send to "server"
                myJSON_Machine= JSON.stringify(finishCoords);
              //  console.log('JSON Machine coords: ' + myJSON_Machine);

                //storeDataMachine();
                render();
            }

            return false;
        case ADD_HOME:
            
            controls.enabled = false;
            // controls.enableRotate = false;
            if (objectHit == grid || objectHit == gridWithDiagonals2) {
                var locationX5 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ5 = intersect.point.z;

                //Adding Home at point of intersection
                coords_home = new THREE.Vector3(locationX5, 0, locationZ5);
                addHome(coords_home.x, coords_home.z);             
                
                //Saving co-ordinates of where home is placed
                xCordHome = xCordMouse;
                yCordHome = yCordMouse;
                startCoords = [xCordHome, yCordHome];              
                //console.log("Home at: " + xCordHome, yCordHome);

                node_counter++;
                storeCoordinate(node_counter, xCordHome, yCordHome, node_loc);
                console.log("Stored node",node_loc[node_counter].p, ": ",node_loc[node_counter].x, node_loc[node_counter].y)
              


                //stringifying finsihCoords to send to "server"
                myJSON_Home = JSON.stringify(startCoords);
               // console.log('JSON Home coords: ' + myJSON_Home);

                //storeDataHome();
                render();

            }
            return false;
        case ADD_LINE:
            controls.enabled = false;
            if (objectHit == grid || objectHit == gridWithDiagonals2) {
                var locationX2 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ2 = intersect.point.z;
                var coords2 = new THREE.Vector3(locationX2, 0, locationZ2);
                addLine(coords2.x, coords2.z);
                render();
            }
            return false;
        case ADD_LINE_HOR:
            controls.enabled = false;
            if (objectHit == grid) {
                var locationX3 = intersect.point.x; // Gives the point of intersection in world coords
                var locationZ3 = intersect.point.z;
                var coords3 = new THREE.Vector3(locationX3, 0, locationZ3);
                addLineHor(coords3.x, coords3.z);
                render();
            }
            return false;

        case SELECT_FINISH:
            controls.enabled = false;
            //Detecting where user wants robot to finish
            finishCoords = [xCordMouse, yCordMouse];
            console.log("Finish coords at " + finishCoords);

            for (var j = 0; j < node_loc.length; j++) { 
                if (((Math.abs(xCordMouse - node_loc[j].x )) <= 20 ) && ((Math.abs(yCordMouse - node_loc[j].y )) <= 20)) {
                    console.log(((xCordMouse - node_loc[j].x)), (Math.abs(yCordMouse - node_loc[j].y)));
                    console.log("found finish", j ,"at", node_loc[j].x, node_loc[j].y);
                    finish = j;
                }
            }

            // for (var i = 0; i < node_loc.length; i++) {
            //     for (var j = 0; j < node_loc.length; j++) {
            //         if (node_loc[j].p ) {
                        
            //         }
            //     }
            // }

            return false;
    
        case SELECT_NODE:

            controls.enabled = false;
            //Detecting where user wants robot to finish
            nodeCoords = [xCordMouse, yCordMouse];
            console.log("SELECT AT " + nodeCoords);

            if (((Math.abs(xCordMouse - node_loc[0].x) <= 10)) && ((Math.abs(yCordMouse - node_loc[0].y) <= 10)) && testflag!= true) {
                console.log("found home at", node_loc[0].x, node_loc[0].y);
                weight_x = node_loc[0].x - node_loc[node_loc.length-1].x;
                weight_y = node_loc[0].y - node_loc[node_loc.length-1].y;

                //if-conditions to cancel out errors
                if ((weight_x <= 10 && weight_x >=0) || (weight_x >= -10 && weight_x <=0)) {
                    weight_x = 0;
                }
                if ((weight_y <= 10 && weight_y >=0) || (weight_y >= -10 && weight_y <=0)) {
                    weight_y = 0;
                }

                graph.addEdge(node_loc.length-1, 0);
                console.log('ADDED EDGE', node_loc.length-1, 0)
                edgeWeight = [node_loc.length-1, 0];
                storeWeight(edgeWeight, weight_x, weight_y, node_weight);

                // s = String.fromCharCode(c);
                // c = new Map()
                // c.set (String.fromCharCode(C+1), weights_total[j]);
                // route.addNode(String.fromCharCode(C), c);
                // c++;
                // C++;
                testflag = true;
            }

            go:
            if (testflag != true) {   
                for (var j = 1; j < node_loc.length-1; j++) { 
                    if (((Math.abs(xCordMouse - node_loc[j].x )) <= 10 ) && ((Math.abs(yCordMouse - node_loc[j].y )) <= 10)) {
                        console.log(((xCordMouse - node_loc[j].x)), (Math.abs(yCordMouse - node_loc[j].y)));
                        console.log((xCordMouse - node_loc[j].x <= 10));
                        console.log("found coord", j ,"at", node_loc[j].x, node_loc[j].y);
                        weight_x = node_loc[node_loc.length-1].x - node_loc[j].x;
                        weight_y = node_loc[node_loc.length-1].y - node_loc[j].y;

                        //if-conditions to cancel out errors
                        if ((weight_x <= 10 && weight_x >=0) || (weight_x >= -10 && weight_x <=0)) {
                            weight_x = 0;
                        }
                        if ((weight_y <= 10 && weight_y >=0) || (weight_y >= -10 && weight_y <=0)) {
                            weight_y = 0;
                        }
                        //find absolute total weight
                         weights_total[j] = Math.abs(weight_x) + Math.abs(weight_y);

                         
                        //graph.addEdge(j, node_counter);
                        console.log('ADDED EDGE test', j, node_counter)
                        edgeWeight = [j, node_counter]; // [0, 1]
                        graph.addEdge(j, node_counter)
                        storeWeight(edgeWeight, weight_x, weight_y, node_weight);
                        
                        break go;
                    }
                }
            }
        //    }
            for (var j = 0; j < node_loc.length - 1; j++) {
                console.log(node_loc.length)
            //    console.log("E", node_weight[j].e, ":", "x:", node_weight[j].x, "y:", node_weight[j].y);
                // if (generateGraph_count != 0) {
                //     graph.addEdge(enode_weight[j].e);
                //     console.log(graph.edges);
                // }
                console.log(j);
                weights_total[j] = Math.abs(node_weight[j].x) + Math.abs(node_weight[j].y);
                console.log("weightstotal", weights_total[j])
                graph.update(j, {weight: weights_total[j]})
            }


            console.log(graph.nodes);
            console.log(graph.edgeCount, "edges");
            
            //console.log("Total W:", JSON.stringify(weights_total));
        return false;    

        case DELETE:
            controls.enabled = false;
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

    } 
}

function doChangeMouseAction() {
     if (document.getElementById("mouseRotate").checked) {
         console.log('ROTATE1');
        mouseAction = ROTATE;
    }
    else if (document.getElementById("mouseAddMachine").checked) {
        mouseAction = ADD_MACHINE;
          controls.enabled = false;
    } 
    // else if (document.getElementById("mouseAddNode").checked) {
    //     mouseAction = ADD_NODE;
    //       controls.enabled = false;
    // }
    else if (document.getElementById("mouseAddLine").checked) {
        mouseAction = ADD_LINE;
          controls.enabled = false;
    } else if (document.getElementById("mouseAddLineHor").checked) {
        mouseAction = ADD_LINE_HOR;
         controls.enabled = false;
    } else if (document.getElementById("mouseAddHome").checked) {
          controls.enabled = false;
        mouseAction = ADD_HOME;
    }
    else if (document.getElementById("mouseSelectFinish").checked) {
         controls.enabled = false;
        mouseAction = SELECT_FINISH;
    }
    else if (document.getElementById("mouseSelectNode").checked) {
        controls.enabled = false;
       mouseAction = SELECT_NODE;
   }
    else if (document.getElementById("mouseDelete").checked) {
          controls.enabled = false;
        mouseAction = DELETE;
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

//Function to receive user input and send via bluetooth
function validate(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    //var regex = /^[FLR]/;
    //if (!regex.test(key))
    //{



     //   theEvent.returnValue = false;

     //   if (theEvent.preventDefault)
     //       theEvent.preventDefault();
     //}
     //else {
          
        if (key == 'F'){
            btSerial.write(new Buffer('F', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
        }   
        if (key == '-'){
            btSerial.write(new Buffer('-', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
        }   
            
         if (key == 'L'){
            btSerial.write(new Buffer('L', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
         }
         if (key == 'R'){
            btSerial.write(new Buffer('R', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
         }
         if (key == 'E'){
            btSerial.write(new Buffer('E', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
        }
        if (key == '+'){
            btSerial.write(new Buffer('+', 'utf-8'), function(err, bytesWritten) {
                console.log(key);
                if (err) console.log(err);
            });
        }
        
    }
     //}    
