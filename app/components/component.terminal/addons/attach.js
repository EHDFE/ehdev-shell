function attach(term, socket, attachId, bidirectional, buffered) {
  let addonTerminal = term;
  bidirectional = typeof bidirectional === 'undefined' ? true : bidirectional;
  addonTerminal.__socket = socket;
  addonTerminal.__flushBuffer = function() {
    addonTerminal.write(addonTerminal.__attachSocketBuffer);
    addonTerminal.__attachSocketBuffer = null;
  };
  addonTerminal.__pushToBuffer = function(data) {
    if (addonTerminal.__attachSocketBuffer) {
      addonTerminal.__attachSocketBuffer += data;
    } else {
      addonTerminal.__attachSocketBuffer = data;
      setTimeout(addonTerminal.__flushBuffer, 10);
    }
  };
  let myTextDecoder;
  addonTerminal.__getMessage = function(ev) {
    let str;
    if (typeof ev.data == 'object') {
      if (!myTextDecoder) {
        myTextDecoder = new TextDecoder();
      }
      if (ev.data instanceof ArrayBuffer) {
        str = myTextDecoder.decode(ev.data);
        displayData(str);
      } else {
        let fileReader = new FileReader();
        fileReader.addEventListener('load', function() {
          str = myTextDecoder.decode(this.result);
          displayData(str);
        });
        fileReader.readAsArrayBuffer(ev.data);
      }
    } else if (typeof ev.data == 'string') {
      const { id, data } = JSON.parse(ev.data);
      if (id !== attachId) return;
      displayData(data);
    } else {
      throw Error('Cannot handle "' + typeof ev.data + '" websocket message.');
    }
  };
  function displayData(str, data) {
    if (buffered) {
      addonTerminal.__pushToBuffer(str || data);
    } else {
      addonTerminal.write(str || data);
    }
  }
  addonTerminal.__sendData = function(data) {
    if (socket.readyState !== 1) {
      return;
    }
    socket.send(data);
  };
  socket.addEventListener('message', addonTerminal.__getMessage);
  if (bidirectional) {
    addonTerminal.on('data', addonTerminal.__sendData);
  }
  socket.addEventListener('close', function() {
    return detach(addonTerminal, socket);
  });
  socket.addEventListener('error', function() {
    return detach(addonTerminal, socket);
  });
}

export { attach };

function detach(term, socket) {
  let addonTerminal = term;
  addonTerminal.off('data', addonTerminal.__sendData);
  socket = typeof socket === 'undefined' ? addonTerminal.__socket : socket;
  if (socket) {
    socket.removeEventListener('message', addonTerminal.__getMessage);
  }
  delete addonTerminal.__socket;
}
export { detach };

function apply(terminalConstructor) {
  terminalConstructor.prototype.attach = function(
    socket,
    bidirectional,
    buffered
  ) {
    attach(this, socket, bidirectional, buffered);
  };
  terminalConstructor.prototype.detach = function(socket) {
    detach(this, socket);
  };
}
export { apply };
