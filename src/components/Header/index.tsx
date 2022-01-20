import { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <Image src="/images/logo.svg" alt="logo" width="238" height="25" />
        </a>
      </Link>
    </header>
  );
}
