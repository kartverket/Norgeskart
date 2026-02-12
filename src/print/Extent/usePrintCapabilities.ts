import { useEffect, useState } from 'react';

export type PrintLayoutApi = {
  name: string;
  attributes: Array<{
    name: string;
    clientInfo: {
      width: number;
      height: number;
    };
  }>;
};

export type PrintLayout = {
  name: string;
  width: number | undefined;
  height: number | undefined;
  minMargin?: number;
};

export function usePrintCapabilities() {
  const [layouts, setLayouts] = useState<PrintLayout[]>([]);

  useEffect(() => {
    fetch('https://print.atkv3-dev.kartverket-intern.cloud/print/kv/capabilities.json')
      .then((res) => res.json())
      .then((data) => {
        const parsedLayouts = (data.layouts as PrintLayoutApi[]).map(
          (layout) => {
            const mapAttr = layout.attributes.find(
              (attr) => attr.name === 'map',
            );
            return {
              name: layout.name,
              width: mapAttr?.clientInfo?.width,
              height: mapAttr?.clientInfo?.height,
            };
          },
        );
        setLayouts(parsedLayouts);
      });
  }, []);
  return layouts;
}
