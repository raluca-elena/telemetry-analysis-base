#!/usr/bin/python
import simplejson as json

def mapper(uuid, file, js):
    return str(js['info']['OS'] + ' 1\n')