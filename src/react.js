import { REACT_ELEMENT, REACT_FORWARD_REF, toVNode } from "./utils";
import { Component } from "./Component";

function createElement(type, properties, children) {
  const ref = properties.ref || null;
  const key = properties.key || null;

  ["ref", "key", "__self", "__source"].forEach((key) => {
    delete properties[key];
  });

  const props = { ...properties };

  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    props.children = toVNode(children);
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  };
}

function createRef() {
  return {
    current: null,
  };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

const React = {
  createElement,
  createRef,
  forwardRef,
  Component,
};

export default React;
