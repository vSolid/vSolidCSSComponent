#!/bin/bash

# Constants
benchmarkRoot="./k6/"

# Dictionary equivalent in Bash using associative array
declare -A benchmarks
benchmarks["js/init.js"]="DefaultSetup"
benchmarks["js/other.js"]="DefaultSetup"

# Function to run a benchmark
run_benchmark() {
    benchmarkName=$1
    setup=${benchmarks[$benchmarkName]}

    if [ -z "$setup" ]; then
        echo "Benchmark '$benchmarkName' not found."
        return
    fi

    # Construct the command for running the benchmark
    fullPath=$(realpath "$benchmarkRoot/$benchmarkName")
    command="k6 run $fullPath --out csv=bencherResults.csv"
    echo "Running command: $command"

    # Execute the benchmark
    $command
    echo "Benchmark completed."

}

# Start the node process with output redirection to server.log
echo "Starting node server..."
npm run startNoBuild > server.log 2>&1 &
nodePID=$!

echo "Node server started with PID: $nodePID"    
sleep 2  # give some time to start up


# Wait for server to be ready by monitoring server.log
echo "Checking for server readiness..."
while ! grep -q "Listening to server at http://localhost:3000/" server.log; do
    echo "Waiting for server to start..."
    sleep 1
    # Ensure latest data is being read
    tail -n 10 server.log > /tmp/latest_server_log
done
echo "SERVER READY"

# Loop over benchmarks and run them
for bench in "${!benchmarks[@]}"; do
    run_benchmark "$bench"
done

PORT_NUMBER=3000
lsof -i tcp:${PORT_NUMBER} | awk 'NR!=1 {print $2}' | xargs kill 
echo "Benchmark completed and node server stopped."

