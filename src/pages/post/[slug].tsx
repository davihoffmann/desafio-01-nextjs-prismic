import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactElement, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  const timeRead = useMemo(() => {
    const numberWordsReadingPerMinute = 200;

    const totalWordsText = post.data.content.reduce((a, b) => {
      const text = `${b.heading} ${RichText.asText(b.body)}`;
      const numberWordsText = text.split(/\s+/).length;

      return a + numberWordsText;
    }, 0);

    return Math.ceil(totalWordsText / numberWordsReadingPerMinute);
  }, [post.data.content]);

  if (router.isFallback) {
    return (
      <>
        <h1>Carregando...</h1>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main>
        <div className={styles.postBanner}>
          <Image
            alt="banner"
            width="1400px"
            height="350px"
            src={post.data.banner.url}
          />
        </div>
        <article className={styles.container}>
          <h1>{post.data.title}</h1>
          <time>
            <AiOutlineCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span>
            <BsPerson />
            {post.data.author}
          </span>
          <span id="time">
            <AiOutlineClockCircle />
            {timeRead} min
          </span>

          {post.data.content.map(content => {
            return (
              <section key={content.heading} className={styles.postContent}>
                <h2>{content.heading} </h2>

                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true, // true, false, blocking
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = response;

  return {
    props: { post },
    redirect: 60 * 1,
  };
};
