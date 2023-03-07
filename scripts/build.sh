#!/bin/bash -ue

echo "Removing old files..."

echo "Installing development dependencies..."

if [ -f node_modules.tar.gz ]
then
	echo "Unpacking node_modules artifact..."
	tar zxf node_modules.tar.gz
else
	npm cache clean
	npm prune
	npm install
fi


echo "Building application..."

cd hms 

grunt build:${enviorment}
cd ..
