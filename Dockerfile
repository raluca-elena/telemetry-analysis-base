#DOCKER-VERSION 1.0.1
FROM ubuntu:14.04
RUN sudo apt-get update
RUN sudo apt-get update --fix-missing
RUN sudo apt-get install -y wget
RUN sudo apt-get install -y make
RUN sudo apt-get install -y python-pip
RUN sudo pip install  simplejson
RUN sudo apt-get install -y xz-utils
RUN sudo apt-get install -y python
RUN sudo apt-get install -y g++
RUN sudo apt-get install -y gcc
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y npm
RUN sudo apt-get install -y nodejs-legacy
RUN sudo npm install aws-sdk 
RUN sudo npm install js-yaml

#Usage: ADD [sounrce directory or Url] [destination directory]
RUN mkdir /opt/analysis-tools

ADD downloader.js /opt/analysis-tools/downloader.js 
ADD mapper.js /opt/analysis-tools/mapper.js
ADD mapper.py /opt/analysis-tools/mapper.py
ADD analysis-tools.yml /etc/analysis-tools.yml
ADD config.json /opt/analysis-tools/config.json
ADD package.json /opt/analysis-tools/package.json

RUN mkdir /opt/analysis-tools/helper-functions 
ADD ./helper-functions  /opt/analysis-tools/helper-functions 










