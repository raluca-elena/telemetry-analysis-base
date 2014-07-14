#!/usr/bin/python

import os
import sys
import logging
logging.basicConfig(filename='python-helper-reducer.log',level=logging.DEBUG)

print "args: ", sys.argv
command = sys.argv[1]
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
sys.path.append(os.path.abspath("/home/worker"))
reducer = __import__(command)

result = open('result.txt', 'w+')
lines = []
for line in sys.stdin:
    file_name = line.strip()
    current_file = open(file_name, 'r')
    #if any empty lines remove them
    current_lines = [line for line in current_file if line.strip()]
    current_file.close()
    lines.extend(current_lines)
    print "file sent to reducer ", file_name

def groupByKey(lines):
    d={}
    for l in lines:
        key = l.split(" ")[0]
        val = l.split(" ")[1]
        if key in d:
            print 'key is', key
            d[key].append(val)
        else:
            d[key]=[val]
    return d 
d = groupByKey(lines)
for k, v in d.iteritems():
     result.write(reducer.reduce(k, v) + "\n")

result.close()


