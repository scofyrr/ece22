// ============================================================
//  CONTENIDO EDITABLE — Página principal del colegio
//  Edita SOLO los textos aquí. El equipo puede cambiarlos sin
//  tocar los componentes. (Datos genéricos de ejemplo.)
// ============================================================

export const colegio = {
  nombre: "Colegio José Carlos Mariátegui",
  apodo: "El Amauta",
  lema: "Educar es sembrar conocimiento que transforma.",

  // URL de la imagen de fondo difuminada (reemplázala por la del colegio)
  fondoUrl:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",

  hero: {
    titulo: "Colegio José Carlos Mariátegui",
    subtitulo: '"El Amauta"',
    descripcion:
      "Una comunidad educativa donde cada estudiante aprende enseñando. Conoce nuestra historia, valores y la red de trueque de conocimientos.",
  },

  bio: {
    titulo: "Quiénes somos",
    parrafos: [
      "Texto genérico de ejemplo: somos una institución educativa comprometida con la formación integral de nuestros estudiantes, fomentando el pensamiento crítico y los valores.",
      "Aquí el equipo colocará la descripción real del colegio, su misión y visión.",
    ],
  },

  historia: {
    titulo: "Nuestra historia",
    // Cada hito es un objeto separado para editar fácilmente
    hitos: [
      { anio: "19XX", texto: "Fundación del colegio (texto genérico de ejemplo)." },
      { anio: "20XX", texto: "Hito importante de la institución (editar)." },
      { anio: "Hoy", texto: "Comunidad educativa en constante crecimiento (editar)." },
    ],
  },

  valores: {
    titulo: "Nuestros valores",
    items: [
      { emoji: "📚", nombre: "Conocimiento", desc: "El saber se comparte y crece." },
      { emoji: "🤝", nombre: "Comunidad", desc: "Aprendemos mejor juntos." },
      { emoji: "💡", nombre: "Pensamiento crítico", desc: "Cuestionar para entender." },
      { emoji: "🌱", nombre: "Compromiso", desc: "Crecer con responsabilidad." },
    ],
  },

  cta: {
    titulo: "Únete a la red de trueque de conocimientos",
    descripcion:
      "Publica lo que sabes, gana puntos y canjéalos por libros en la biblioteca digital.",
    boton: "Entrar al Feed",
  },
} as const;
