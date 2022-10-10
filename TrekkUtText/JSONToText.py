from sys import implementation
import sys

import json
import os

result = []

def getData():
    with open(sys.argv[2], 'r') as f:
        result = json.load(f)
        return result


def writeToFile(data):
    with open(sys.argv[3], 'w') as f:
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

if __name__ == '__main__':
    main()
