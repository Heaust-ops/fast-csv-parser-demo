const isNumeric = (str: string) => {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

let arrayBuffer = [];
let stringBuffer = "";
let activeDelimiter = null as null | string;

const parseChunk = (content: string) => {
  const deLimiters = [`\"`, `\'`, `"`, `'`];
  const delimit = (c: string) => {
    if (deLimiters.includes(c) && !activeDelimiter) {
      activeDelimiter = c;
      return;
    }
    if (activeDelimiter === c) {
      activeDelimiter = null;
      return;
    }
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    delimit(char);
    if (!activeDelimiter && [",", "\n"].includes(char) && stringBuffer) {
      arrayBuffer.push(isNumeric(stringBuffer) ? +stringBuffer : stringBuffer);
      stringBuffer = "";
      if (char === "\n") {
        postMessage(arrayBuffer);
        arrayBuffer = [];
      }
      continue;
    }

    stringBuffer += char;
  }
};

onmessage = (e) => {
  const file = e.data as File;
  const CHUNK_SIZE = 1024*1024*50;
  let offset = 0;
  const fr = new FileReader();
  const decoder = new TextDecoder();

  const seek = (offset: number) => {
    if (offset >= file.size) {
      postMessage("@parser-worker-message->done");
      return;
    }
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    fr.readAsArrayBuffer(slice);
  };

  fr.onload = function () {
    const view = new Uint8Array(fr.result);
    parseChunk(decoder.decode(view));
    offset += CHUNK_SIZE;
    seek(offset);
  };

  seek(offset);

  /**  */
  // return;
};
