export const parseCSVFile = (
  file: File,
  setLoading: (isLoading: boolean) => void,
  rowCatcher: (row: (number | string)[]) => void
) => {
  /** We're going to start loading */
  setLoading(true);

  const worker = new Worker(new URL("./parser.worker.d.ts", import.meta.url));
  worker.postMessage(file);

  /** keep catching rows and set loading to false when done */
  const workerOnMessage = (e: MessageEvent) => {
    if (e.data === "@parser-worker-message->done") setLoading(false);
    else rowCatcher(e.data);
  };

  worker.onmessage = workerOnMessage;
};
