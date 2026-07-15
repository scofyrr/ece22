import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
function PostCard({ post }) {
  const excerpt =
    post.content.length > 180 ? post.content.slice(0, 180) + "…" : post.content;
  return /* @__PURE__ */ jsxs(Link, {
    to: "/post/$id",
    params: { id: post.id },
    className: "neo-card block overflow-hidden",
    children: [
      post.cover_image_url &&
        /* @__PURE__ */ jsx("div", {
          className:
            "aspect-[16/9] w-full overflow-hidden border-b-2 border-ink",
          children: /* @__PURE__ */ jsx("img", {
            src: post.cover_image_url,
            alt: post.title,
            className: "h-full w-full object-cover",
            loading: "lazy",
          }),
        }),
      /* @__PURE__ */ jsxs("div", {
        className: "p-5",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "mb-3 flex flex-wrap items-center gap-2",
            children: [
              post.category &&
                /* @__PURE__ */ jsxs("span", {
                  className: "chip bg-lemon",
                  children: [post.category.emoji, " ", post.category.name],
                }),
              post.author &&
                /* @__PURE__ */ jsxs("span", {
                  className: "chip bg-mint",
                  children: [
                    "Lv ",
                    post.author.level,
                    " · ",
                    post.author.full_name.split(" ")[0],
                  ],
                }),
            ],
          }),
          /* @__PURE__ */ jsx("h3", {
            className: "font-display text-2xl font-extrabold leading-tight",
            children: post.title,
          }),
          /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-sm text-muted-foreground",
            children: excerpt,
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "mt-4 flex items-center gap-4 text-sm font-bold",
            children: [
              /* @__PURE__ */ jsxs("span", {
                className: "inline-flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4" }),
                  " ",
                  post.likes_count,
                ],
              }),
              /* @__PURE__ */ jsxs("span", {
                className: "inline-flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
                  " ",
                  post.comments_count,
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { PostCard as P };
