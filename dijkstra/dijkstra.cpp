#include <iostream>
#include <vector>
#include <fstream>
#include <string>

using namespace std;

//Declare an input and output file stream (ifstream) (ofstream) variable.
ofstream outFile;
ifstream inFile;

int N;				//number of nodes
int a, b, w;			//Node a to Node b and weight w
int node_matrix[10][10];	//2D node matrix
int path_matrix[10][10];	//2D matrix to store paths
int distances[10];		//1-D array distance
int visited[10];		//Set initally to 0
int finish_node;
int print_node;

vector<int> extracted_path;
vector<vector<int>> all_paths(7, vector<int>(10));

void writeFile() {
	int nodes;
	//int input;
	int input_count = 0;

	//outFile.open("C:\\Users\\Marka\\Desktop\\dijkstra3");
	outFile.open("C:\\Users\\ryanr\\Desktop\\dijkstra3.txt");

	if (outFile.is_open())
	{
		cout << "Enter Number of nodes present. Enter '0' to exit: "  << endl;
		cin >>  nodes;
		outFile << nodes << endl;

		
		cout << endl << "Enter correct input type to describe map (1 2 30): " << endl;

		for (int input;  cin >> input;) {
			
			if (input == 0) {
				break;
			}

			input_count++;

			outFile << input << " ";

			if (input_count % 3 ==  0) {
				outFile << endl;
			}
		}
		cout << endl;
	}
	else {
		cout << "Unable to open file\n" << endl;
		cout << errno;
	}
	outFile.close();
}

void readFile() {
	//Open the file stream. Path names in MS Windows use backslashes (\). Because the backslash is also the string escape character, 
	//it must be doubled. If the full path is not given, most systems will look in the directory that contains the object program.

	//inFile.open("C:\\Users\\Marka\\Desktop\\dijkstra3");
	inFile.open("C:\\Users\\ryanr\\Desktop\\dijkstra3.txt");

	//Check that the file was opened.For example, the open fails if the file doesn't exist, or if it can't be read 
	//because another program is writing it.A failure can be detected with code like that below using the !(logical not) operator
	 if (!inFile) {
	 	cerr << "Unable to open file \n";
	 	cout << errno;		//call errno to give more insight reagrding the error
	 	exit(1);		// call system to stop
	 }

	//reading number of nodes
	inFile >> N;

	//for all nodes fill in node_matrix and set to -1
	for (int i = 0; i <= N; i++) {
		for (int j = 0; j <= N; j++) {
			node_matrix[i][j] = -1;	//setting all to -1 meaning there is no connection between nodes
			path_matrix[i][j] = 0;	//no path establsihed.
		}
	}

	//initializing distance
	for (int i = 0; i <= N; i++) {
		distances[i] = -1;	//setting distance to -1 (or infinity)
	}

	//initializing root
	distances[1] = 0;		//distance of 1 set to 0

	while (!inFile.eof()) {	//reading till end of file 
		inFile >> a >> b >> w;
		node_matrix[a][b] = w;		//updating matrix
									//this line is vital for correct functionality.
									//make sure to update both paths TO and FROM each node
		node_matrix[b][a] = w;
	}
}

int dijkstra(int x) {
//dijkstra function. gets current node

	visited[x] = 1;		//sets current node as visited, marked as 1. They were all 0 before

						//updates the nodes
	for (int i = 1; i <= N; i++) {		//for all the nodes 
										//check if they are not visited and they are connected
		if ((visited[i] == 0) && (node_matrix[x][i] != -1)) {
			//if distancefrom node 1 (0) + distance in node matrix of node + next node is less than the distance in the distances array then this is the new shortest path, update
			//OR if distance in array distance is -1, update aswell. This will be true for the first round.
			if ((distances[x] + node_matrix[x][i] < distances[i]) || (distances[i] == -1)) {
				distances[i] = distances[x] + node_matrix[x][i];		//update i
				//here we are storing shortest path.
				//the for loop goes through the columns setting all longer distances to 0, therefore we are left only with the node with the shortest distance
				for (int j = 1; j <= N; j++) {
					path_matrix[j][i] = 0;
				}
				//update node with shortest distance
				path_matrix[x][i] = i;
			}
		}
	}

	//after updating all the nodes, we are going to select a new node
	int new_node = -1, smaller_weight = -1;
	//for all the nodes, going to check which will be the next node
	for (int i = 0; i <= N; i++) {
		//node should not be visited and the distance should be greater than 0. smaller_weight should be bigger than current distance or else equal to -1
		if ((visited[i] == 0) && (distances[i] >= 0) && ((smaller_weight > distances[i]) || (smaller_weight == -1))) {
			smaller_weight = distances[i];	//distance from node 1 to 2 is now the smallest weight
			new_node = i;					//new node is now 4
		}
	}

	if (new_node != -1) {
		dijkstra(new_node); //run dijkstra function with new node. First run new node will be 4
		return 0;
	}

	//output
	for (int i = 1; i <= N; i++) {
		cout << "Distance from Node 1 to Node " << i << " is: " << distances[i] << endl;
	}

	return 0;
}

