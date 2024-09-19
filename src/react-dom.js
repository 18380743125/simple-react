import {REACT_ELEMENT, REACT_FORWARD_REF} from "./utils"
import {addEvent} from "./event";

function render(VNode, containerDOM) {
  // 将虚拟DOM转化成真实DOM
  // 将得到的真实DOM挂载到containerDOM中
  mount(VNode, containerDOM)
}


function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode)
  newDOM && containerDOM.appendChild(newDOM)
}

function createDOM(VNode) {
  // 1.创建元素
  const {type, props, ref} = VNode
  let dom

  if(type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode)
  }

  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT && type.IS_CLASS_COMPONENT) {
    return getDomByClassComponent(VNode)
  }

  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode)
  }

  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type)
  }

  // 2.创建子元素
  if (props.children?.type) {
    mount(props.children, dom)
  } else if (Array.isArray(props.children)) {
    mountArray(props.children, dom)
  } else {
    dom.appendChild(document.createTextNode(props.children))
  }

  VNode.dom = dom
  ref && (ref.current = dom)

  // 3.处理属性值
  setPropsForDOM(dom, props)
  return dom;
}

function getDomByForwardRefFunction(VNode) {
  const {type, props, ref} = VNode
  const renderVNode = type.render(props, ref)
  if (!renderVNode) {
    return
  }
  return createDOM(renderVNode)
}

function getDomByClassComponent(VNode) {
  const {type, props, ref} = VNode
  const instance = new type(props)
  const renderVNode = instance.render()
  instance.oldVNode = renderVNode
  ref && (ref.current = instance)
  if (!renderVNode) {
    return
  }
  return createDOM(renderVNode)
}

function getDomByFunctionComponent(VNode) {
  const {type, props} = VNode
  const renderVNode = type(props)
  if (!renderVNode) {
    return
  }
  return createDOM(renderVNode)
}

function setPropsForDOM(dom, props = {}) {
  if (!dom) {
    return
  }
  for (let key in props) {
    if (key === 'children') {
      continue
    }
    if (/^on[A-Z].*/.test(key)) {
      // TODO 处理事件
      addEvent(dom, key.toLowerCase(), props[key])
    } else if (key === 'style') {
      Object.keys(props[key]).forEach(styleName => {
        dom.style[styleName] = props[key][styleName]
      })
    } else {
      dom[key] = props[key]
    }
  }
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) {
    return
  }
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === 'string') {
      parent.appendChild(document.createTextNode(children[i]))
    } else {
      mount(children[i], parent)
    }
  }
}

export function findDomByVNode(VNode) {
  if (!VNode) {
    return
  }
  if (VNode.dom) {
    return VNode.dom
  }
}

export function updateDomTree(oldDOM, newVNode) {
  const parentNode = oldDOM.parentNode
  parentNode.removeChild(oldDOM)
  parentNode.appendChild(createDOM(newVNode))
}

const ReactDOM = {
  render
}

export default ReactDOM
