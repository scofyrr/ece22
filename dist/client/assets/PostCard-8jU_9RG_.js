import { j as a, L as l } from "./index-C-CdgMgA.js";
import { H as c } from "./heart-Dl4SltYn.js";
import { c as n } from "./Navbar-BTC3bKq4.js";
function m({ post: e }) {
  const s = e.content.length > 180 ? e.content.slice(0, 180) + "…" : e.content;
  return a.jsxs(l, {
    to: "/post/$id",
    params: { id: e.id },
    className: "neo-card block overflow-hidden",
    children: [
      e.cover_image_url &&
        a.jsx("div", {
          className:
            "aspect-[16/9] w-full overflow-hidden border-b-2 border-ink",
          children: a.jsx("img", {
            src: e.cover_image_url,
            alt: e.title,
            className: "h-full w-full object-cover",
            loading: "lazy",
          }),
        }),
      a.jsxs("div", {
        className: "p-5",
        children: [
          a.jsxs("div", {
            className: "mb-3 flex flex-wrap items-center gap-2",
            children: [
              e.category &&
                a.jsxs("span", {
                  className: "chip bg-lemon",
                  children: [e.category.emoji, " ", e.category.name],
                }),
              e.author &&
                a.jsxs("span", {
                  className: "chip bg-mint",
                  children: [
                    "Lv ",
                    e.author.level,
                    " · ",
                    e.author.full_name.split(" ")[0],
                  ],
                }),
            ],
          }),
          a.jsx("h3", {
            className: "font-display text-2xl font-extrabold leading-tight",
            children: e.title,
          }),
          a.jsx("p", {
            className: "mt-2 text-sm text-muted-foreground",
            children: s,
          }),
          a.jsxs("div", {
            className: "mt-4 flex items-center gap-4 text-sm font-bold",
            children: [
              a.jsxs("span", {
                className: "inline-flex items-center gap-1",
                children: [
                  a.jsx(c, { className: "h-4 w-4" }),
                  " ",
                  e.likes_count,
                ],
              }),
              a.jsxs("span", {
                className: "inline-flex items-center gap-1",
                children: [
                  a.jsx(n, { className: "h-4 w-4" }),
                  " ",
                  e.comments_count,
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { m as P };
