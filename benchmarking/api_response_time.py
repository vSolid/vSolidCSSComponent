import requests
import time
import json
import argparse
from statistics import mean
from tabulate import tabulate
from helper import backup_files, restore_files

def load_urls(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data['urls']

def test_api_response_times(urls, num_requests, should_backup_files=False):
    results = []
    url_num = 0


    for url_info in urls:
        url = url_info['url']
        tag = url_info['tag']
        method = url_info.get('method', "GET").upper()
        headers = url_info.get('headers', {})
        body = url_info.get('body', None)
        response_times = []
        url_num += 1

        if should_backup_files:
            resolved_url = url.replace("http://localhost:3000", "../.data")
            file_paths = [resolved_url + "$.ttl", resolved_url + ".vSolid", resolved_url + ".meta"]
            file_contents = backup_files(file_paths)

        print(f'({url_num}/{len(urls)}) {tag}')

        for i in range(num_requests):
            print(f"\rRequest {i+1}/{num_requests}", end='', flush=True)
            start_time = time.time()
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, data=body)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, data=body)
            elif method == 'PATCH':
                response = requests.patch(url, headers=headers, data=body)
            else:
                print(f"Unsupported HTTP method: {method}")
                continue
            end_time = time.time()
            response_times.append((end_time - start_time) * 1000)

        print('\n')

        avg_time = mean(response_times)
        min_time = min(response_times)
        max_time = max(response_times)

        results.append({
            'tag': tag,
            'url': url,
            'average_response_time': avg_time,
            'minimum_response_time': min_time,
            'maximum_response_time': max_time,
            'num_requests': num_requests,
        })

        if should_backup_files:
            restore_files(file_contents)

    return results

def display_results(results):
    table = [
        [
            res['tag'],
            res['url'],
            f'{res['average_response_time']:.4f}',
            f'{res['minimum_response_time']:.4f} (-{(res['average_response_time'] - res['minimum_response_time']):.4f})',
            f'{res['maximum_response_time']:.4f} (+{(res['maximum_response_time'] - res['average_response_time']):.4f})']
        for res in results
    ]
    print(tabulate(table, headers=['Tag', 'URL', 'Average Response Time (ms)', 'Minimum Response Time (ms)', 'Maximum Response Time (ms)']))

def save_results(results, file_path):
    with open(file_path, 'w') as file:
        json.dump(results, file, indent=4)

def main():
    parser = argparse.ArgumentParser(description='Test API response times.')
    parser.add_argument('input_file', type=str, help='Path to the input JSON file with URLs.')
    parser.add_argument('output_file', type=str, help='Path to the output JSON file to save results.')
    parser.add_argument('--requests', type=int, default=10, help='Number of requests to make per URL.')
    parser.add_argument('--backup-files', action=argparse.BooleanOptionalAction, default=False, help='Backup and restore files between requests.')

    args = parser.parse_args()

    urls = load_urls(args.input_file)
    results = test_api_response_times(urls, args.requests, args.backup_files)
    display_results(results)
    save_results(results, args.output_file)

if __name__ == '__main__':
    main()
