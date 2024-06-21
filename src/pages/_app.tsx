import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'; // Import global CSS

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Add fade-in effect on route change
      const appElement = document.getElementById('__next');
      if (appElement) {
        appElement.classList.add('fade-in');
        // Remove the class after the animation ends
        setTimeout(() => {
          appElement.classList.remove('fade-in');
        }, 500); // Match the duration of the animation
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
