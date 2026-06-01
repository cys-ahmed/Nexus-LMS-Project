#!/bin/bash
cd "$(dirname "$0")"
exec sudo ./startup/start.sh "$@"
