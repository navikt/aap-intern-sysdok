from sys import implementation
import sys

import json
import os

result = []

def getData():
    with open(sys.argv[1], 'r') as f:
        result = json.load(f)
        return result


def writeToFile(data):
    with open(sys.argv[2], 'w') as f:
        for x in data:
            f.write(x)
            f.write('\n')

def printData(data):
    if type(data) == type({}):
        for x,y in data.items():
            printData(y)
    else:
        result.append(data)

def main():
    data = getData()
    k=type(data)
    for x,y in data.items():
        printData(y)

    writeToFile(result)


main()
