#!/bin/bash
cd /home/site/wwwroot

if [ -d .next/standalone ]; then
  cp -r .next/static .next/standalone/.next/static
  cp -r public .next/standalone/public 2>/dev/null || true
  cd .next/standalone
  node server.js
else
  npm run start
fi
