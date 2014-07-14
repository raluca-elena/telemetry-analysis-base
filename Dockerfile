#DOCKER-VERSION 1.0.1
FROM ubuntu:14.04
RUN sudo apt-get update
RUN sudo apt-get update --fix-missing
RUN sudo apt-get install -y  wget make python-pip xz-utils python g++ gcc nodejs npm nodejs-legacy ca-certificates sudo vim
RUN sudo apt-get install -y sendmail
RUN sudo pip install  simplejson
RUN echo "worker ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
RUN useradd -d /home/worker -s /bin/bash -m worker
RUN mkdir /opt/analysis-tools

ADD mapper.js /opt/analysis-tools/mapper.js
ADD reducer.js /opt/analysis-tools/reducer.js

ADD key.pem /opt/analysis-tools/key.pem
ADD encrypt.js /opt/analysis-tools/encrypt.js
ADD fabricateS3Credentials.js /opt/analysis-tools/fabricateS3Credentials.js

ADD mapperDriver.js /opt/analysis-tools/mapperDriver.js
ADD reducerDriver.js /opt/analysis-tools/reducerDriver.js

ADD mapper.py /opt/analysis-tools/mapper.py
ADD reducer.py /opt/analysis-tools/reducer.py

ADD mapper.py /home/worker/mapper.py
ADD reducer.py /home/worker/reducer.py

ADD analysis-tools.yml /etc/analysis-tools.yml
ADD package.json /opt/analysis-tools/package.json
ADD email.js /opt/analysis-tools/email.js

RUN cd /opt/analysis-tools; npm install

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








