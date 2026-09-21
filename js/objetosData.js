// js/objetosData.js

export const BANCO_OBJETOS_MAGICOS = [
  {
    nombre: "Pluma de Cuervo de Tinta Eterna",
    efecto: "Aumenta ligeramente la inspiración al registrar nuevas páginas.",
    icono: "✒️",
    rareza: "Común"
  },
  {
    nombre: "Monóculo de los Mundos Perdidos",
    efecto: "Permite percibir secretos ocultos en los géneros de Ciencia Ficción.",
    icono: "🧐",
    rareza: "Rara"
  },
  {
    nombre: "Colgante de Lágrima de Dragón",
    efecto: "Otorga protección contra las sombras en lecturas de Fantasía oscura.",
    icono: "💎",
    rareza: "Épica"
  },
  {
    nombre: "Taza de Café humeante de la Taberna",
    efecto: "Mantiene la fatiga a raya durante maratones de lectura nocturnas.",
    icono: "☕",
    rareza: "Común"
  },
  {
    nombre: "Grimorio de Páginas Infinitas",
    efecto: "Duplica la satisfacción al completar tomos de más de 500 páginas.",
    icono: "📖",
    rareza: "Legendaria"
  }
];

export const BANCO_SEGUIDORES = [
  {
    nombre: "Bartholomew, el Búho Bibliotecario",
    frase: "Hoo... Menos mal que este tomo tenía un índice decente.",
    icono: "🦉"
  },
  {
    nombre: "Ignis, el Pequeño Gárgola de Estantería",
    frase: "¡Ji, ji! El lomo de este libro crujía deliciosamente al cerrarse.",
    icono: "🗿"
  },
  {
    nombre: "Lyra, la Aprendiza de Cronista",
    frase: "¡Anotado en los registros del Gremio! ¿Cuál será nuestra próxima aventura?",
    icono: "📜"
  },
  {
    nombre: "Sir Pounce, el Gato Errante del Cónclave",
    frase: "Prrr... Dormir encima de este libro abierto ha mejorado mi sabiduría.",
    icono: "🐱"
  }
];

// 🎲 Función auxiliar para obtener un objeto o seguidor aleatorio de tu banco local
export function obtenerRecompensaAleatoriaLocal() {
  const objetoAleatorio = BANCO_OBJETOS_MAGICOS[Math.floor(Math.random() * BANCO_OBJETOS_MAGICOS.length)];
  const seguidorAleatorio = BANCO_SEGUIDORES[Math.floor(Math.random() * BANCO_SEGUIDORES.length)];

  return {
    objeto: objetoAleatorio,
    seguidor: seguidorAleatorio
  };
}