#!/usr/bin/python
def reduce(k, v):
    count = 0
    for i in v:
        count+= int(i)
    return str(k) + " " + str(count)
