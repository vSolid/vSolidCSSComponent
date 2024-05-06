import subprocess
import os
import time

# Define the root folder for your JS and Python setup files
root_folder = './k6'

# Define a list of tuples where each tuple contains the JavaScript file and the corresponding setup Python file.
jobs = [
    ("init.js", "setupA.py"),
    ("init.js", "setupA.py"),
    ("other.js", "setupA.py")
]

def run_job(js_file, setup_file):
    # Full paths for the files
    js_path = os.path.join(root_folder, 'js', js_file)
    setup_path = os.path.join(root_folder, 'python', setup_file)

    print(f"Running setup for {js_file} using {setup_file}")
    # Run the setup Python script
    subprocess.run(['python', setup_path], check=True)

    subprocess.run(['npm', '--version'], shell=True, check=True)

    print("Running 'npm run' to build/prepare the environment")
    # Run npm to set up the environment. Ensure you're in the correct directory if needed.
    server_process = subprocess.Popen(['npm', 'run', "start"], shell=True, stdout=subprocess.DEVNULL, cwd="./")

    #should be enough time for the server to start???
    wait_for_loaded_configs(server_process.stdout)

    try:
        print(f"Executing k6 for {js_file}")
        # Run k6 with the JavaScript file
        subprocess.run(['k6', 'run', js_path, "--out", f"csv=bencherResults/{js_file}.csv"], shell=True, check=True)
        
    finally:
        print("Shutting down any active Node server")
        # Ensure Node server is fully terminated before continuing
        server_process.terminate()
        server_process.wait()

def wait_for_loaded_configs(server_output):
    if server_output is None:
        raise Exception("No output captured from the server process.")
    
    # Wait until "Loaded configs" is printed by the server
    for line in iter(server_output.readline, b''):
        line_str = line.decode('utf-8').strip()
        print(line_str)
        if "Loaded configs" in line_str:
            print("Node server is ready.")
            return


for js_file, setup_file in jobs:
    run_job(js_file, setup_file)
    print(f"Finished processing {js_file} with setup {setup_file}")
    # Pause briefly to ensure all processes have fully terminated
    time.sleep(1)

print("All jobs have been completed.")
