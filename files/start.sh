#!/bin/bash
set -e

chmod +x /application/confd/bin/confd
/application/confd/bin/confd -confdir="/application/confd" -onetime -backend env

npm start

