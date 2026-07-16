/* =====================================================================
   FACTURADOR 360 · configuración
   ---------------------------------------------------------------------
   - La URL del backend (Make) y el token van AQUÍ, hardcodeados en JS
     (no en localStorage). Se rellenan en la sub-fase 1b.
   - Datos fiscales por sociedad. Empezamos con EM360 activa.
   - "serie.prefijo" define el formato del nº:  ""   -> 01/2026
                                                 "IGI" -> IGI-01/2026
   ===================================================================== */

const FACTURADOR_CONFIG = {
  // --- Backend (Make) ---
  webhookUrl: "https://hook.eu2.make.com/4pqzk7eahsh6nedpks6xodaoi7gph494",
  // El token NO va aquí: este repo es público y con esa clave se pueden emitir
  // facturas y asentarlas en el libro. La app la pide la primera vez y la guarda
  // en el navegador. Está en SecureHeaven → "Facturador 360 — clave de emisión".
  token: null,

  anioFiscal: 2026,

  // --- Sociedades ---
  sociedades: {
    EM360: {
      activa: true,
      nombre: "El Método 360 Consultoría Integral S.L.",
      cif: "B56536337",
      direccion: "C/ Álamo nº 4",
      cpCiudad: "28939 Madrid",
      email: "hola@elmetodo360.es",
      iban: "ES31 1583 0001 1793 8844 7984",
      logo: "assets/logo-em360.png",
      serie: { prefijo: "" },       // EM360: "NN/2026" (continúa lo existente)
      serieRect: { prefijo: "R" },  // rectificativas: "R-NN/2026"
      ivaPorDefecto: 21,
      // carpeta de OneDrive donde el backend archiva el PDF. SIN ella, el
      // backend usa la de EM360 por defecto y el PDF acabaría en la sociedad
      // equivocada. Cada sociedad DEBE tener la suya.
      carpetaPdf: "/01_Sociedades/El Metodo 360 SL/Contabilidad/2026/01_Emitidas"
    },

    // Datos tomados de la TARJETA DE IDENTIFICACIÓN FISCAL de la AEAT
    // ("Documentacion Oficial/CIF Definitivo IGI.pdf") y del certificado de
    // titularidad del Santander. NO tocar sin contrastar contra esos documentos.
    IGI: {
      activa: true,                 // ACTIVADA 2026-07-15: el Facturador 360 es la
                                    // única vía de emisión para EM360 e IGI (orden de Chema)
      nombre: "INSTITUTO DE GASTRONOMIA IBEROAMERICANO SL",
      cif: "B23959166",
      direccion: "Calle Manipa, núm. 74 - Planta 1, Puerta E",
      cpCiudad: "28027 Madrid",
      email: "facturacion@casaamparo1948.com",
      iban: "ES95 0049 3548 1021 1404 6649",
      // IGI solo explota Casa Amparo, así que sus facturas van con el logo de
      // Casa Amparo 1948 (decisión de Chema). Tomado del logo en producción de
      // casaamparo1948.com; los del Drive son borradores de IA, no el oficial.
      logo: "assets/logo-casa-amparo.png",
      serie: { prefijo: "IGI-" },   // "IGI-NN/2026"
      serieRect: { prefijo: "IGI-R" },
      ivaPorDefecto: 10,            // hostelería
      carpetaPdf: "/01_Sociedades/IGI - Instituto Gastronomico SL/Contabilidad/2026/01_Emitidas"
    },

    GASTRO360: {
      activa: false,                // DESACTIVADA (orden de Chema 2026-06-14)
      nombre: "Gastro360 S.L.",
      cif: "",                      // pendiente de extraer
      direccion: "",
      cpCiudad: "",
      email: "",
      iban: "",
      logo: "",                     // pendiente (Fase 2)
      serie: { prefijo: "G360-" },  // "G360-NN/2026"
      serieRect: { prefijo: "G360-R" },
      ivaPorDefecto: 21
    }
  },

  // --- Clientes frecuentes (autorelleno) ---
  // VACÍO en el repo público por privacidad. Los sirve el backend Make
  // tras validar el token (se rellena en 1b). Mientras, cliente manual.
  clientesFrecuentes: [],

  // --- Tipos de IVA disponibles ---
  tiposIva: [21, 10, 4, 0]
};
