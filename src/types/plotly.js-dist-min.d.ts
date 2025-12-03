declare module 'plotly.js-dist-min' {
  export type Layout = Record<string, unknown>;
  export type PlotData = Record<string, unknown>;
  export type Config = Record<string, unknown>;

  type PlotElement = HTMLElement | SVGElement;

  type PlotFn = (
    root: PlotElement,
    data: Partial<PlotData>[],
    layout?: Partial<Layout>,
    config?: Partial<Config>,
  ) => Promise<void> | void;

  interface PlotlyLike {
    react: PlotFn;
    purge: (root: PlotElement) => void;
  }

  const Plotly: PlotlyLike;
  export default Plotly;
}
