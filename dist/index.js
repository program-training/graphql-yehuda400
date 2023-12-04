import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
const typeDefs = `#graphql
  enum Genre {
    Mystery
    Fantasy
    Classic
    Fiction
  }

  type Book {
    id: ID!
    title: String!
    authorId: String!
    genre: Genre!
  }

  type Author {
    id: ID!
    name: String!
    books(fields: [String]): [Book] 
  }

  input BookInput {
    title: String!
    authorId: String!
    genre: Genre!
  }

  type Query {
    books: [Book]
    book(id: ID): Book
    authors: [Author]  # Ensure authors query is correctly defined
    author(id: ID): Author
  }

  type Mutation {
    addBook(book: BookInput!): Book
    # Other mutations if needed
  }
`;
const books = [
    { id: "1", title: "The Great Gatsby", authorId: "1", genre: "Classic" },
    {
        id: "2",
        title: "To Kill a Mockingbird",
        authorId: "2",
        genre: "Classic",
    },
    {
        id: "3",
        title: "The Catcher in the Rye",
        authorId: "3",
        genre: "Classic",
    },
    {
        id: "4",
        title: "Harry Potter and the Philosopher's Stone",
        authorId: "4",
        genre: "Fantasy",
    },
    { id: "5", title: "Tender Is the Night", authorId: "1", genre: "Classic" },
    {
        id: "6",
        title: "Harry Potter and the Chamber of Secrets",
        authorId: "4",
        genre: "Fantasy",
    },
];
const authors = [
    { id: "1", name: "F. Scott Fitzgerald", books: [] },
    { id: "2", name: "Harper Lee", books: [] },
    { id: "3", name: "J.D. Salinger", books: [] },
    { id: "4", name: "J.K. Rowling", books: [] },
];
const resolvers = {
    Query: {
        books: () => books,
        book: (_, { id }) => books.find((book) => book.id === id),
        authors: () => authors,
        author: (_, { id }) => authors.find((author) => author.id === id),
    },
    Mutation: {
        addBook: (_, { book }) => {
            const newBook = {
                id: String(books.length + 1),
                title: book.title,
                authorId: book.authorId,
                genre: book.genre,
            };
            books.push(newBook);
            // Assuming you want to update the respective author's books array
            const author = authors.find((author) => author.id === book.authorId);
            if (author) {
                author.books.push(newBook);
            }
            return newBook;
        },
        // Other mutation resolvers if present
    },
    Author: {
        books: (author, args) => {
            const authorBooks = books.filter((book) => book.authorId === author.id);
            if (args.fields) {
                return authorBooks.map((book) => {
                    const selectedFields = {};
                    args.fields.forEach((field) => {
                        if (book[field]) {
                            selectedFields[field] = book[field];
                        }
                    });
                    return selectedFields;
                });
            }
            return authorBooks;
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
