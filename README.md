#telemetry-analysis-base
=======================

A task in TaskCluster needs:
  
   * a setup AKA an environment provided as a Docker image that will be the base of the Docker container 
   * a task definition (custom code) that will run in the Docker instance



## Working with Docker

### Docker Images and  Docker Containers

First thing that you need to do it to install Docker on your machine.
You can start from here:

https://docs.docker.com/installation/


#### Running Docker on  MAC OS X

The Docker Engine uses Linux-specific kernel features, so to run it on OS X you need to use a lightweight virtual machine (vm).

Docker provides a solution called `Boot2Docker`: https://docs.docker.com/installation/mac/

Another option is to use `Vagrant`: http://www.vagrantup.com/

This repo provides support for Vagrant. If you want to use Docker with vagrant you need to:

   1. download vagrant from here http://www.vagrantup.com/downloads.html
   2. go into your working directory
   3. add `Vagrantfile` from this repo
   4. run: 
       * ` $vagrant up`
       * ` $vagrant ssh`
      

You can access your local directory from  `/vagrant/file`


In Docker terminology, a read-only Layer is called an image. An image _never_ changes.
Docker images are comprised of a series of layers. An image can be basic, with nothing but the operating-system fundamentals, or it can consist of a sophisticated pre-built application stack ready for launch.

A Docker `image` is the basis of a Docker `container`.

Once you start a process in Docker from an Image, Docker fetches the image and its Parent Image, 
and repeats the process until it reaches the Base Image. 
Then the Union File System adds a read-write layer on top. That read-write layer, plus the information about its Parent Image and some additional information like its unique id, networking configuration, and resource limits is called a container.

Containers can change, and so they have state. A container may be running or exited.


###Building and pushing a Docker Image


In this repo you can find a `Dockerfile`.

This is a customization for a Docker image (when run will create an custom image with all the dependencies needed for a map/reduce job).

If you run it in Docker you will obtain a Docker image. 

This is done by running: 

 `$docker build [options] PATH|URL`

For example if you want to build a Docker image in the current directory you run: 
  
  `$docker .`

If you want to share this image you might want to push it to a registry.
You can do that by pushing the image running the following command:
 
 `$docker push NAME`


Taskcluster has his own registry so if you want to use your image for a task you should push it there.
There is a `Makefile` in this repository that builds an image and pushes it to taskcluster registry.


If you are a MAC OS X and use Vagrant you need to add the `Dockerfile` from this repo in `Vagrant` and also the makefile
and build it there.


##Stucture of a map/reduce job

### Map job

 * A map job take as input a list of files to download. 
 * Starts by downloading k files in paralel in ./s3/[path in s3]/filename
 * Reads the specification the job's specification from analysis-tools.yml.
 * From the specification it will infer:
     1. if the files need to be decompressed or not
     2. what kind of mapper module needs to load (javascript/python or a binary)
     3. what is the name of the mapper module that needs to be loaded (custom mapper)
 * Spawns a child process that will run the map job as files are ready for processing(downloaded and decompressed) 


### Reduce Job

 * Takes as environment variable the list of dependent tasks
 * Constructs the urls for downloading the result for each dependent task
 * Starts downloading the results of the mapper in ./mapperOutput
 * Reads the specification the job's specification from analysis-tools.yml.
 * From the specification it will infer:
     1. what kind of reducer module needs to load (javascript/python or a binary)
     2. what is the name of the reducer module that needs to be loaded(custom reducer)
 * Spawns a child process that will run the reduce job as the files are ready for processing(downloaded)

Note:
When started a map/reduce docker container needs to have provided as env variable temporary credentials so it can access resources in Amazon(S3 in this case)
It expects a environment variable called CREDENTIALS that is base64 encoded and should contain encrypted symmetric key and encrypted credentials for S3. 


