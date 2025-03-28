import {flushUpdaterQueue, updaterQueue} from "./Component";

export function addEvent(dom, eventName, bindFunction) {
  dom.attach = dom.attach || {};
  dom.attach[eventName] = bindFunction;
  // 事件合成机制的核心点一：事件绑定到document
  if (document[eventName]) {
    return;
  }
  document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
  updaterQueue.isBatch = true;
  // 事件合成机制的核心点二：屏蔽浏览器之间的差异
  const syntheticEvent = createSyntheticEvent(nativeEvent);
  let target = nativeEvent.target;
  while (target) {
    syntheticEvent.currentTarget = target;
    const eventName = `on${nativeEvent.type}`;
    const bindFunction = target.attach && target.attach[eventName];
    bindFunction && bindFunction(syntheticEvent);
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode;
  }
  flushUpdaterQueue();
}

function createSyntheticEvent(nativeEvent) {
  const nativeEventKeyValues = {};
  for (let key in nativeEvent) {
    nativeEventKeyValues[key] =
        typeof nativeEvent[key] === "function"
            ? nativeEvent[key].bind(nativeEvent)
            : nativeEvent[key];
  }
  const syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false,
    isPropagationStopped: false,
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });

  return syntheticEvent;
}
