export type Book = { title: string; author: string; why: string; cover: string; tilt?: number };

/** PLACEHOLDERS until Keerthi sends the real list. Swap title / author / why / cover; keep the shape. Covers live in public/books. */
export const books: Book[] = [
  { title: 'The Design of Everyday Things', author: 'Don Norman', why: 'The book that made me notice doors.', cover: '/books/everyday-things.jpg' },
  { title: 'Norwegian Wood', author: 'Haruki Murakami', why: 'Quiet, sad, impossible to put down.', cover: '/books/norwegian-wood.jpg' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', why: 'All of us, in one sitting.', cover: '/books/sapiens.jpg' },
  { title: 'The Alchemist', author: 'Paulo Coelho', why: 'Read it young, read it again later.', cover: '/books/alchemist.jpg', tilt: -6 },
  { title: 'Steal Like an Artist', author: 'Austin Kleon', why: 'Permission to be influenced.', cover: '/books/steal-like-an-artist.jpg' },
];
