from JSONToText import getData
import json
import sys

def getText():
    texts = []
    with open(sys.argv[3], 'r') as f:
        for x in f.readlines():
            texts.append(x.strip())
    return texts

def changeData(data,list,currentIndex):
    for x, y in data.items():
        if type(y) == type({}):
            changeData(y, list, currentIndex)
        else:
            for key, value in data.items():
                data[key] = list[currentIndex]
                currentIndex += 1


def nyChangeData(data,list,currentIndex):
    for x, y in data.items():
        if type(y) == type({}):
            nyChangeData(y, list, currentIndex)
        else:
            y = list[currentIndex]
            currentIndex += 1


def TextToJson():
    currentIndex = 0
    data = getData()
    list=getText()
    print(list)
    k=type(data)
    nyChangeData(data, list, currentIndex)
    json.dump(data, open(sys.argv[4], 'w'), indent=2, ensure_ascii=False)

if __name__ == '__main__':
    TextToJson()