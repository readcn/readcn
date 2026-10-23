import "../js/a.js";
import "./Back.js";
import "./Blog.js";
import "./I18n.js";
import "./Lg.js";
import "./Nav.js";
import "./Scroll.js";
import "./Toast.js";
import scrollInit from "./Site/scroll.js";
import i18nUrl, { TITLE } from "./Site/I18N.js";
import "./Site/_.styl";
import { D, cE, newLi } from "../js/dom.js";
import { fetchLang } from "../js/fetchLang.js";
import { route } from "../js/route.js";
import "../js/rmWait.js";

const BLOG_PREFIX = "blog/",
  RSS_LABEL = "RSS",
  fLang = fetchLang(i18nUrl),
  keyParse = (url) => {
    if (!url || url === "blog") return "";
    return url.startsWith(BLOG_PREFIX) ? url.slice(BLOG_PREFIX.length) : url;
  },
  rssUrl = (code) => "/rss/" + code + ".xml",
  domNew = (host) => {
    const [scroll, nav, nav_l, nav_r, back_el, rss_el, rss_ico, i18n_el, main_el, blog_el] = newLi(
      "c-vs",
      "nav",
      "c-nav",
      "c-nav",
      "c-back",
      "a",
      "i",
      "c-i18n",
      "main",
      "c-blog"
    );

    nav.className = "Nav";
    main_el.className = "demo Lg";
    back_el.setAttribute("href", "/");

    rss_el.className = "BtnC rss Lg";
    rss_el.href = "/rss.xml";
    rss_el.target = "_blank";
    rss_el.title = RSS_LABEL;
    rss_el.setAttribute("aria-label", RSS_LABEL);
    rss_ico.className = "Ico";
    rss_el.append(rss_ico);

    blog_el.prefix = "/";
    blog_el.mdUrl = (key, lang) => "/i18n/" + lang + "/" + key + ".md";

    nav_l.append(back_el);
    nav_r.append(rss_el, i18n_el);
    nav.append(nav_l, nav_r);
    main_el.append(blog_el);
    scroll.append(nav, main_el);
    host.append(scroll);

    return [scroll, back_el, rss_el, blog_el];
  },
  siteMount = (host) => {
    const [scroll, back_el, rss_el, blog_el] = domNew(host),
      rss_link = D.getElementById("rss");

    let cur_url = "";

    const [scrollSave, scrollRestore, unScroll] = scrollInit(scroll, () => cur_url),
      unRoute = route((url) => {
        scrollSave(cur_url);
        cur_url = url;
        const sub_key = keyParse(url);
        back_el.style.display = sub_key ? "" : "none";
        blog_el.load(sub_key);
        scrollRestore(url);
      }),
      unLang = fLang(async (i18n, code) => {
        const title = i18n[TITLE],
          feed_href = rssUrl(code);
        blog_el.title = title;
        rss_el.href = feed_href;
        if (rss_link) {
          rss_link.href = feed_href;
          rss_link.title = title;
        }
        const mod = await import(/* @vite-ignore */ `../_/blog/${code}.js`);
        blog_el._ = mod.default;
      });

    return () => {
      unRoute();
      unLang();
      unScroll();
    };
  };

cE(
  "site",
  class extends HTMLElement {
    connectedCallback() {
      this.$ = siteMount(this);
    }

    disconnectedCallback() {
      this.$();
    }
  }
);
