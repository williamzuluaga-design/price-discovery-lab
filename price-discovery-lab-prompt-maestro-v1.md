# Prompt maestro — Price Discovery Lab V1

Construye una aplicación educativa llamada **Price Discovery Lab** para estudiantes universitarios y de posgrado en finanzas. Debe simular la formación de precios de una acción ficticia llamada **Andina Tech S.A. (ANDT)** usando una adaptación del experimento de pit market.

## Objetivo pedagógico
El estudiante debe experimentar que el precio de mercado emerge de la interacción entre compradores y vendedores con valoraciones privadas, y que la información pública, la liquidez y los shocks informativos afectan la convergencia del precio.

## Alcance V1
Aplicación local/single-device para uso en aula. No usar backend, autenticación, APIs externas ni datos reales. Debe poder ejecutarse sin publicar un sitio web.

## Pantallas
1. Market Setup
2. Trading Floor
3. Trade Ticket
4. Breaking News
5. Market Reveal / Debrief

## Reglas del mercado
- Cada comprador tiene una valoración máxima privada.
- Cada vendedor tiene un precio mínimo o valor de reserva.
- Una transacción solo es válida si:
  seller_value <= trade_price <= buyer_value
- Calcular:
  buyer_surplus = buyer_value - trade_price
  seller_surplus = trade_price - seller_value
  total_surplus = buyer_value - seller_value
- Registrar timestamp, buyer, seller, precio y surplus.

## Datos iniciales
Buyers: 30000, 29500, 29000, 28400, 27800, 27000, 26500, 25000
Sellers: 23000, 24000, 24800, 25500, 26200, 27000, 28500, 30000

## Trading Floor
Mostrar:
- Last price
- VWAP
- Volume
- High
- Low
- Total surplus
- Market tape
- gráfico precio-tiempo
- cronómetro de ronda

## Trade Ticket
Campos:
- Buyer
- Seller
- Agreed price
Botón: VALIDATE & EXECUTE

Si el trade no cumple la regla, rechazarlo y mostrar los límites válidos.

## Breaking News
Incluir al menos tres eventos:
- BanRep recorta 50 pb inesperadamente
- EBITDA de ANDT supera consenso 12%
- Investigación regulatoria sobre ANDT

Cada evento debe modificar de manera parametrizada las valoraciones de compradores y vendedores.

## Market Reveal
Ordenar valoraciones:
- demanda: compradores descendente
- oferta: vendedores ascendente

Calcular cantidad eficiente Q* mientras buyer_value_q >= seller_value_q.

Calcular maximum surplus y market efficiency:
market_efficiency = realized_surplus / maximum_surplus * 100

Mostrar:
- efficient quantity
- competitive price range
- market efficiency
- valores completos de oferta y demanda
- pregunta de debrief:
  “Si ningún participante conocía toda la distribución de valores y costos, ¿quién determinó el precio observado?”

## Arquitectura
Separar claramente:
- UI layer
- Market Engine
- Game Engine
- Analytics Engine
- Data Layer

Para V1, Data Layer puede ser localStorage.
La arquitectura debe quedar preparada para sustituir localStorage por Supabase en V2.

## Diseño visual
Estética de terminal financiera moderna, sobria y profesional. No infantilizar la gamificación.
Usar fondo oscuro, tipografía clara, price tape, cards y tablas compactas.
No usar imágenes externas ni dependencias innecesarias.

## Exportación
Agregar botón para exportar las transacciones a CSV con:
session_id, round, timestamp, buyer_id, seller_id, buyer_value, seller_value, trade_price, buyer_surplus, seller_surplus, total_surplus.

## Restricciones
- No usar datos reales.
- No implementar IA generativa todavía.
- No implementar multijugador todavía.
- No crear login.
- No crear base de datos remota.
- Priorizar la experiencia pedagógica y la estabilidad del MVP.
