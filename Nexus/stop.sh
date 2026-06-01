#!/bin/bash
cd "$(dirname "$0")"
exec sudo ./startup/stop.sh "$@"
