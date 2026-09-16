/**
 * Spanish rule lines.
 *
 * Two reasons these are here. One: the room is a SHPE audience at a Latin
 * Heritage Month summit, and the quotable line is the part people carry out
 * of the talk. Two: marking them with lang="es" is itself WCAG 3.1.2, so the
 * page demonstrates a success criterion instead of only describing one —
 * a screen reader switches to a Spanish voice on these lines and stays in
 * English everywhere else.
 */

export const rulesEs = {
  'clickable-div':
    'Si parece un botón, tiene que ser un botón. El lector de pantalla y el teclado solo saben lo que dice el código, nunca lo que se ve.',
  'alt-text':
    'Si borraras la imagen, ¿qué frase escribirías en su lugar? Esa frase es tu texto alternativo. Si no escribirías nada, usa alt="".',
  'focus-visible':
    'Nunca quites el indicador de foco sin poner algo igual de visible en su lugar. Si tú no ves dónde estás, quien navega solo con teclado tampoco.',
  'link-text':
    'El texto de un enlace tiene que entenderse sin la frase que lo rodea. Lee solo los enlaces: si no los distingues, nadie los distingue.',
  'form-labels':
    'Cada campo necesita una etiqueta real que el lector de pantalla pueda anunciar. El placeholder es una pista, no una etiqueta, y desaparece justo cuando hace falta.'
};
