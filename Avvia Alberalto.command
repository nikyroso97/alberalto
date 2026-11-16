#!/bin/bash
# Doppio clic per giocare ad Alberalto sul Mac e sul telefono (stessa rete Wi-Fi). Per fermare: chiudi questa finestra.
cd "$(dirname "$0")"
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
echo ""
echo "  🌳 Alberalto è acceso!"
echo ""
echo "  Sul Mac apri:       http://localhost:8000"
[ -n "$IP" ] && echo "  Sul telefono apri:  http://$IP:8000   (telefono sulla stessa rete Wi-Fi)"
echo ""
echo "  Per spegnere: chiudi questa finestra."
echo ""
open "http://localhost:8000"
python3 -m http.server 8000 --bind 0.0.0.0
