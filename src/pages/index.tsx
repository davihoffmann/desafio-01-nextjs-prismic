import { ReactElement, useCallback, useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { AiOutlineCalendar } from 'react-icons/ai';
import { MdOutlinePerson } from 'react-icons/md';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [pagination, setPagination] = useState<PostPagination>(postsPagination);

  const loadMore = useCallback(() => {
    if (postsPagination.next_page) {
      fetch(postsPagination.next_page)
        .then(response => response.json())
        .then(response => {
          const results = response.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: post.first_publication_date,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });

          const newPagination: PostPagination = {
            next_page: response.next_page,
            results: [...pagination.results, ...results],
          };

          setPagination(newPagination);
        })
        .catch(error => {
          return console.error(error);
        });
    }
  }, [postsPagination.next_page, pagination.results]);

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {pagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <time>
                  <AiOutlineCalendar color="#BBBBBB" />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBR }
                  )}
                </time>

                <span>
                  <MdOutlinePerson color="#BBBBBB" /> {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>
        {pagination.next_page && (
          <button
            type="button"
            onClick={loadMore}
            className={styles.postLoadMore}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    console.log(post.data.title);
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60,
  };
};
