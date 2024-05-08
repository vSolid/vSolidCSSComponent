import os
import pandas as pd


def getFileNames():
    files=[]
    
    for f in os.listdir("./benchmarkResults"):
        f.endswith(".csv")
        files.append(f)

    return files
    
def processFile(fileName) -> dict[str, (str | dict[str,float])]: 

    print(f"Processing file: {fileName}")

    with open(f"./benchmarkResults/{fileName}", "r") as file:
        df = pd.read_csv(file, sep=",")
        
        ## Convert Unix timestamp to datetime
        #df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')

        # Convert timestamp to datetime if necessary
        #df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')

        # Data sent and received should be summed and converted from bytes to appropriate units
        data_sent = df[df['metric_name'] == 'data_sent']['metric_value'].sum() / 1024  # Convert to kB
        data_received = df[df['metric_name'] == 'data_received']['metric_value'].sum() / (1024 * 1024)  # Convert to MB

        # Calculate summaries for various metrics
        request_durations = df[df['metric_name'] == 'http_req_duration']['metric_value']
        http_req_duration_summary = metric_summary(request_durations)

        # Calculate Requests per Second
        rps = metric_summary(df[df['metric_name'] == 'http_reqs']['timestamp'], rate=True)

        # Output formatted results
        # print(f"data_received..................: {data_received:.2f} MB")
        # print(f"data_sent......................: {data_sent:.2f} kB")
        # print(f"http_req_duration..............: {http_req_duration_summary}")
        # print(f"http_reqs......................: {rps}")

        return {
            "key": fileName,
            "data_received": data_received,
            "data_sent": data_sent,
            "http_req_duration": http_req_duration_summary,
            "rps": rps
        }



def metric_summary(series: pd.Series, unit='ms', rate=False):
    """Calculates required summary statistics for a given pandas Series."""
    if not rate:
        # summary = {
        #     'avg': series.mean(),
        #     'min': series.min(),
        #     'med': series.median(),
        #     'max': series.max(),
        #     'p(90)': series.quantile(0.90),
        #     'p(95)': series.quantile(0.95)
        # }
        summary = series.mean()
    else:  # For rates, calculate per second

        total_time_seconds = (series.max() - series.min())
        if total_time_seconds > 0:
            rate_value = len(series) / total_time_seconds
        else:
            rate_value = 0
        # summary = f"{rate_value:.6f}/s".format(rate_value)
        summary = rate_value

    return summary

def printSummary(summary: dict[str,float]):
    print(f"Summary for {summary['key']}")
    print(f"data_received..................: {summary['data_received']:.2f} MB")
    print(f"data_sent......................: {summary['data_sent']:.2f} kB")
    print(f"http_req_duration..............: {summary['http_req_duration']}")
    # print(f"http_reqs......................: {summary['http_reqs']['avg']}")
    print(f"rps............................: {summary['rps']:.6f}/s")
    print("")

def performAnalysis(summaries: list[dict[str,str]], metric = "rps", optimize= "max", print_summary = True ):
    """Metric: Requests per second -> optimize for maximum"""
    winner = max(summaries, key=lambda x: x[metric]) if optimize == "max" else min(summaries, key=lambda x: x[metric])
    print(f"Winner by {metric}:")
    if print_summary: 
        printSummary(winner)
    else:
        print(winner["key"])    
    for summ in summaries:
        if summ == winner: continue
        percent_diff = abs(winner[metric] - summ[metric]) / winner[metric] * 100
        print(f"{percent_diff:.2f}% worse than winner by {metric}:")
        if print_summary: 
            printSummary(summ)
        else:
            print(summ["key"])
    return


summaries = []
for fileName in getFileNames():
    summaries.append(processFile(fileName))
print(f"processed {len(summaries)} files"  )
performAnalysis(summaries, "rps", "max", True)
performAnalysis(summaries, "http_req_duration", "min", False)