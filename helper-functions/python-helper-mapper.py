#!/usr/bin/python
'''
python-helper-mapper.py functionality:
step1: takes mapper module as argv[1] and file names at stdin
step2: decompresses each file
step3: reads each decompressed line
step4: splits decompressed line in uuid and json
step5: opens result.txt
step6: loads the mapper function and feeds lines to is of form uuid filename json
step7: writes the output of the mapper to result.txt
NOTE: the paths commented are the ones on the local machine/repo and the ones uncommented are the ones in docker image
'''
import os
import sys
import simplejson as json
import logging
from subprocess import Popen, PIPE
logging.basicConfig(filename='python-helper-function.log',level=logging.DEBUG)

print "args: ", sys.argv
command = sys.argv[1]
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
sys.path.append(os.path.abspath("/home/worker"))
mapper = __import__(command)

filesDecompressed = []
filesNotDecompressed = []
invalidLines = []

f = open('result.txt', 'w+')

for line in sys.stdin:
    file = line.strip();
    print "file sent to mapper ", file
    xz_cmd = ["xz", "-d", "--stdout", line.strip()]
    xz = Popen(xz_cmd, stdout=PIPE, stderr=PIPE)
    count = 0
    while True:
        lineDecompressed = xz.stdout.readline()
        if not lineDecompressed:
            break  # EOF
        uuid = lineDecompressed[0:35]
        jsonString = lineDecompressed[36:len(lineDecompressed)]
        try:
            jsonLine = json.loads(jsonString)
        except ValueError, e:
            invalidLines.append(lineDecompressed)
            print "in file ", file, " line", count, " failed"
        else:
            f.write(mapper.mapper(uuid, file, jsonLine))
        count+=1
    if len(invalidLines) != 0:
        print invalidLines
    xz.wait()
    if xz.returncode == 0:
        print "successfully decompressed file ", file
        filesDecompressed.append(file)
    else:
        filesNotDecompressed.append(file)

print 'decompressed succesfully\n', filesDecompressed
if len(filesNotDecompressed) != 0:
    print 'not decompressed succesfully\n', filesNotDecompressed
f.close()
