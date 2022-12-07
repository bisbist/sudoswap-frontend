# build webui
FROM node:19-alpine3.16 as webui
COPY ./webui /webui
RUN cd /webui && yarn install && yarn build

# copy static build from webui to server
FROM node:19-alpine3.16
COPY ./server /server
WORKDIR /server
RUN yarn install
COPY --from=webui /webui/build /server/public
CMD [ "yarn", "start" ]