# comment
FROM node:6.9.4

MAINTAINER TernaryLogics
ENV TZ=Asia/Kolkata


RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Download and sets up confd for populating app-config file
ENV CONFD_SUB_VERSION=v0.11.0 CONFD_VERSION=confd-0.11.0-linux-amd64

ENV CONFD_URL=https://github.com/kelseyhightower/confd/releases/download/$CONFD_SUB_VERSION/$CONFD_VERSION

RUN mkdir -p /application/confd/bin

RUN curl -L -o /application/confd/bin/confd $CONFD_URL

#COPY confd /application/confd/bin/confd

#Copy confd templates
COPY files/confd/  /application/confd

RUN chmod +x /application/confd/bin/confd

#Copy start script
COPY files/start.sh /tmp/start.sh

RUN chmod +x /tmp/start.sh

# Copy package json file and install dependencies
COPY hmd/package.json /usr/src/app/
RUN npm install --production

#COPY app contents
COPY hmd/dist/ /usr/src/app

#RUN set the timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


EXPOSE 9000

CMD [ "/tmp/start.sh" ]