void printPaths() {
//This function needs to be improved. I am merely printing the paths and not saving them in any way. These paths need to be stored separately, but permanently
//during the running of the program, such that the robot may have access to them at any moment.

	int clear_count = 0;
	all_paths[0].clear();
	all_paths[0].push_back(1);

	//extracting shortest paths from path_matrix
	
	int preservedNodeState = 0;
	for (int searchNodePath = N; searchNodePath >= 1; searchNodePath--) { //rows
		for (int col_path = N; col_path >= 1; col_path--) {
			if (path_matrix[searchNodePath][col_path] != 0) {

				extracted_path.push_back(path_matrix[searchNodePath][col_path]);
				extracted_path.push_back(searchNodePath);

				//save the searchNodePath row we are currently on as we will be altering this in the following loop.
				preservedNodeState = searchNodePath;

				for (int row_previousNode = N; row_previousNode >= 1; row_previousNode--) {
					for (int col_path2 = N; col_path2 >= 1; col_path2--) {
						if (path_matrix[row_previousNode][col_path2] == searchNodePath) {
							extracted_path.push_back(row_previousNode);
							//in order to keep on searching through the path matrix
							searchNodePath = row_previousNode; //set row_previousNode which is the previous node in the path to row_searchnodePath which we are looking for
							row_previousNode = N; //reset row_node2 to number of nodes present, to start search from beginning
							col_path2 = N; //reset col_path2 to number of nodes present, to start search from beginning
						}
					}
				}

				//reversing path vector to start from node 1.
				reverse(extracted_path.begin(), extracted_path.end());
				finish_node = extracted_path.back();

				if (finish_node == 2) {
					all_paths[finish_node - 1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}
				if (finish_node == 3) {
					all_paths[finish_node - 1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}
				if (finish_node == 4) {
					all_paths[finish_node - 1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}
				if (finish_node == 5) {
					all_paths[finish_node - 1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}
				if (finish_node == 6) {
					all_paths[finish_node - 1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}
				if (finish_node == 7) {
					all_paths[finish_node -1].clear();
					for (int i = 0; i < extracted_path.size(); i++) {
						all_paths[finish_node - 1].push_back(extracted_path[i]);
					}
				}

				//.clear() removes all elements of the current path, since we are now starting a new path			
				extracted_path.clear();
				clear_count++;
				//the searchNodePath which was altered, now retains its value in the original pathMatrix
				searchNodePath = preservedNodeState;
			}
		}
	}

	cout << endl;
	for (int i = 0; i < all_paths.size(); ++i)
	{
		for (int j = 0; j < all_paths[i].size(); ++j)
		{
			cout << all_paths[i][j];
		}
		cout <<endl;
	}
	cout << endl;
}

int main() {

	writeFile();

	//reading from file and setting matrices accordingly
	readFile();

	//running dijkstra function
	dijkstra(1);

	//function to print paths
	printPaths();

	cout << "Enter node to print path to that node: " << endl;
	//cin >> print_node;

	while (cin >> print_node)
	{
		for (int i = 0; i < all_paths[print_node - 1].size(); ++i)
		{
				cout << all_paths[print_node - 1][i];	
		}
		cout << endl;
	}
}

