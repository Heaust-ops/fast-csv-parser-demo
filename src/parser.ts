const csvParts = (str: string, parts: number) => {
  const splitIdxBuffer = [0];
  for (let i = 1; i < parts - 1; i++) {
    const start = Math.floor((i * str.length) / parts);
    const end = Math.floor(((i + 1) * str.length) / parts);
    let splitIdx = start;
    for (let j = start; j < end; j++) {
      if (str[i] === "\n") {
        splitIdx = i;
        break;
      }
    }
    splitIdxBuffer.push(splitIdx);
  }
  splitIdxBuffer.push(str.length);
  return splitIdxBuffer
    .map((start, i) => {
      const end = splitIdxBuffer[i + 1];
      if (!end) return;
      return str.slice(start, splitIdxBuffer[i + 1]);
    })
    .filter((el) => !!el) as string[];
};

export const parseCSVFile = (
  file: File,
  setLoading: (isLoading: boolean) => void,
  rowCatcher: (row: (number | string)[]) => void,
  workers = 1
) => {
  /** We're going to start loading */
  setLoading(true);

  /** Make file reader */
  const reader = new FileReader();

  /** Make worker pool */
  const workerPool = [] as Worker[];
  for (let i = 0; i < workers; i++) {
    workerPool.push(
      new Worker(new URL("./parser.worker.d.ts", import.meta.url))
    );
  }

  /** Delegate task to worker after the file is read */
  reader.onload = function (event) {
    const content = event?.target?.result as string;
    if (!content) {
      setLoading(false);
      return;
    }
    const parts = csvParts(content, workers + 1);
    if (parts.length !== workers) {
      setLoading(false);
      return console.log("mismatch");
    }

    /** Initiate task */
    for (let i = 0; i < parts.length; i++) {
      workerPool[i].postMessage(parts[i]);
    }
  };

  let completed = 0;
  /** read the file */
  reader.readAsText(file);
  /** keep catching rows and set loading to false when done */
  const workerOnMessage = (e: MessageEvent) => {
    if (e.data === "@parser-worker-message->done") {
      completed++;
      if (completed === workers) setLoading(false);
    } else rowCatcher(e.data);
  };

  for (const w of workerPool) w.onmessage = workerOnMessage;
};
