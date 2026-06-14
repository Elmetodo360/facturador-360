# Facturador 360

App web para **emitir facturas** de las sociedades de El Método 360 sin colisiones de
numeración entre quienes facturan (Chema e Isabel), archivándolas en su sitio y
registrándolas en contabilidad automáticamente.

> Complementa la pipeline de facturas **recibidas** (skill `/facturas`). Esta app es para
> facturas **emitidas** (ingresos).

## Cómo funciona

1. **Eliges sociedad** → se cargan sus datos fiscales y su serie de numeración.
2. Rellenas **cliente + líneas + IVA** (totales en vivo).
3. **Emitir** →
   - El backend (Make) asigna el **siguiente número correlativo** de esa serie
     (procesamiento secuencial → nunca dos números iguales ni huecos).
   - La app genera el **PDF** (con logo de la sociedad).
   - Make **archiva el PDF** en `Invoice Out` y escribe la fila en
     **"Facturas Emitidas SL"** del libro de contabilidad de esa sociedad.

## Numeración por sociedad

| Sociedad | Formato | Inicio |
|---|---|---|
| EM360 | `NN/2026` | continúa (próx. 23) |
| IGI | `IGI-NN/2026` | 01 |
| Gastro360 | `G360-NN/2026` | *(desactivada)* |

Rectificativas: serie propia con prefijo `R`.

## Verifactu

Diseñada **Verifactu-ready**: el registro guarda los campos previstos (huella encadenada,
timestamp, ID de software, hueco de QR). Obligatorio para sociedades a partir del
**1-ene-2027** (aplazado vía RD-ley 15/2025). Hoy no es obligatorio; cuando aplique, se
activa sin rehacer la app.

## Estructura

- `index.html` · `styles.css` — interfaz
- `app.js` — lógica, totales y generación de PDF (jsPDF)
- `config.js` — datos fiscales por sociedad y URL del backend (**sin datos de clientes**)
- `assets/` — logos

## Configuración (privada)

`config.js` contiene `webhookUrl` y `token` del backend Make. Los datos de clientes
**no** viven en este repo: los sirve el backend tras validar el token.
