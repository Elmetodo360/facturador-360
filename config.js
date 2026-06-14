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
  token: "f360_Kx7mPq2Rv9Lw",     // secreto compartido que Make valida

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
      ivaPorDefecto: 21
    },

    IGI: {
      activa: false,                // se activa en Fase 2
      nombre: "IGI - Instituto Gastronómico S.L.",
      cif: "B23959166",
      direccion: "",                // ⚠️ pendiente: dirección fiscal IGI (obligatoria para emitir)
      cpCiudad: "",
      email: "",
      iban: "ES95 0049 3548 1021 1404 6649",
      logo: "",                     // pendiente
      serie: { prefijo: "IGI-" },   // "IGI-NN/2026"
      serieRect: { prefijo: "IGI-R" },
      ivaPorDefecto: 21
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
