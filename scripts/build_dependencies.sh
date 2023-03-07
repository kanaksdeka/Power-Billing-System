#!/bin/bash -ue
echo "*** Building dependencies for branch: $BRANCH ***"
echo "Removing old files..."
cd  hms  
rm -f git_hash.txt
rm -rf node_modules

echo "Installing development dependencies..."

npm cache clean
npm prune
npm install

# removing existing tar files
rm -rf node_modules.tar.gz

echo "*** Archiving dependencies for branch: $BRANCH ***"
# now creating tar file
tar -czf node_modules.tar.gz node_modules
mv node_modules.tar.gz ..
cd ..
