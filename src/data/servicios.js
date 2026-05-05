// Datos de los 7 servicios, contenido verbatim del Word entregado.
// Cada entrada alimenta la sección "Servicios" y el JSON-LD Service.
export const servicios = [
  {
    id: 'carta-digital',
    nombre: 'Carta Astral Digital',
    precioCOP: '250.000',
    precioUSD: '100',
    badge: 'Formato PDF',
    descripcion:
      'Lectura completa de tu carta natal en formato digital, pensada para darte una visión clara, profunda y bien estructurada de tu energía personal. Ideal si deseas comprender mejor tu personalidad, tus patrones internos y las áreas más relevantes de tu vida.',
    incluye: [
      'Sol, Luna y Ascendente',
      'Casas astrológicas y planetas',
      'Aspectos principales de la carta',
      'Rasgos dominantes de personalidad',
      'Fortalezas, retos y tendencias principales',
      'Sextiles, conjunciones, trígonos y oposiciones',
      'PDF detallado con tu interpretación'
    ],
    cta: 'Quiero mi Carta Astral Digital',
    destacado: false
  },
  {
    id: 'cartografia',
    nombre: 'Cartografía Astral',
    precioCOP: '250.000',
    precioUSD: '100',
    badge: 'Mudanza / viaje',
    descripcion:
      'Analiza qué lugares del mundo activan diferentes áreas de tu vida según tu carta natal. Útil si estás considerando mudarte, viajar, emigrar o entender qué entornos pueden favorecer mejor tu crecimiento personal, emocional o profesional.',
    incluye: [
      'Revisión de tu mapa astrocartográfico',
      'Lugares favorables para amor, trabajo y expansión',
      'Zonas con mayor afinidad energética',
      'Áreas de mayor reto o aprendizaje',
      'Orientación para cambios de ciudad, país o entorno'
    ],
    cta: 'Quiero mi Cartografía Astral',
    destacado: false
  },
  {
    id: 'correccion-horaria',
    nombre: 'Corrección Horaria',
    precioCOP: '300.000',
    precioUSD: '100',
    badge: 'Ajuste técnico',
    descripcion:
      'Si no conoces con exactitud tu hora de nacimiento, este servicio permite ajustar técnicamente tu carta natal para obtener una interpretación precisa. Se trabaja a partir de eventos importantes de tu vida para afinar la base astrológica.',
    incluye: [
      'Ajuste técnico de la hora de nacimiento',
      'Revisión de eventos clave de vida',
      'Validación de la carta corregida',
      'Precisión para futuras lecturas'
    ],
    cta: 'Solicitar Corrección Horaria',
    destacado: false
  },
  {
    id: 'carta-consulta',
    nombre: 'Carta Astral + Consulta Personalizada',
    precioCOP: '450.000',
    precioUSD: '150',
    badge: 'Más solicitado',
    descripcion:
      'Una experiencia más profunda y directa para quienes no solo desean recibir una lectura, sino también conversar sobre aquello que hoy les preocupa o necesitan resolver. Combina el análisis completo de tu carta natal con un espacio personalizado para abordar tus preguntas y tu momento actual.',
    incluye: [
      'Interpretación completa de tu carta natal',
      'Consulta personalizada 1 a 1',
      'Respuestas a dudas específicas',
      'Enfoque en tus procesos presentes',
      'Orientación sobre temas personales, emocionales o profesionales'
    ],
    cta: 'Reservar mi Consulta Personalizada',
    destacado: true
  },
  {
    id: 'lectura-anual',
    nombre: 'Carta Astral + Consulta + Tránsitos (1 año)',
    precioCOP: '600.000',
    precioUSD: '200',
    badge: 'Visión anual',
    descripcion:
      'Integra tu carta natal, una consulta personalizada y el análisis de los tránsitos más importantes de los próximos 12 meses. Ideal para quienes desean entender no solo quiénes son y qué están viviendo hoy, sino también cómo se moverá su energía a lo largo del año.',
    incluye: [
      'Todo lo incluido en Carta Astral + Consulta Personalizada',
      'Revisión de tránsitos astrológicos por un año',
      'Análisis de periodos clave',
      'Lectura de oportunidades, retos y momentos de mayor movimiento',
      'Orientación para decisiones importantes durante el año'
    ],
    cta: 'Quiero mi Lectura Anual',
    destacado: false
  },
  {
    id: 'retorno-solar',
    nombre: 'Retorno Solar + Consulta + Tránsitos (1 año)',
    precioCOP: '600.000',
    precioUSD: '200',
    badge: 'Nuevo ciclo',
    descripcion:
      'El retorno solar muestra la energía predominante de tu nuevo ciclo anual y revela los temas que tomarán mayor relevancia en los próximos meses. Combinado con consulta y tránsitos ofrece una visión amplia, precisa y útil de tu año personal.',
    incluye: [
      'Interpretación completa de tu retorno solar',
      'Consulta personalizada 1 a 1',
      'Tránsitos por un año',
      'Temas centrales del nuevo ciclo',
      'Oportunidades, desafíos y focos principales del año',
      'Revisión de dónde te conviene más cumplir años'
    ],
    nota:
      'El retorno solar debe basarse en el lugar donde estuviste el día de tu cumpleaños, en la hora exacta de tu nacimiento. Sin esta información, no es posible realizarlo.',
    cta: 'Reservar mi Retorno Solar',
    destacado: false
  },
  {
    id: 'sinastria',
    nombre: 'Sinastría de Pareja / Socios',
    precioCOP: '1.200.000',
    precioUSD: '400',
    badge: 'Vínculo profundo',
    descripcion:
      'Análisis comparativo entre dos cartas astrales para comprender con mayor profundidad la dinámica real de una relación, afectiva o profesional. Permite ver puntos de compatibilidad, tensión, aprendizaje y propósito del vínculo.',
    incluye: [
      'Comparación de ambas cartas astrales',
      'Dinámica emocional y energética del vínculo',
      'Compatibilidad real',
      'Conflictos potenciales y áreas sensibles',
      'Propósito de la relación o sociedad',
      'Lectura aplicada a parejas o socios'
    ],
    nota: 'Es importante contar con la fecha, hora y ciudad de nacimiento exactas de la otra persona.',
    cta: 'Quiero mi Sinastría',
    destacado: true
  }
];
