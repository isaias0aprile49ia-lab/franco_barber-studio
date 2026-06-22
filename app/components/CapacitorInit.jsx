'use client';
import { useEffect } from 'react';

// Inicializa los plugins nativos solo cuando la web corre dentro de la app
// (Capacitor). En el navegador normal no hace nada.
export default function CapacitorInit() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform() || cancelled) return;

      const { StatusBar, Style } = await import('@capacitor/status-bar');
      const { SplashScreen } = await import('@capacitor/splash-screen');

      // La barra de estado se adapta al tema claro/oscuro de la web.
      const applyStatusBar = async () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: dark ? '#0a0a0a' : '#d3d1cc' });
          }
        } catch (e) {
          /* algunos dispositivos no soportan todas las llamadas */
        }
      };

      await applyStatusBar();

      // Reaplica si el usuario cambia el tema.
      const observer = new MutationObserver(applyStatusBar);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      // Oculta la splash una vez que la app ya pintó contenido.
      await SplashScreen.hide();

      return () => observer.disconnect();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
