#!/bin/sh

# Run on the first Monday of a 28 day cycle
# (Based on Julian Day Number)
index=$(( ($(date +%s) / 86400 + 2440587 + 2) % 28 ))

if [ "$index" = "0" ]; then
  node ./index.js job.pdf -m four-weeks

  lp -d E470LAN job.pdf
fi
