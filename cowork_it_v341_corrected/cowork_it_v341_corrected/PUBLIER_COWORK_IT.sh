#!/usr/bin/env bash
cd "$(dirname "$0")"
( sleep 1; xdg-open "http://127.0.0.1:4317/publish.html" >/dev/null 2>&1 || true ) &
npm run publish-ui
