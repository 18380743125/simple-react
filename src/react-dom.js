import {REACT_ELEMENT} from "./utils"
import {Component} from "./Component"

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
  const {type, props} = VNode
  let dom
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT && type.IS_CLASS_COMPONENT) {
    return getDomByClassComponent(VNode)
  } else if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode)
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type)
  }

  // 2.创建子元素
  if (props.children.type) {
    mount(props.children, dom)
  } else if (Array.isArray(props.children)) {
    mountArray(props.children, dom)
  } else {
    dom.appendChild(document.createTextNode(props.children))
  }

  // 3.处理属性值
  setPropsForDOM(dom, props)
  return dom;
}

function getDomByClassComponent(VNode) {
  const {type, props} = VNode
  const instance = new type(props)
  const renderVNode = instance.render()
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

const ReactDOM = {
  render
}

export default ReactDOM
