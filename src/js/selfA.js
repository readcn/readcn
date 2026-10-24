// 同站链接返回 url 并阻止默认跳转
export const selfA = (a_el, evt) => {
  const { target, host, pathname, search, hash } = a_el;
  if (!target && host == location.host) {
    evt.preventDefault();
    return pathname.slice(1) + search + hash;
  }
};
