from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

nodes_edges_data = {}
functionalities_data = []  # List to store functionalities data

@app.route('/store-nodes-edges', methods=['POST'])
def store_nodes_edges():
    global nodes_edges_data
    data = request.json
    nodes_edges_data = data
    nodes_data = data.get('nodes', [])
    print("Nodes data:")
    for node in nodes_data:
        print(node)  # Display each node's data in the terminal
    return jsonify({"message": "Data stored successfully"}), 200

@app.route('/append-functionalities', methods=['POST'])
def append_functionalities():
    global functionalities_data
    data = request.json
    functionalities_data.append(data)
    #print(f"Appended data: {data}")  # Log the appended data to the terminal
    return jsonify({"message": "Functionality appended successfully"}), 200

@app.route('/get-functionalities', methods=['GET'])
def get_functionalities():
    return jsonify(functionalities_data), 200

if __name__ == '__main__':
    app.run(debug=True)
