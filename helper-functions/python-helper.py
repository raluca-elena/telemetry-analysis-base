#!/usr/bin/python
import os
import sys
import fileinput
import simplejson as json
import subprocess
import logging
from subprocess import Popen, PIPE
logging.basicConfig(filename='/home/worker/python-helper-function.log',level=logging.DEBUG)
import time

print "args: ", sys.argv
command = sys.argv[1]
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
sys.path.append(os.path.abspath("/home/worker"))
mapper = __import__(command)

f = open('result.txt', 'w+')
for line in sys.stdin:
    x = line;
    xz_cmd = ["xz", "-d", "--stdout", line.strip()]
    xz = Popen(xz_cmd, stdout=PIPE, stderr=PIPE)

    while True:
        line = xz.stdout.readline()
        if not line:
            break  # EOF
        uuid = line[0:35]
        jsonString = line[36:len(line)]
        jsonLine = json.loads(jsonString)
        f.write(mapper.mapper(uuid, jsonLine) + "\n")
    xz.wait()
    logging.info( "decompression of line %s exit code %s", x , xz.returncode);
f.close()
