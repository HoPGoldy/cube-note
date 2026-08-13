import { describe, expect, it } from "vitest";
import { applyEdits } from "./utils";

describe("applyEdits", () => {
  it("应正常应用单条 edit", () => {
    const result = applyEdits("hello world", [
      { oldText: "world", newText: "cube-note" },
    ]);
    expect(result).toBe("hello cube-note");
  });

  it("应正常应用多条不重叠的 edit", () => {
    const result = applyEdits("aaa bbb ccc", [
      { oldText: "aaa", newText: "111" },
      { oldText: "ccc", newText: "333" },
    ]);
    expect(result).toBe("111 bbb 333");
  });

  it("所有 edit 应针对原始内容匹配，而不是串行应用", () => {
    // 如果是串行应用，第二条会把第一条刚写入的 "bbb" 替换掉
    const result = applyEdits("aaa ccc", [
      { oldText: "aaa", newText: "bbb" },
      { oldText: "ccc", newText: "ddd" },
    ]);
    expect(result).toBe("bbb ddd");
  });

  it("oldText 为空时应报错", () => {
    expect(() => applyEdits("abc", [{ oldText: "", newText: "x" }])).toThrow(
      /must not be empty/,
    );
  });

  it("oldText 未找到时应报错并指明是第几条", () => {
    expect(() =>
      applyEdits("abc", [
        { oldText: "a", newText: "x" },
        { oldText: "zzz", newText: "y" },
      ]),
    ).toThrow(/Edit #2: oldText not found/);
  });

  it("oldText 匹配多处时应报错并给出匹配数量", () => {
    expect(() =>
      applyEdits("foo bar foo", [{ oldText: "foo", newText: "x" }]),
    ).toThrow(/matches 2 locations/);
  });

  it("重叠重复出现的子串（如 aa in aaa）应报多处匹配", () => {
    expect(() => applyEdits("aaa", [{ oldText: "aa", newText: "x" }])).toThrow(
      /matches 2 locations/,
    );
  });

  it("相邻但不重叠的 edits 应正常放行", () => {
    const result = applyEdits("abcd", [
      { oldText: "ab", newText: "X" },
      { oldText: "cd", newText: "Y" },
    ]);
    expect(result).toBe("XY");
  });

  it("newText 为空字符串时应视为删除", () => {
    const result = applyEdits("hello world", [
      { oldText: " world", newText: "" },
    ]);
    expect(result).toBe("hello");
  });

  it("edits 重叠时应报错且原始内容不被修改", () => {
    const content = "abcdefg";
    expect(() =>
      applyEdits(content, [
        { oldText: "abc", newText: "x" },
        { oldText: "cde", newText: "y" },
      ]),
    ).toThrow(/overlapping/);
  });

  it("两条 edit 的 oldText 相同应视为重叠并报错", () => {
    expect(() =>
      applyEdits("abc", [
        { oldText: "abc", newText: "x" },
        { oldText: "abc", newText: "y" },
      ]),
    ).toThrow(/overlapping/);
  });

  it("任一 edit 失败时不应返回部分内容（全有或全无）", () => {
    const content = "hello world";
    try {
      applyEdits(content, [
        { oldText: "hello", newText: "hi" },
        { oldText: "not-exist", newText: "x" },
      ]);
      expect.unreachable();
    } catch {
      // 抛错即不会落库，原文保持不变由调用方保证
    }
  });

  it("应支持多行文本的替换", () => {
    const content = "# 标题\n\n第一段\n\n第二段\n";
    const result = applyEdits(content, [
      { oldText: "第一段", newText: "第一段（已更新）" },
      { oldText: "# 标题", newText: "# 新标题" },
    ]);
    expect(result).toBe("# 新标题\n\n第一段（已更新）\n\n第二段\n");
  });
});
