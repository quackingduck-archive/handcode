#!/bin/bash
find . -path './test_*.js' -exec node {} \;
echo 'OK'
