#!/usr/bin/env bash

# Script de demo para:
# 1) Crear/actualizar una intención
# 2) Confirmar esa intención como orden
# 3) Crear una orden directa sin intención

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Usando BASE_URL=${BASE_URL}"
echo

INTENTION_ID="INT-DEMO-$(date +%s)"

echo "1) Creando intención ${INTENTION_ID}..."
INTENTION_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/intentions" \
  -H "Content-Type: application/json" \
  -d "{
    \"intentionId\": \"${INTENTION_ID}\",
    \"producto\": \"Demo de asado\",
    \"cantidad\": 2,
    \"foto_url\": \"https://example.com/demo-foto.jpg\",
    \"audio_url\": \"https://example.com/demo-audio.mp3\",
    \"telefono\": \"+54 9 11 1234-5678\",
    \"nombre\": \"Usuario Demo\"
  }")

echo "Respuesta intención:"
echo "${INTENTION_RESPONSE}"
echo

echo "2) Confirmando intención como orden..."
ORDER_FROM_INTENTION_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"intentionKey\": \"${INTENTION_ID}\"
  }")

echo "Respuesta orden desde intención:"
echo "${ORDER_FROM_INTENTION_RESPONSE}"
echo

echo "3) Creando orden directa sin intención..."
DIRECT_ORDER_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "producto": "Demo vacío sin intención",
    "cantidad": 1,
    "foto_url": "https://example.com/demo-directo-foto.jpg",
    "audio_url": "https://example.com/demo-directo-audio.mp3",
    "telefono": "+54 9 11 9999-0000",
    "nombre": "Orden Directa"
  }')

echo "Respuesta orden directa:"
echo "${DIRECT_ORDER_RESPONSE}"
echo

echo "4) Listando órdenes (API)..."
LIST_RESPONSE=$(curl -sS "${BASE_URL}/api/orders")
echo "${LIST_RESPONSE}"
echo

echo "Demo finalizada. Podés ver las órdenes en ${BASE_URL}/orders"

