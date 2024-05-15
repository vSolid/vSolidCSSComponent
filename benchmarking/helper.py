import os

def backup_files(file_paths):
    # Dictionary to hold the original contents of the files
    file_contents = {}

    # Read and store the original contents of each file
    for file_path in file_paths:
        with open(file_path, 'r') as file:
            file_contents[file_path] = file.read()

    return file_contents

def restore_files(file_contents):
    # Restore the original contents of the files
    for file_path, content in file_contents.items():
        with open(file_path, 'w') as file:
            file.write(content)
