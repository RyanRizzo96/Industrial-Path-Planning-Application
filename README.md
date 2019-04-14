![map_project](https://user-images.githubusercontent.com/31866965/53907931-85ec6680-404e-11e9-874b-b79e1ab00c1e.JPG)

Application was built as part of an Engineering Project. A line-following robot capable of transporting material to machines on a shop floor. The robot is able to: Scan the shop floor for machinery. Detect obstacles in it's path.  Find the shortest route to the machine that is low on material. Allows user to enter a diagrammatic representation of the shop-floor.The application will process the image and come up with the shortest possible route. Commands sent to the robotic system allowing it to navigate to the machine.

On launching the application, the user is presented with an area to enter the map information, mainly consisting of nodes and edges. Several buttons with different functionalities were imple-mented to increase the overall functionality of the application while making it easier for the user to use.

The following are the button descriptions successfully implemented:
1.	Rotate – Allows rotating of the 3D world space.
2.	AddHome – Adds a home machine.
3.	AddMachine – Adds a node or machine.
4.	Select Finish – Selects finishing point.
5.	Select Node – Allows manual connections of nodes to form graph edges.
6.	AddLine Vert – Adds a vertical line, simply for visual purposes.
7.	AddLine Hor – Adds a horizontal line, simply for visual purposes. 
8.	Delete – Deletes nodes or lines.
9.	Generate Graph – Generates graph consisting of nodes, edges and edge weights. This but-ton must be pressed before running Dijkstra’s algorithm.
10.	Run Dijkstra – Dijkstra’s Algorithm is executed on the graph previously generated. It outputs the node numbers of the shortest route that the robot can travel.
11.	Find Path – Based on the result of Dijkstra’s algorithm it generate any of the four key words which the robot understands. These are ‘Forward’ to move forward, ‘Left’ to turn left, ‘Right’ to turn right and ‘End’ to terminate execution.


 
Figure 2 – Overview of application upon startup

![image](https://user-images.githubusercontent.com/31866965/56093002-e3809800-5ec3-11e9-8a50-73e67f1206be.png)


The user then proceeds to construct a map of the shop floor as shown in Figure 18. This is an ex-ample of a basic map with six nodes in total including the start (0) and finish node (3).


![image](https://user-images.githubusercontent.com/31866965/56093005-ee3b2d00-5ec3-11e9-8b13-669e80fce216.png)


As the user places nodes on the HTML5 canvas, whenever the mouse is clicked, the coordinates of the nodes are stored in memory to be utilised to construct a graph of the nodes, edges and edge weights. The distance from one node to another is also stored automatically.

If the user decides to request shortest path information, then Dijkstra’s Algorithm is executed and its output are the nodes that the robot has to travel to in order to get to the finish node as shown in the below figure. These are stored in an array where each array index holds a node value.

![image](https://user-images.githubusercontent.com/31866965/56093017-fa26ef00-5ec3-11e9-9af2-72b1afb985ff.png)

Once the correct nodes are displayed as the intended path for the robotic system, these are then converted into commands which the embedded C code can understand, such as ‘Forward’, ‘Left’ and ‘Right’. The below figure shows the correct path taken from node 0 to node 3. Once these commands are generated, they are sent via Bluetooth to the robotic system.


![image](https://user-images.githubusercontent.com/31866965/56093023-03b05700-5ec4-11e9-8c3c-a70c6efc25a1.png)


# electron-quick-start

**Clone and run for a quick way to see Electron in action.**

This is a minimal Electron application based on the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start) within the Electron documentation.

**Use this app along with the [Electron API Demos](http://electron.atom.io/#get-started) app for API code examples to help you get started.**

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start).

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Resources for Learning Electron

- [electron.atom.io/docs](http://electron.atom.io/docs) - all of Electron's documentation
- [electron.atom.io/community/#boilerplates](http://electron.atom.io/community/#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
