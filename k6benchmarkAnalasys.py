import os
import pandas as pd


def getFileNames():
    files=[]
    
    for f in os.listdir("./benchmarkResults"):
        f.endswith(".csv")
        files.append(f)

    return files
    
def processFile(fileName):

    print(f"Processing file: {fileName}")

    with open(f"./benchmarkResults/{fileName}", "r") as file:
        df = pd.read_csv(file, sep=",")
        
        ## Convert Unix timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')

        # Filter to include only http_req_duration metrics
        duration_data = df[df['metric_name'] == 'http_req_duration']
        # Calculate the average duration of HTTP requests
        average_duration = duration_data['metric_value'].mean()
        print(f"Average Duration of HTTP Requests: {average_duration} ms")

        # Calculate requests per second
        # First, count the number of requests per unique timestamp
        rps_data = duration_data.groupby('timestamp').size()

        # Calculate the rate of requests per second (assuming your timestamps are in seconds)
        rps = rps_data.mean()
        print(f"Average Requests per Second: {rps}")


for fileName in getFileNames():
    processFile(fileName)