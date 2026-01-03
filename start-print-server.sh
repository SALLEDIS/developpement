#!/bin/bash

echo "========================================"
echo "   DEMARRAGE SERVEUR D'IMPRESSION"
echo "========================================"
echo ""

cd "$(dirname "$0")/print-server"

if [ ! -d "node_modules" ]; then
    echo "Installation des dependances..."
    npm install
    echo ""
fi

echo "Demarrage du serveur..."
echo ""
npm start
