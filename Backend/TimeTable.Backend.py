from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS library
from uuid import uuid4
import json
import time
import subprocess

# Initialize the Flask application.
app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# --- In-Memory Data Storage (Temporary "Database") ---
# In a real-world application, this data would be stored in a database.
# We use a dictionary to simulate this for demonstration purposes.
timetables = {}

# --- Helper function to simulate the ML Model's behavior ---
def run_ml_model(input_data):
    """
    Executes the C++ machine learning model for timetable generation.
    It passes the input data as a JSON string to the C++ program's stdin
    and reads the generated timetable data from its stdout.
    """
    print("Executing C++ model to generate timetable...")
    
    # Define the path to the compiled C++ executable
    # NOTE: This assumes the executable is named 'timetable_generator' and is in the same directory.
    cpp_executable = "../Model/timetable_generator"
    
    # Serialize the input data to a JSON string
    input_json = json.dumps(input_data)

    try:
        # Use subprocess to run the C++ executable
        # The 'input' argument sends data to the program's stdin
        # The 'capture_output=True' captures the program's stdout and stderr
        # 'text=True' decodes the output as text
        result = subprocess.run(
            [cpp_executable],
            input=input_json,
            capture_output=True,
            text=True,
            check=True  # This will raise a CalledProcessError if the C++ program returns a non-zero exit code
        )

        # The output from the C++ program's stdout is stored in result.stdout
        output_json = result.stdout
        
        # Parse the JSON output back into a Python dictionary
        generated_timetables = json.loads(output_json)
        
        print("Successfully received data from C++ model.")
        return generated_timetables
        
    except FileNotFoundError:
        print(f"Error: C++ executable not found at '{cpp_executable}'")
        raise
    except subprocess.CalledProcessError as e:
        print(f"Error: C++ program failed with exit code {e.returncode}")
        print("Stderr:", e.stderr)
        raise
    except json.JSONDecodeError:
        print("Error: Failed to decode JSON output from C++ program.")
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise

# --- API Endpoints ---

@app.route('/api/schedule/generate', methods=['POST'])
def generate_timetable():
    """
    API endpoint to trigger the timetable generation with the new schema.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON input. Please provide a request body."}), 400

        generated_timetables = run_ml_model(data)

        timetable_ids = []
        for timetable in generated_timetables:
            timetable_id = str(uuid4())
            timetables[timetable_id] = timetable
            timetable_ids.append(timetable_id)

        print(f"Timetables generated and stored with IDs: {timetable_ids}")

        return jsonify({
            "success": "Timetables generated successfully.",
            "timetable_ids": timetable_ids
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedule/view/<timetable_id>', methods=['GET'])
def get_timetable(timetable_id):
    """
    API endpoint to retrieve a specific timetable by its ID.
    """
    print(f"Received request for timetable ID: {timetable_id}")
    timetable = timetables.get(timetable_id)
    if timetable:
        print(f"Found timetable for ID: {timetable_id}")
        return jsonify(timetable), 200
    else:
        print(f"Timetable not found for ID: {timetable_id}")
        return jsonify({"error": "Timetable not found."}), 404




# --- Application Runner ---
if __name__ == '__main__':
    # Run the Flask app in debug mode, binding to all interfaces.
    app.run(host='0.0.0.0', debug=True, port=5001)
