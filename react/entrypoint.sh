#!/bin/bash                                                                
echo "Server mode $MODE"

if [[ $MODE == "debug" ]]
then
    cd /html
    npm start
fi
                                                                          
if [[ $MODE == "prod" ]]
then
    cd /fixed/build
    serve -s . -l 8000
fi

sleep 5
