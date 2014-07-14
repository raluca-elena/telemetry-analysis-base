#!/usr/bin/python
'''
python-helper-reducer.py functionality:
step1: takes reducer module as argv[1] and file names at stdin
step2: opens files and removes empty lines
step3: concatenates all lines in a list called lines
step5: splits each line and constructs dictionary of form to {key1 : [val1 val2 val3], key2: [val1, val2, val3]}
step6: loades reducer.reduce and feel it input of form: key [val1 val2 val3]
step7: write result to result.txt
NOTE: the paths commented are the ones on the local machine/repo and the ones uncommented are the ones in docker image
'''
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


