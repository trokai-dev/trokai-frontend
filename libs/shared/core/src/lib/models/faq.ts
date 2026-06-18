/** Support FAQ section → topics → questions tree. */
export interface FaqData {
  section: string;
  title: string;
  slug: string;
  topics: {
    title: string;
    slug: string;
    questions: {
      question: string;
      slug: string;
      answer: string;
    }[];
  }[];
}
