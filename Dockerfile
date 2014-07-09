#DOCKER-VERSION 1.0.1
FROM ubuntu:14.04
RUN sudo apt-get update
RUN sudo apt-get update --fix-missing
RUN sudo apt-get install -y  wget make python-pip xz-utils python g++ gcc nodejs npm nodejs-legacy ca-certificates sudo vim 
RUN sudo pip install  simplejson
RUN sudo npm install aws-sdk js-yaml mkdirp
RUN echo "worker ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
RUN useradd -d /home/worker -s /bin/bash -m worker
RUN mkdir /opt/analysis-tools

ADD downloader.js /opt/analysis-tools/downloader.js 
ADD mapper.js /opt/analysis-tools/mapper.js
ADD mapper.py /opt/analysis-tools/mapper.py
ADD mapper.py /home/worker/mapper.py
ADD analysis-tools.yml /etc/analysis-tools.yml
ADD config.json /opt/analysis-tools/config.json
ADD package.json /opt/analysis-tools/package.json

RUN mkdir /opt/analysis-tools/helper-functions 
ADD ./helper-functions  /opt/analysis-tools/helper-functions 
RUN sudo chmod -R 777 /opt/analysis-tools
# Set variable normally configured at login, by the shells parent process, these
# are taken from GNU su manual
ENV HOME /home/worker
ENV SHELL /bin/bash
ENV USER worker
ENV LOGNAME worker
# Declare default user and default working folder
USER worker
WORKDIR /home/worker








