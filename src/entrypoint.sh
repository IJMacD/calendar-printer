#!/bin/bash

set -eo pipefail

# if first arg looks like a flag (or there are no args), assume we want to run the print job
if [[ "${1:0:1}" = '-' ]] || [[ "$#" -eq 0  ]]; then
    cmd='node ./index.js job.pdf '"$@"' && lp -d '"$PRINTER"' job.pdf && echo Printed'
    echo $cmd
    set -- /bin/bash -c "$cmd"
fi

exec "$@"
