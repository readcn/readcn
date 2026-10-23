import { On } from "../../js/On.js";

const KEEP_LI = ["", "blog"],
  pos_map = new Map(),
  scrollEl = (el) => el.shadowRoot.firstElementChild;

export default (scroll, urlGet) => {
  let is_loading = false;

  const target = scrollEl(scroll),
    save = (url) => {
      if (!is_loading && KEEP_LI.includes(url)) {
        pos_map.set(url, target.scrollTop);
      }
    },
    restore = (url) => {
      is_loading = false;
      const top = pos_map.get(url);
      target.scrollTop = KEEP_LI.includes(url) ? top || 0 : 0;
    },
    leave = (old_url) => {
      save(old_url);
      is_loading = true;
    },
    unScrollEvt = On(target, {
      scroll: () => save(urlGet())
    }),
    unLoadedEvt = On(scroll, {
      loaded: () => restore(urlGet())
    }),
    unScroll = () => {
      unScrollEvt();
      unLoadedEvt();
    };

  return [leave, restore, unScroll];
};
