import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_TEXT,
  CREATE,
  MOVE,
} from "./utils";
import {addEvent} from "./event";

function render(VNode, containerDOM) {
  // 将虚拟DOM转化成真实DOM
  // 将得到的真实DOM挂载到containerDOM中
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  // 1.创建元素
  const {type, props, ref} = VNode;
  let dom;

  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }

  if (
      typeof type === "function" &&
      VNode.$$typeof === REACT_ELEMENT &&
      type.IS_CLASS_COMPONENT
  ) {
    return getDomByClassComponent(VNode);
  }

  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }

  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }

  // 2.创建子元素
  if (props.children?.type) {
    mount(props.children, dom);
  } else if (Array.isArray(props.children)) {
    mountArray(props.children, dom);
  }

  // 3.处理属性值
  setPropsForDOM(dom, props);

  VNode.dom = dom;
  ref && (ref.current = dom);

  return dom;
}

function getDomByForwardRefFunction(VNode) {
  const {type, props, ref} = VNode;
  const renderVNode = type.render(props, ref);
  if (!renderVNode) {
    return;
  }
  return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
  const {type, props, ref} = VNode;
  const instance = new type(props);
  VNode.classInstance = instance;
  ref && (ref.current = instance);
  const renderVNode = instance.render();
  instance.oldVNode = renderVNode;
  if (!renderVNode) {
    return;
  }
  const dom = createDOM(renderVNode);
  return dom;
}

function getDomByFunctionComponent(VNode) {
  const {type, props} = VNode;
  const renderVNode = type(props);
  if (!renderVNode) {
    return;
  }
  VNode.oldRenderVNode = renderVNode;
  const dom = createDOM(renderVNode);
  VNode.dom = dom;
  return dom;
}

function setPropsForDOM(dom, props = {}) {
  if (!dom) {
    return;
  }
  for (let key in props) {
    if (key === "children") {
      continue;
    }
    if (/^on[A-Z].*/.test(key)) {
      // TODO 处理事件
      addEvent(dom, key.toLowerCase(), props[key]);
    } else if (key === "style") {
      Object.keys(props[key]).forEach((styleName) => {
        dom.style[styleName] = props[key][styleName];
      });
    } else {
      dom[key] = props[key];
    }
  }
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) {
    return;
  }
  for (let i = 0; i < children.length; i++) {
    children[i].index = i;
    mount(children[i], parent);
  }
}

export function findDomByVNode(VNode) {
  if (!VNode) {
    return;
  }
  if (VNode.dom) {
    return VNode.dom;
  }
}

// 开始dom-diff
export function updateDomTree(oldVNode, newVNode, oldDOM) {
  // 新节点，旧节点都不存在
  // 新节点存在，旧节点不存在
  // 新节点不存在，旧节点存在
  // 新节点存在，旧节点存在，但是类型不一样
  // 新节点存在，旧节点存在，类型一样
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type, // 类型不同
  };
  const UPDATE_TYPE = Object.keys(typeMap).filter((key) => typeMap[key])[0];
  switch (UPDATE_TYPE) {
    case "NO_OPERATE":
      break;
    case "ADD":
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    case "DELETE":
      removeVNode(oldVNode);
      break;
    case "REPLACE":
      removeVNode(oldVNode);
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      // 深度的dom diff，新老虚拟DOM都存在且类型相同
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(VNode) {
  const currentDOM = findDomByVNode(VNode);
  if (currentDOM) {
    currentDOM.remove();
  }
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === "string",
    CLASS_COMPONENT:
        typeof oldVNode.type === "function" && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode.type === "function",
    TEXT: oldVNode.type === REACT_TEXT,
  };
  const DIFF_TYPE = Object.keys(diffTypeMap).filter(
      (key) => diffTypeMap[key]
  )[0];
  switch (DIFF_TYPE) {
    case "ORIGIN_NODE":
      const currentDOM = (newVNode.dom = findDomByVNode(oldVNode));
      setPropsForDOM(currentDOM, newVNode.props);
      updateChildren(
          currentDOM,
          oldVNode.props.children,
          newVNode.props.children
      );
      break;
    case "CLASS_COMPONENT":
      updateClassComponent(oldVNode, newVNode);
      break;
    case "FUNCTION_COMPONENT":
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case "TEXT":
      newVNode.dom = findDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    default:
      break;
  }
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstance = (newVNode.classInstance = oldVNode.classInstance);
  classInstance.updater.launchUpdate();
}

function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = findDomByVNode(oldVNode);
  if (!oldDOM) {
    return;
  }
  const {type, props} = newVNode;
  const newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

// DOM DIFF 算法的核心
function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = (
      Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]
  ).filter(Boolean);
  newVNodeChildren = (
      Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]
  ).filter(Boolean);

  let lastNotChangedIndex = -1;
  let oldKeyChildMap = {};
  oldVNodeChildren.forEach((oldVNode, index) => {
    const oldKey = oldVNode.key ? oldVNode.key : index;
    oldKeyChildMap[oldKey] = oldVNode;
  });

  // 遍历新的子虚拟DOM数组，找到可以复用但需要移动的节点、
  // 需要重新创建的节点、需要删除的节点，剩下的就是可以复用且不用移动的节点
  const actions = [];
  newVNodeChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    const newKey = newVNode.key ? newVNode.key : index;
    const oldVNode = oldKeyChildMap[newKey];
    if (oldVNode) {
      updateDomTree(oldVNode, newVNode, findDomByVNode(oldVNode));
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index,
        });
      }
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      actions.push({
        type: CREATE,
        newVNode,
        index,
      });
    }
  });

  const VNodeToMove = actions
      .filter((action) => action.type === MOVE)
      .map((action) => action.oldVNode);
  const VNodeToDelete = Object.values(oldKeyChildMap);
  VNodeToMove.concat(VNodeToDelete).forEach((oldVChild) => {
    const currentDOM = findDomByVNode(oldVChild);
    currentDOM.remove();
  });

  // 对需要移动以及需要重新创建的节点统一插入到正确的位置
  actions.forEach((action) => {
    const {type, oldVNode, newVNode, index} = action;
    const childNodes = parentDOM.childNodes;
    const childNode = childNodes[index];
    const getDomForInsert = () => {
      return type === CREATE ? createDOM(newVNode) : findDomByVNode(oldVNode);
    };
    if (childNode) {
      parentDOM.insertBefore(getDomForInsert(), childNode);
    } else {
      parentDOM.appendChild(getDomForInsert());
    }
  });
}

const ReactDOM = {
  render,
};

export default ReactDOM;
