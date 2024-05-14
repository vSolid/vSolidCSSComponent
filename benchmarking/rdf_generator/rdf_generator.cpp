#include <iostream>
#include <fstream>
#include <string>
#include <chrono>

// Function to generate a single RDF triple in TTL format
std::string generate_triple(int id) {
    return "<http://localhost:3000/test/long#" + std::to_string(id) + "> " +
           "<http://example.org/predicate" + std::to_string(id) + "> " +
           "<http://example.org/object" + std::to_string(id) + "> .\n";
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <number_of_triples> <output_file>\n";
        return 1;
    }

    int num_triples = std::stoi(argv[1]);
    std::string output_file = argv[2];

    std::ofstream out(output_file, std::ios::out | std::ios::binary);
    if (!out.is_open()) {
        std::cerr << "Error opening file: " << output_file << "\n";
        return 1;
    }

    auto start_time = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < num_triples; ++i) {
        out << generate_triple(i);
    }

    out.close();

    auto end_time = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end_time - start_time;

    std::cout << "Generated " << num_triples << " triples in " << elapsed.count() << " seconds.\n";

    return 0;
}