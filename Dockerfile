#DOCKER-VERSION 1.0.1
FROM ubuntu:14.04
RUN sudo apt-get update
RUN sudo apt-get update --fix-missing
RUN sudo apt-get install -y wget
RUN sudo apt-get install -y make
RUN sudo apt-get install python-pip
RUN pip install simplejson
RUN sudo apt-get install -y xz-utils
RUN sudo apt-get install -y python
RUN sudo apt-get install -y g++
RUN sudo apt-get install -y gcc
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y npm
RUN sudo apt-get install -y nodejs-legacy
RUN sudo npm install aws-sdk 
RUN sudo npm install js-yaml
RUN mkdir /bin/mapper

RUN cd /bin/mapper; wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/downloader.js

RUN cd /bin/mapper; wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/mapper.js

RUN cd /bin/mapper; wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/mapper.py


RUN sudo mkdir /bin/mapper/helper-functions

RUN cd /bin/mapper/helper-functions;  wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/python-helper-function.py 

RUN cd /bin/mapper/helper-functions;  wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/python-helper.py

RUN cd /bin/mapper; wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/package.json

RUN cd /etc; sudo wget https://raw.githubusercontent.com/raluca-elena/telemetryAnalysisOverTaskCluster/master/mapper.yml




