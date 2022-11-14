const isNumeric = (str: string) => {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

onmessage = (e) => {
  const content = e.data as string;
  let arrayBuffer = [];
  let stringBuffer = "";
  let activeDelimiter = null as null | string;

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
  postMessage("@parser-worker-message->done");
};
