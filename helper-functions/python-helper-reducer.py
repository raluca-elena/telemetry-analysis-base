#!/usr/bin/python

import os
import sys
import logging
logging.basicConfig(filename='python-helper-reducer.log',level=logging.DEBUG)

print "args: ", sys.argv
command = sys.argv[1]
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
#sys.path.append(os.path.abspath("/home/worker"))
reducer = __import__(command)

result = open('reducerResult.txt', 'w+')
lines = []
for line in sys.stdin:
    file = line.strip()
    f = open(file, 'r')
    lines1 = [line for line in f if line.strip()]
    f.close()
    lines.extend(lines1)
    print "file sent to reducer ", file

dict = {}
for l in lines:
    key = l.split(" ")[0]
    val = l.split(" ")[1]
    if key in dict:
        dict[key].append(val)
    else:
        dict[key]=[val]
    print dict

for k, v in dict.iteritems():
    result.write(reducer.reduce(k, v) + "\n")
result.close()


