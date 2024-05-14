# Makefile for RDF Triple Generator

CXX = g++
CXXFLAGS = -O3 -std=c++11

TARGET = rdf_generator
SRC = rdf_generator.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)

.PHONY: all clean
