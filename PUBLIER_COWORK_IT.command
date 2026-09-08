#!/bin/bash
cd "$(dirname "$0")"
open "http://127.0.0.1:4317/publish.html" 2>/dev/null || true
npm run publish-ui
