#!/usr/bin/python
import simplejson as json

def mapper(uuid, js):
    measures = []
    for key, value in js.iteritems():
        #print key
        if key == 'histograms':
            z = json.dumps(value)
            q = json.loads(z)
            #print 'ALOHA', q
            for key, value in q.iteritems():
                #print key, 1
                measures.append(key + ' 1');
                #print measures
    #print "mea: ", measures
    #print "str: ", str(measures)
    return str(measures)