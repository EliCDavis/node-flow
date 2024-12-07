var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/theme.ts
var Theme = {
  FontFamily: "Courier New",
  Graph: {
    BackgroundColor: "#07212a"
  },
  Node: {
    FontColor: "#afb9bb",
    BackgroundColor: "#0c2b35",
    Title: {
      Color: "#154050",
      FontColor: "#afb9bb",
      Padding: 5
    },
    BorderRadius: 15,
    Border: {
      Idle: "#1c1c1c",
      MouseOver: "#8e8e8e",
      Grabbed: "white",
      Selected: "#6e6e6e"
    },
    Port: {
      FontColor: "#afb9bb"
    }
  },
  BoxSelect: {
    Color: "white",
    Size: 1,
    Radius: 2,
    LineDashLength: 5
  },
  Widget: {
    FontColor: "#afb9bb",
    BackgroundColor: "#0f313c",
    Border: {
      Color: "#154050",
      Size: 2,
      Radius: 2
    },
    Hover: {
      BackgroundColor: "#195366"
    },
    Slider: {
      FillColor: "#07212A"
    },
    Button: {
      Click: {
        BackgroundColor: "#1f637a"
      }
    }
  },
  ContextMenu: {
    BackgroundColor: "#07212A",
    HighlightColor: "#205A6D",
    FontColor: "#afb9bb"
  },
  Note: {
    FontColor: "#afb9bb",
    FontSize: 16,
    EntrySpacing: 20,
    LineSpacing: 5,
    DotSize: 3,
    HeaderLineWidth: 2,
    H1: {
      FontSize: 32
    },
    H2: {
      FontSize: 16
    },
    H3: {
      FontSize: 16
    },
    CodeBlock: {
      BackgroundColor: "#0c2b35",
      Padding: 16,
      BorderRadius: 4
    }
  }
};

// src/styles/text.ts
var _size, _color, _font, _weight, _fontStyle;
var FontWeight = /* @__PURE__ */ ((FontWeight3) => {
  FontWeight3["Normal"] = "";
  FontWeight3["Bold"] = "bold";
  return FontWeight3;
})(FontWeight || {});
var FontStyle = /* @__PURE__ */ ((FontStyle2) => {
  FontStyle2["Normal"] = "";
  FontStyle2["Italic"] = "italic";
  return FontStyle2;
})(FontStyle || {});
var DefaultSize = 16;
var DefaultColor = "black";
function TextStyleFallback(input, fallback) {
  return {
    color: (input == null ? void 0 : input.color) === void 0 ? fallback == null ? void 0 : fallback.color : input == null ? void 0 : input.color,
    size: (input == null ? void 0 : input.size) === void 0 ? fallback == null ? void 0 : fallback.size : input == null ? void 0 : input.size,
    font: (input == null ? void 0 : input.font) === void 0 ? fallback == null ? void 0 : fallback.font : input == null ? void 0 : input.font,
    style: (input == null ? void 0 : input.style) === void 0 ? fallback == null ? void 0 : fallback.style : input == null ? void 0 : input.style,
    weight: (input == null ? void 0 : input.weight) === void 0 ? fallback == null ? void 0 : fallback.weight : input == null ? void 0 : input.weight
  };
}
var TextStyle = class {
  constructor(config) {
    __privateAdd(this, _size, void 0);
    __privateAdd(this, _color, void 0);
    __privateAdd(this, _font, void 0);
    __privateAdd(this, _weight, void 0);
    __privateAdd(this, _fontStyle, void 0);
    __privateSet(this, _size, (config == null ? void 0 : config.size) === void 0 ? DefaultSize : config.size);
    __privateSet(this, _color, (config == null ? void 0 : config.color) === void 0 ? DefaultColor : config.color);
    __privateSet(this, _font, (config == null ? void 0 : config.font) === void 0 ? Theme.FontFamily : config.font);
    __privateSet(this, _weight, (config == null ? void 0 : config.weight) === void 0 ? "" /* Normal */ : config.weight);
    __privateSet(this, _fontStyle, (config == null ? void 0 : config.style) === void 0 ? "" /* Normal */ : config.style);
  }
  setupStyle(ctx, scale) {
    ctx.fillStyle = __privateGet(this, _color);
    ctx.font = __privateGet(this, _fontStyle) + " " + __privateGet(this, _weight) + " " + __privateGet(this, _size) * scale + "px " + __privateGet(this, _font);
  }
  getSize() {
    return __privateGet(this, _size);
  }
  getFont() {
    return __privateGet(this, _font);
  }
  measure(ctx, scale, text, out) {
    this.setupStyle(ctx, scale);
    const measurements = ctx.measureText(text);
    out.x = measurements.width;
    out.y = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;
  }
  setColor(color) {
    __privateSet(this, _color, color);
  }
  setSize(size) {
    __privateSet(this, _size, size);
  }
  setWeight(weight) {
    __privateSet(this, _weight, weight);
  }
};
_size = new WeakMap();
_color = new WeakMap();
_font = new WeakMap();
_weight = new WeakMap();
_fontStyle = new WeakMap();

// src/types/pool.ts
var _arr, _count, _builder, _reset, _runningDepth, _running, running_fn;
var Pool = class {
  constructor(builder, reset) {
    __privateAdd(this, _running);
    __privateAdd(this, _arr, void 0);
    __privateAdd(this, _count, void 0);
    __privateAdd(this, _builder, void 0);
    __privateAdd(this, _reset, void 0);
    __privateAdd(this, _runningDepth, void 0);
    __privateSet(this, _arr, new Array());
    __privateSet(this, _count, 0);
    __privateSet(this, _builder, builder);
    __privateSet(this, _reset, reset);
    __privateSet(this, _runningDepth, 0);
  }
  runIf(condition, fn) {
    if (condition) {
      this.run(fn);
    }
  }
  run(fn) {
    const start = __privateGet(this, _count);
    __privateSet(this, _runningDepth, __privateGet(this, _runningDepth) + 1);
    fn();
    __privateSet(this, _runningDepth, __privateGet(this, _runningDepth) - 1);
    __privateSet(this, _count, start);
  }
  get() {
    if (!__privateMethod(this, _running, running_fn).call(this)) {
      throw new Error("can't use pool outside of running context");
    }
    let value;
    if (__privateGet(this, _arr).length === __privateGet(this, _count)) {
      value = __privateGet(this, _builder).call(this);
      __privateGet(this, _arr).push(__privateGet(this, _builder).call(this));
    } else {
      value = __privateGet(this, _arr)[__privateGet(this, _count)];
      __privateGet(this, _reset).call(this, value);
    }
    __privateWrapper(this, _count)._++;
    return value;
  }
};
_arr = new WeakMap();
_count = new WeakMap();
_builder = new WeakMap();
_reset = new WeakMap();
_runningDepth = new WeakMap();
_running = new WeakSet();
running_fn = function() {
  return __privateGet(this, _runningDepth) > 0;
};
var VectorPool = new Pool(
  () => ({ x: 0, y: 0 }),
  (v) => {
    v.x = 0;
    v.y = 0;
  }
);

// src/types/vector2.ts
function CopyVector2(dst, src) {
  dst.x = src.x;
  dst.y = src.y;
}
function SubVector2(dst, a, b) {
  dst.x = a.x - b.x;
  dst.y = a.y - b.y;
}
function AddVector2(dst, a, b) {
  dst.x = a.x + b.x;
  dst.y = a.y + b.y;
}
function Zero() {
  return { x: 0, y: 0 };
}

// src/types/box.ts
function CopyBox(dst, src) {
  dst.Position.x = src.Position.x;
  dst.Position.y = src.Position.y;
  dst.Size.x = src.Size.x;
  dst.Size.y = src.Size.y;
}
function normalizeMinMax(min, max) {
  if (min.x > max.x) {
    let temp = max.x;
    max.x = min.x;
    min.x = temp;
  }
  if (min.y > max.y) {
    let temp = max.y;
    max.y = min.y;
    min.y = temp;
  }
}
function BoxIntersection(a, b) {
  let intersects = false;
  VectorPool.run(() => {
    const aMin = VectorPool.get();
    const aMax = VectorPool.get();
    CopyVector2(aMin, a.Position);
    AddVector2(aMax, aMin, a.Size);
    normalizeMinMax(aMin, aMax);
    const bMin = VectorPool.get();
    const bMax = VectorPool.get();
    CopyVector2(bMin, b.Position);
    AddVector2(bMax, bMin, b.Size);
    normalizeMinMax(bMin, bMax);
    intersects = aMin.x <= bMax.x && aMax.x >= bMin.x && aMin.y <= bMax.y && aMax.y >= bMin.y;
  });
  return intersects;
}
function BoxCenter(box, out) {
  out.x = box.Position.x + box.Size.x / 2;
  out.y = box.Position.y + box.Size.y / 2;
  return out;
}
function InBox(box, position) {
  const min = box.Position;
  if (position.x < min.x) {
    return false;
  }
  if (position.y < min.y) {
    return false;
  }
  if (position.x > min.x + box.Size.x) {
    return false;
  }
  if (position.y > min.y + box.Size.y) {
    return false;
  }
  return true;
}

// src/types/list.ts
var _arr2, _count2;
var List = class {
  constructor() {
    __privateAdd(this, _arr2, void 0);
    __privateAdd(this, _count2, void 0);
    __privateSet(this, _arr2, new Array());
    __privateSet(this, _count2, 0);
  }
  Count() {
    return __privateGet(this, _count2);
  }
  Clear() {
    __privateSet(this, _count2, 0);
  }
  At(index) {
    return __privateGet(this, _arr2)[index];
  }
  Push(value) {
    if (__privateGet(this, _arr2).length === __privateGet(this, _count2)) {
      __privateGet(this, _arr2).push(value);
    } else {
      __privateGet(this, _arr2)[__privateGet(this, _count2)] = value;
    }
    __privateWrapper(this, _count2)._++;
  }
  ToArray() {
    let arr = new Array(this.Count());
    for (let i = 0; i < __privateGet(this, _count2); i++) {
      arr[i] = __privateGet(this, _arr2)[i];
    }
    return arr;
  }
};
_arr2 = new WeakMap();
_count2 = new WeakMap();

// src/contextMenu.ts
var _name, _callback, _textStyle, _calculatedHeight, _name2, _items, _subMenus, _textStyle2, _groups, _group, _calculateEntries, calculateEntries_fn, _calculatedWidth, _getMaxWidthForText, getMaxWidthForText_fn, _tempBox, _openSubMenu, _submenuPosition;
var contextEntryHeight = 30;
var contextEntryWidth = 250;
var ContextMenuItem = class {
  constructor(config) {
    __privateAdd(this, _name, void 0);
    __privateAdd(this, _callback, void 0);
    __privateAdd(this, _textStyle, void 0);
    __privateSet(this, _name, (config == null ? void 0 : config.name) === void 0 ? "item" : config.name);
    __privateSet(this, _callback, config == null ? void 0 : config.callback);
    __privateSet(this, _textStyle, new TextStyle(config == null ? void 0 : config.textStyle));
    this.group = config == null ? void 0 : config.group;
  }
  getName() {
    return __privateGet(this, _name);
  }
  execute() {
    if (__privateGet(this, _callback) === void 0) {
      return;
    }
    __privateGet(this, _callback).call(this);
  }
};
_name = new WeakMap();
_callback = new WeakMap();
_textStyle = new WeakMap();
var ContextGroup = class {
  constructor(entries) {
    this.entries = entries;
    __privateAdd(this, _calculatedHeight, void 0);
    __privateSet(this, _calculatedHeight, entries.length * contextEntryHeight);
  }
  height() {
    return __privateGet(this, _calculatedHeight);
  }
};
_calculatedHeight = new WeakMap();
var ContextEntry = class {
  constructor(text, subMenu, item) {
    this.text = text;
    this.subMenu = subMenu;
    this.item = item;
  }
  click() {
    var _a;
    (_a = this.item) == null ? void 0 : _a.execute();
  }
};
function CombineContextMenus(...contextMenus) {
  var _a, _b;
  const finalConfig = {
    items: new Array(),
    subMenus: new Array()
  };
  for (let i = 0; i < contextMenus.length; i++) {
    const config = contextMenus[i];
    if (config === void 0) {
      continue;
    }
    if (config.items !== void 0) {
      finalConfig.items = (_a = finalConfig.items) == null ? void 0 : _a.concat(config.items);
    }
    if (config.subMenus !== void 0) {
      finalConfig.subMenus = (_b = finalConfig.subMenus) == null ? void 0 : _b.concat(config.subMenus);
    }
  }
  return finalConfig;
}
var _ContextMenu = class {
  constructor(config) {
    __privateAdd(this, _calculateEntries);
    __privateAdd(this, _getMaxWidthForText);
    __privateAdd(this, _name2, void 0);
    __privateAdd(this, _items, void 0);
    __privateAdd(this, _subMenus, void 0);
    __privateAdd(this, _textStyle2, void 0);
    __privateAdd(this, _groups, void 0);
    __privateAdd(this, _group, void 0);
    __privateAdd(this, _calculatedWidth, 0);
    __privateAdd(this, _tempBox, { Position: Zero(), Size: Zero() });
    __privateAdd(this, _openSubMenu, void 0);
    __privateAdd(this, _submenuPosition, void 0);
    __privateSet(this, _groups, new List());
    __privateSet(this, _name2, (config == null ? void 0 : config.name) === void 0 ? "menu" : config == null ? void 0 : config.name);
    __privateSet(this, _items, new Array());
    __privateSet(this, _subMenus, new Array());
    __privateSet(this, _textStyle2, new TextStyle(TextStyleFallback(config == null ? void 0 : config.textStyle, {
      color: Theme.ContextMenu.FontColor
    })));
    __privateSet(this, _group, config == null ? void 0 : config.group);
    if ((config == null ? void 0 : config.subMenus) !== void 0) {
      for (let i = 0; i < (config == null ? void 0 : config.subMenus.length); i++) {
        __privateGet(this, _subMenus).push(new _ContextMenu(config == null ? void 0 : config.subMenus[i]));
      }
    }
    if ((config == null ? void 0 : config.items) !== void 0) {
      for (let i = 0; i < (config == null ? void 0 : config.items.length); i++) {
        __privateGet(this, _items).push(new ContextMenuItem(config == null ? void 0 : config.items[i]));
      }
    }
    __privateMethod(this, _calculateEntries, calculateEntries_fn).call(this);
  }
  getName() {
    return __privateGet(this, _name2);
  }
  render(ctx, position, graphScale, mousePosition) {
    const menuScale = 1.25;
    const scaledEntryHeight = menuScale * contextEntryHeight;
    const scaledEntryWidth = menuScale * (__privateMethod(this, _getMaxWidthForText, getMaxWidthForText_fn).call(this, ctx, menuScale) + 20);
    let totalScaledHeight = 0;
    for (let i = 0; i < __privateGet(this, _groups).Count(); i++) {
      totalScaledHeight += __privateGet(this, _groups).At(i).height();
    }
    totalScaledHeight *= menuScale;
    __privateGet(this, _tempBox).Size.x = scaledEntryWidth;
    __privateGet(this, _tempBox).Size.y = scaledEntryHeight;
    __privateGet(this, _tempBox).Position.x = position.x;
    __privateGet(this, _tempBox).Position.y = position.y;
    ctx.textAlign = "left" /* Left */;
    ctx.fillStyle = Theme.ContextMenu.BackgroundColor;
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 5 * menuScale;
    ctx.beginPath();
    ctx.roundRect(
      position.x,
      __privateGet(this, _tempBox).Position.y,
      scaledEntryWidth,
      totalScaledHeight,
      5 * menuScale
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    let mouseIsOver = null;
    let subOpenedThisFrame = false;
    let optionsRendered = 0;
    for (let groupIndex = 0; groupIndex < __privateGet(this, _groups).Count(); groupIndex++) {
      const group = __privateGet(this, _groups).At(groupIndex);
      for (let entryIndex = 0; entryIndex < group.entries.length; entryIndex++) {
        const entry = group.entries[entryIndex];
        __privateGet(this, _tempBox).Position.y = position.y + scaledEntryHeight * optionsRendered;
        let entryMousedOver = false;
        if (mousePosition !== void 0 && InBox(__privateGet(this, _tempBox), mousePosition)) {
          mouseIsOver = entry;
          entryMousedOver = true;
          if (entry.subMenu !== void 0) {
            __privateSet(this, _openSubMenu, entry.subMenu);
            __privateSet(this, _submenuPosition, { x: position.x + scaledEntryWidth, y: __privateGet(this, _tempBox).Position.y });
            subOpenedThisFrame = true;
          } else {
            __privateSet(this, _openSubMenu, void 0);
          }
        }
        if (entryMousedOver || __privateGet(this, _openSubMenu) !== void 0 && entry.subMenu === __privateGet(this, _openSubMenu)) {
          ctx.fillStyle = Theme.ContextMenu.HighlightColor;
          ctx.beginPath();
          ctx.roundRect(
            position.x + scaledEntryHeight / 10,
            __privateGet(this, _tempBox).Position.y + scaledEntryHeight / 10,
            scaledEntryWidth - scaledEntryHeight / 5,
            scaledEntryHeight - scaledEntryHeight / 5,
            5 * menuScale
          );
          ctx.fill();
        }
        __privateGet(this, _textStyle2).setupStyle(ctx, menuScale);
        ctx.fillText(entry.text, position.x + scaledEntryHeight / 5, __privateGet(this, _tempBox).Position.y + scaledEntryHeight / 2);
        if (entry.subMenu !== void 0) {
          ctx.beginPath();
          ctx.strokeStyle = Theme.ContextMenu.FontColor;
          ctx.lineWidth = 1 * menuScale;
          ctx.lineTo(position.x + scaledEntryWidth - scaledEntryHeight / 2.5, __privateGet(this, _tempBox).Position.y + scaledEntryHeight / 3);
          ctx.lineTo(position.x + scaledEntryWidth - scaledEntryHeight / 4, __privateGet(this, _tempBox).Position.y + scaledEntryHeight / 2);
          ctx.lineTo(position.x + scaledEntryWidth - scaledEntryHeight / 2.5, __privateGet(this, _tempBox).Position.y + scaledEntryHeight - scaledEntryHeight / 3);
          ctx.stroke();
        }
        optionsRendered++;
      }
      if (groupIndex !== __privateGet(this, _groups).Count() - 1) {
        ctx.strokeStyle = Theme.ContextMenu.FontColor;
        ctx.lineWidth = 0.5 * menuScale;
        ctx.beginPath();
        const startX = position.x + scaledEntryHeight / 10;
        const y = __privateGet(this, _tempBox).Position.y + scaledEntryHeight;
        ctx.lineTo(startX, y);
        ctx.lineTo(startX + scaledEntryWidth - scaledEntryHeight / 5, y);
        ctx.stroke();
      }
    }
    if (__privateGet(this, _openSubMenu) !== void 0) {
      const mouseOverSub = __privateGet(this, _openSubMenu).render(ctx, __privateGet(this, _submenuPosition), menuScale, mousePosition);
      if (mouseOverSub !== null) {
        mouseIsOver = mouseOverSub;
      } else if (!subOpenedThisFrame) {
        __privateSet(this, _openSubMenu, void 0);
      }
    }
    return mouseIsOver;
  }
};
var ContextMenu = _ContextMenu;
_name2 = new WeakMap();
_items = new WeakMap();
_subMenus = new WeakMap();
_textStyle2 = new WeakMap();
_groups = new WeakMap();
_group = new WeakMap();
_calculateEntries = new WeakSet();
calculateEntries_fn = function() {
  const groupLUT = /* @__PURE__ */ new Map();
  const workingGroups = new Array();
  workingGroups.push(new Array());
  for (let i = 0; i < __privateGet(this, _items).length; i++) {
    let group = 0;
    const sub = __privateGet(this, _items)[i];
    if (sub.group !== void 0) {
      const groupIndex = groupLUT.get(sub.group);
      if (groupIndex !== void 0) {
        group = groupIndex;
      } else {
        group = workingGroups.length;
        groupLUT.set(sub.group, group);
        workingGroups.push(new Array());
      }
    }
    workingGroups[group].push(new ContextEntry(
      __privateGet(this, _items)[i].getName(),
      void 0,
      __privateGet(this, _items)[i]
    ));
  }
  for (let i = 0; i < __privateGet(this, _subMenus).length; i++) {
    let group = 0;
    const sub = __privateGet(this, _subMenus)[i];
    if (__privateGet(sub, _group) !== void 0) {
      const groupIndex = groupLUT.get(__privateGet(sub, _group));
      if (groupIndex !== void 0) {
        group = groupIndex;
      } else {
        group = workingGroups.length;
        groupLUT.set(__privateGet(sub, _group), group);
        workingGroups.push(new Array());
      }
    }
    workingGroups[group].push(new ContextEntry(
      __privateGet(this, _subMenus)[i].getName(),
      __privateGet(this, _subMenus)[i],
      void 0
    ));
  }
  __privateGet(this, _groups).Clear();
  for (let i = 0; i < workingGroups.length; i++) {
    const groupContent = workingGroups[i];
    if (groupContent.length === 0) {
      continue;
    }
    __privateGet(this, _groups).Push(new ContextGroup(groupContent));
  }
};
_calculatedWidth = new WeakMap();
_getMaxWidthForText = new WeakSet();
getMaxWidthForText_fn = function(ctx, scale) {
  if (__privateGet(this, _calculatedWidth) > 0) {
    return __privateGet(this, _calculatedWidth);
  }
  const tempVec = Zero();
  for (let groupIndex = 0; groupIndex < __privateGet(this, _groups).Count(); groupIndex++) {
    const group = __privateGet(this, _groups).At(groupIndex);
    for (let entryIndex = 0; entryIndex < group.entries.length; entryIndex++) {
      __privateGet(this, _textStyle2).measure(ctx, scale, group.entries[entryIndex].text, tempVec);
      __privateSet(this, _calculatedWidth, Math.max(tempVec.x, __privateGet(this, _calculatedWidth)));
    }
  }
  return __privateGet(this, _calculatedWidth);
};
_tempBox = new WeakMap();
_openSubMenu = new WeakMap();
_submenuPosition = new WeakMap();

// src/input.ts
var _clicked, _lastTouch, _ele, _lastMousePosition, _dragCallback, _moveCallback, _clickStart, _clickStop, _contextMenu, _mousePosition, mousePosition_fn, _move, move_fn, _moveTouch, moveTouch_fn, _down, down_fn, _touchDown, touchDown_fn, _up, up_fn;
var MouseObserver = class {
  constructor(ele, dragCallback, moveCallback, clickStart, clickStop, contextMenu, fileDrop) {
    __privateAdd(this, _mousePosition);
    __privateAdd(this, _move);
    __privateAdd(this, _moveTouch);
    __privateAdd(this, _down);
    __privateAdd(this, _touchDown);
    __privateAdd(this, _up);
    __privateAdd(this, _clicked, void 0);
    __privateAdd(this, _lastTouch, void 0);
    __privateAdd(this, _ele, void 0);
    __privateAdd(this, _lastMousePosition, void 0);
    __privateAdd(this, _dragCallback, void 0);
    __privateAdd(this, _moveCallback, void 0);
    __privateAdd(this, _clickStart, void 0);
    __privateAdd(this, _clickStop, void 0);
    __privateAdd(this, _contextMenu, void 0);
    __privateSet(this, _ele, ele);
    __privateSet(this, _dragCallback, dragCallback);
    __privateSet(this, _moveCallback, moveCallback);
    __privateSet(this, _clickStart, clickStart);
    __privateSet(this, _clickStop, clickStop);
    __privateSet(this, _contextMenu, contextMenu);
    __privateSet(this, _clicked, false);
    __privateSet(this, _lastTouch, Zero());
    __privateSet(this, _lastMousePosition, Zero());
    ele.addEventListener("mousedown", __privateMethod(this, _down, down_fn).bind(this), false);
    ele.addEventListener("touchstart", __privateMethod(this, _touchDown, touchDown_fn).bind(this), false);
    ele.addEventListener("mouseup", __privateMethod(this, _up, up_fn).bind(this), false);
    ele.addEventListener("touchend", __privateMethod(this, _up, up_fn).bind(this), false);
    ele.addEventListener("mousemove", __privateMethod(this, _move, move_fn).bind(this), false);
    ele.addEventListener("touchmove", __privateMethod(this, _moveTouch, moveTouch_fn).bind(this), false);
    ele.addEventListener("drop", (ev) => {
      var _a;
      ev.preventDefault();
      console.log(ev);
      if ((_a = ev.dataTransfer) == null ? void 0 : _a.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              fileDrop(file);
              console.log(file);
              console.log(`\u2026 file[${i}].name = ${file.name}`);
            }
          }
        });
      } else if (ev.dataTransfer) {
        [...ev.dataTransfer.files].forEach((file, i) => {
          console.log(`\u2026 file[${i}].name = ${file.name}`);
        });
      }
    });
    ele.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      __privateGet(this, _moveCallback).call(this, __privateMethod(this, _mousePosition, mousePosition_fn).call(this, ev));
    });
    ele.addEventListener("contextmenu", (evt) => {
      contextMenu(__privateMethod(this, _mousePosition, mousePosition_fn).call(this, evt));
      evt.preventDefault();
    }, false);
  }
};
_clicked = new WeakMap();
_lastTouch = new WeakMap();
_ele = new WeakMap();
_lastMousePosition = new WeakMap();
_dragCallback = new WeakMap();
_moveCallback = new WeakMap();
_clickStart = new WeakMap();
_clickStop = new WeakMap();
_contextMenu = new WeakMap();
_mousePosition = new WeakSet();
mousePosition_fn = function(event) {
  var rect = __privateGet(this, _ele).getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};
_move = new WeakSet();
move_fn = function(event) {
  const pos = __privateMethod(this, _mousePosition, mousePosition_fn).call(this, event);
  if (__privateGet(this, _clicked)) {
    const delta = Zero();
    SubVector2(delta, pos, __privateGet(this, _lastMousePosition));
    __privateGet(this, _dragCallback).call(this, delta);
  }
  __privateGet(this, _moveCallback).call(this, pos);
  CopyVector2(__privateGet(this, _lastMousePosition), pos);
};
_moveTouch = new WeakSet();
moveTouch_fn = function(event) {
  const rect = __privateGet(this, _ele).getBoundingClientRect();
  const pos = {
    x: event.touches[0].clientX - rect.left,
    y: event.touches[0].clientY - rect.top
  };
  __privateGet(this, _moveCallback).call(this, pos);
  if (__privateGet(this, _clicked)) {
    __privateGet(this, _dragCallback).call(this, {
      x: pos.x - __privateGet(this, _lastTouch).x,
      y: pos.y - __privateGet(this, _lastTouch).y
    });
  }
  CopyVector2(__privateGet(this, _lastTouch), pos);
};
_down = new WeakSet();
down_fn = function(event) {
  if (event.button !== 0) {
    return;
  }
  __privateSet(this, _clicked, true);
  __privateGet(this, _clickStart).call(this, __privateMethod(this, _mousePosition, mousePosition_fn).call(this, event), event.ctrlKey || event.shiftKey);
};
_touchDown = new WeakSet();
touchDown_fn = function(event) {
  __privateSet(this, _clicked, true);
  const rect = __privateGet(this, _ele).getBoundingClientRect();
  __privateGet(this, _lastTouch).x = event.touches[0].clientX - rect.left;
  __privateGet(this, _lastTouch).y = event.touches[0].clientY - rect.top;
  __privateGet(this, _clickStart).call(this, __privateGet(this, _lastTouch), false);
};
_up = new WeakSet();
up_fn = function(event) {
  if (event.button !== 0) {
    return;
  }
  __privateSet(this, _clicked, false);
  __privateGet(this, _clickStop).call(this);
};

// src/utils/math.ts
function Clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
function Clamp01(v) {
  return Clamp(v, 0, 1);
}

// src/utils/color.ts
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function RgbToHex(c) {
  return "#" + componentToHex(Math.round(c.r * 255)) + componentToHex(Math.round(c.g * 255)) + componentToHex(Math.round(c.b * 255));
}
function HexToColor(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}
function HSV2RGB(hsv, out) {
  if (hsv.s <= 0) {
    out.r = hsv.v;
    out.g = hsv.v;
    out.b = hsv.v;
    return;
  }
  let hh = hsv.h;
  if (hh >= 360) {
    hh = 0;
  }
  hh /= 60;
  const i = Math.round(hh);
  const ff = hh - i;
  const p = hsv.v * (1 - hsv.s);
  const q = hsv.v * (1 - hsv.s * ff);
  const t = hsv.v * (1 - hsv.s * (1 - ff));
  switch (i) {
    case 0:
      out.r = hsv.v;
      out.g = t;
      out.b = p;
      break;
    case 1:
      out.r = q;
      out.g = hsv.v;
      out.b = p;
      break;
    case 2:
      out.r = p;
      out.g = hsv.v;
      out.b = t;
      break;
    case 3:
      out.r = p;
      out.g = q;
      out.b = hsv.v;
      break;
    case 4:
      out.r = t;
      out.g = p;
      out.b = hsv.v;
      break;
    default:
      out.r = hsv.v;
      out.g = p;
      out.b = q;
      break;
  }
  out.r = Clamp01(out.r);
  out.g = Clamp01(out.g);
  out.b = Clamp01(out.b);
}
function RGB2HSV(rgb, out) {
  out.h = 0;
  out.s = 0;
  out.v = 0;
  let min = 0;
  let max = 0;
  let delta = 0;
  min = rgb.r < rgb.g ? rgb.r : rgb.g;
  min = min < rgb.b ? min : rgb.b;
  max = rgb.r > rgb.g ? rgb.r : rgb.g;
  max = max > rgb.b ? max : rgb.b;
  out.v = max;
  delta = max - min;
  if (delta < 1e-5) {
    out.s = 0;
    out.h = 0;
    return;
  }
  if (max > 0) {
    out.s = delta / max;
  } else {
    out.s = 0;
    out.h = NaN;
    return;
  }
  if (rgb.r >= max)
    out.h = (rgb.g - rgb.b) / delta;
  else if (rgb.g >= max)
    out.h = 2 + (rgb.b - rgb.r) / delta;
  else
    out.h = 4 + (rgb.r - rgb.g) / delta;
  out.h *= 60;
  if (out.h < 0)
    out.h += 360;
}

// src/port.ts
var _node, _displayName, _emptyStyle, _filledStyle, _connections, _portType, _dataType, _onConnectionAdded, _onConnectionRemoved, _box;
var PortType = /* @__PURE__ */ ((PortType2) => {
  PortType2["Input"] = "INPUT";
  PortType2["Output"] = "OUTPUT";
  PortType2["InputArray"] = "INPUTARRAY";
  return PortType2;
})(PortType || {});
;
function fallbackColor(type, s) {
  let value = 0;
  for (var i = 0; i < type.length; i++) {
    value += type.charCodeAt(i) * (i + 1);
  }
  const mod = 24;
  value = Math.round(value) % mod;
  const hsv = { h: value / (mod - 1) * 360, s, v: 1 };
  const color = { r: 0, g: 0, b: 0 };
  HSV2RGB(hsv, color);
  return RgbToHex(color);
}
var Port = class {
  constructor(node, portType, config) {
    __privateAdd(this, _node, void 0);
    __privateAdd(this, _displayName, void 0);
    __privateAdd(this, _emptyStyle, void 0);
    __privateAdd(this, _filledStyle, void 0);
    __privateAdd(this, _connections, void 0);
    __privateAdd(this, _portType, void 0);
    __privateAdd(this, _dataType, void 0);
    __privateAdd(this, _onConnectionAdded, void 0);
    __privateAdd(this, _onConnectionRemoved, void 0);
    __privateAdd(this, _box, { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } });
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    __privateSet(this, _node, node);
    __privateSet(this, _connections, new Array());
    __privateSet(this, _portType, portType);
    __privateSet(this, _displayName, (config == null ? void 0 : config.name) === void 0 ? "Port" : config == null ? void 0 : config.name);
    __privateSet(this, _dataType, (config == null ? void 0 : config.type) === void 0 ? "" : config == null ? void 0 : config.type);
    __privateSet(this, _emptyStyle, {
      borderColor: ((_a = config == null ? void 0 : config.emptyStyle) == null ? void 0 : _a.borderColor) === void 0 ? "#1c1c1c" : (_b = config.emptyStyle) == null ? void 0 : _b.borderColor,
      fillColor: ((_c = config == null ? void 0 : config.emptyStyle) == null ? void 0 : _c.fillColor) === void 0 ? fallbackColor(__privateGet(this, _dataType), 0.3) : (_d = config.emptyStyle) == null ? void 0 : _d.fillColor,
      borderSize: ((_e = config == null ? void 0 : config.emptyStyle) == null ? void 0 : _e.borderSize) === void 0 ? 1 : (_f = config.emptyStyle) == null ? void 0 : _f.borderSize,
      size: ((_g = config == null ? void 0 : config.emptyStyle) == null ? void 0 : _g.size) === void 0 ? 4 : (_h = config.emptyStyle) == null ? void 0 : _h.size
    });
    __privateSet(this, _filledStyle, {
      borderColor: ((_i = config == null ? void 0 : config.filledStyle) == null ? void 0 : _i.borderColor) === void 0 ? "#1c1c1c" : (_j = config.filledStyle) == null ? void 0 : _j.borderColor,
      fillColor: ((_k = config == null ? void 0 : config.filledStyle) == null ? void 0 : _k.fillColor) === void 0 ? fallbackColor(__privateGet(this, _dataType), 1) : (_l = config.filledStyle) == null ? void 0 : _l.fillColor,
      borderSize: ((_m = config == null ? void 0 : config.filledStyle) == null ? void 0 : _m.borderSize) === void 0 ? 1 : (_n = config.filledStyle) == null ? void 0 : _n.borderSize,
      size: ((_o = config == null ? void 0 : config.filledStyle) == null ? void 0 : _o.size) === void 0 ? 5 : (_p = config.filledStyle) == null ? void 0 : _p.size
    });
    __privateSet(this, _onConnectionAdded, new Array());
    if (config == null ? void 0 : config.onConnectionAdded) {
      __privateGet(this, _onConnectionAdded).push(config == null ? void 0 : config.onConnectionAdded);
    }
    __privateSet(this, _onConnectionRemoved, new Array());
    if (config == null ? void 0 : config.onConnectionRemoved) {
      __privateGet(this, _onConnectionRemoved).push(config == null ? void 0 : config.onConnectionRemoved);
    }
  }
  addConnection(connection) {
    __privateGet(this, _connections).push(connection);
    for (let i = 0; i < __privateGet(this, _onConnectionAdded).length; i++) {
      __privateGet(this, _onConnectionAdded)[i](connection, this, __privateGet(this, _portType), __privateGet(this, _node));
    }
  }
  addConnectionAddedListener(callback) {
    __privateGet(this, _onConnectionAdded).push(callback);
  }
  addConnectionRemovedListener(callback) {
    __privateGet(this, _onConnectionRemoved).push(callback);
  }
  clearConnection(connection) {
    const index = __privateGet(this, _connections).indexOf(connection);
    if (index > -1) {
      __privateGet(this, _connections).splice(index, 1);
      for (let i = 0; i < __privateGet(this, _onConnectionRemoved).length; i++) {
        __privateGet(this, _onConnectionRemoved)[i](connection, this, __privateGet(this, _portType), __privateGet(this, _node));
      }
    } else {
      console.error("no connection found to remove");
    }
  }
  getType() {
    return __privateGet(this, _dataType);
  }
  getDisplayName() {
    return __privateGet(this, _displayName);
  }
  filledStyleColor() {
    if (__privateGet(this, _filledStyle).fillColor === void 0) {
      console.error("There's no fill color!!!!!!!!!");
      return "black";
    }
    return __privateGet(this, _filledStyle).fillColor;
  }
  render(ctx, position, camera, mousePosition) {
    let style = __privateGet(this, _emptyStyle);
    if (__privateGet(this, _connections).length > 0) {
      style = __privateGet(this, _filledStyle);
    }
    let radius = style.size * camera.zoom;
    if (mousePosition && InBox(__privateGet(this, _box), mousePosition)) {
      radius *= 1.25;
      ctx.textAlign = "center" /* Center */;
      ctx.fillText(__privateGet(this, _dataType), position.x, position.y + radius * 3);
    }
    __privateGet(this, _box).Position.x = position.x - radius;
    __privateGet(this, _box).Position.y = position.y - radius;
    __privateGet(this, _box).Size.x = radius * 2;
    __privateGet(this, _box).Size.y = radius * 2;
    ctx.strokeStyle = style.borderColor;
    ctx.fillStyle = style.fillColor;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return __privateGet(this, _box);
  }
};
_node = new WeakMap();
_displayName = new WeakMap();
_emptyStyle = new WeakMap();
_filledStyle = new WeakMap();
_connections = new WeakMap();
_portType = new WeakMap();
_dataType = new WeakMap();
_onConnectionAdded = new WeakMap();
_onConnectionRemoved = new WeakMap();
_box = new WeakMap();

// src/styles/stroke.ts
var _size2, _color2;
function StrokeStyleWithFallback(input, fallback) {
  return {
    color: (input == null ? void 0 : input.color) === void 0 ? fallback == null ? void 0 : fallback.color : input == null ? void 0 : input.color,
    size: (input == null ? void 0 : input.size) === void 0 ? fallback == null ? void 0 : fallback.size : input == null ? void 0 : input.size
  };
}
var StrokeStyle = class {
  constructor(config) {
    __privateAdd(this, _size2, void 0);
    __privateAdd(this, _color2, void 0);
    __privateSet(this, _size2, (config == null ? void 0 : config.size) === void 0 ? 0.5 : config.size);
    __privateSet(this, _color2, (config == null ? void 0 : config.color) === void 0 ? "black" : config.color);
  }
  setupStyle(ctx, scale) {
    ctx.strokeStyle = __privateGet(this, _color2);
    ctx.lineWidth = scale * __privateGet(this, _size2);
  }
  setColor(newColor) {
    __privateSet(this, _color2, newColor);
  }
  setSize(newSize) {
    __privateSet(this, _size2, newSize);
  }
  size() {
    return __privateGet(this, _size2);
  }
};
_size2 = new WeakMap();
_color2 = new WeakMap();

// src/styles/box.ts
var _border, _color3, _radius, _box2, box_fn, _draw, draw_fn;
function BoxStyleWithFallback(input, fallback) {
  return {
    radius: (input == null ? void 0 : input.radius) === void 0 ? fallback == null ? void 0 : fallback.radius : input == null ? void 0 : input.radius,
    color: (input == null ? void 0 : input.color) === void 0 ? fallback == null ? void 0 : fallback.color : input == null ? void 0 : input.color,
    border: StrokeStyleWithFallback(input == null ? void 0 : input.border, fallback == null ? void 0 : fallback.border)
  };
}
var BoxStyle = class {
  constructor(config) {
    __privateAdd(this, _box2);
    __privateAdd(this, _draw);
    __privateAdd(this, _border, void 0);
    __privateAdd(this, _color3, void 0);
    __privateAdd(this, _radius, void 0);
    __privateSet(this, _color3, (config == null ? void 0 : config.color) === void 0 ? "#CCCCCC" : config.color);
    __privateSet(this, _border, (config == null ? void 0 : config.border) === void 0 ? null : new StrokeStyle(config.border));
    __privateSet(this, _radius, (config == null ? void 0 : config.radius) === void 0 ? 2 : config.radius);
  }
  Outline(ctx, box, scale, radius) {
    var _a;
    (_a = __privateGet(this, _border)) == null ? void 0 : _a.setupStyle(ctx, scale);
    ctx.beginPath();
    ctx.roundRect(
      box.Position.x,
      box.Position.y,
      box.Size.x,
      box.Size.y,
      radius
    );
    ctx.stroke();
  }
  Draw(ctx, box, scale) {
    __privateMethod(this, _draw, draw_fn).call(this, ctx, box, scale, __privateGet(this, _radius) * scale);
  }
  DrawRoundedTopOnly(ctx, box, scale) {
    __privateMethod(this, _draw, draw_fn).call(this, ctx, box, scale, [__privateGet(this, _radius) * scale * 2, __privateGet(this, _radius) * scale * 2, 0, 0]);
  }
  DrawUnderline(ctx, box, scale) {
    __privateMethod(this, _box2, box_fn).call(this, ctx, box, scale, [__privateGet(this, _radius) * scale * 2, __privateGet(this, _radius) * scale * 2, 0, 0]);
    ctx.beginPath();
    ctx.moveTo(box.Position.x, box.Position.y + box.Size.y);
    ctx.lineTo(box.Position.x + box.Size.x, box.Position.y + box.Size.y);
    ctx.stroke();
  }
  borderSize() {
    if (__privateGet(this, _border) === null) {
      return 0;
    }
    return __privateGet(this, _border).size();
  }
  radius() {
    return __privateGet(this, _radius);
  }
  setColor(color) {
    __privateSet(this, _color3, color);
  }
  setBorderColor(color) {
    if (__privateGet(this, _border) === null) {
      __privateSet(this, _border, new StrokeStyle({
        color
      }));
    } else {
      __privateGet(this, _border).setColor(color);
    }
  }
};
_border = new WeakMap();
_color3 = new WeakMap();
_radius = new WeakMap();
_box2 = new WeakSet();
box_fn = function(ctx, box, scale, radius) {
  var _a;
  ctx.fillStyle = __privateGet(this, _color3);
  (_a = __privateGet(this, _border)) == null ? void 0 : _a.setupStyle(ctx, scale);
  ctx.beginPath();
  ctx.roundRect(
    box.Position.x,
    box.Position.y,
    box.Size.x,
    box.Size.y,
    radius
  );
  ctx.fill();
};
_draw = new WeakSet();
draw_fn = function(ctx, box, scale, radius) {
  __privateMethod(this, _box2, box_fn).call(this, ctx, box, scale, radius);
  ctx.stroke();
};

// src/utils/string.ts
var binarySearch = ({ max, getValue, match }) => {
  let min = 0;
  while (min <= max) {
    let guess = Math.floor((min + max) / 2);
    const compareVal = getValue(guess);
    if (compareVal === match)
      return guess;
    if (compareVal < match)
      min = guess + 1;
    else
      max = guess - 1;
  }
  return max;
};
function fitString(ctx, str, maxWidth) {
  let width2 = ctx.measureText(str).width;
  const ellipsis = "\u2026";
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  if (width2 <= maxWidth || width2 <= ellipsisWidth) {
    return str;
  }
  const index = binarySearch({
    max: str.length,
    getValue: (guess) => ctx.measureText(str.substring(0, guess)).width,
    match: maxWidth - ellipsisWidth
  });
  return str.substring(0, index) + ellipsis;
}
;
function splitString(ctx, str, maxWidth) {
  let width2 = ctx.measureText(str).width;
  if (width2 <= maxWidth) {
    return [str];
  }
  let index = binarySearch({
    max: str.length,
    getValue: (guess) => ctx.measureText(str.substring(0, guess)).width,
    match: maxWidth
  });
  for (let backward = index - 1; backward >= 1; backward--) {
    if (str.charAt(backward) === " ") {
      index = backward + 1;
      break;
    }
  }
  return [str.substring(0, index), str.substring(index)];
}
;
function splitStringIntoLines(ctx, str, maxWidth) {
  let width2 = ctx.measureText(str).width;
  if (width2 <= maxWidth) {
    return [str];
  }
  const strings = new Array();
  let remaining = str;
  while (remaining !== "") {
    let index = binarySearch({
      max: remaining.length,
      getValue: (guess) => ctx.measureText(remaining.substring(0, guess)).width,
      match: maxWidth
    });
    if (index === remaining.length) {
      strings.push(remaining.substring(0, index));
      break;
    }
    for (let backward = index - 1; backward >= 1; backward--) {
      if (remaining.charAt(backward) === " ") {
        index = backward + 1;
        break;
      }
    }
    strings.push(remaining.substring(0, index));
    remaining = remaining.substring(index);
  }
  return strings;
}
;
function Format(str, ...args) {
  if (arguments.length) {
    for (let key in args) {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }
  }
  return str;
}
;

// src/types/text.ts
var _measured, _size3, _style, _value, _measure, measure_fn;
var _Text = class {
  constructor(value, style) {
    __privateAdd(this, _measure);
    __privateAdd(this, _measured, void 0);
    __privateAdd(this, _size3, void 0);
    __privateAdd(this, _style, void 0);
    __privateAdd(this, _value, void 0);
    __privateSet(this, _value, value);
    __privateSet(this, _measured, false);
    __privateSet(this, _size3, Zero());
    __privateSet(this, _style, new TextStyle(style));
    if (!document.fonts.check(`16px "${__privateGet(this, _style).getFont()}"`)) {
      document.fonts.addEventListener("loadingdone", (event) => {
        __privateSet(this, _measured, false);
      });
    }
  }
  set(newValue) {
    __privateSet(this, _value, newValue);
    __privateSet(this, _measured, false);
  }
  get() {
    return __privateGet(this, _value);
  }
  breakIntoLines(ctx, maxWidth) {
    const results = new Array();
    __privateGet(this, _style).setupStyle(ctx, 1);
    const entries = splitStringIntoLines(ctx, __privateGet(this, _value), maxWidth);
    if (entries.length === 1) {
      return [this];
    }
    for (let i = 0; i < entries.length; i++) {
      const text = new _Text(entries[i]);
      __privateSet(text, _style, __privateGet(this, _style));
      results.push(text);
    }
    return results;
  }
  split(char) {
    const entries = __privateGet(this, _value).split(char);
    const results = new Array();
    for (let i = 0; i < entries.length; i++) {
      const text = new _Text(entries[i]);
      __privateSet(text, _style, __privateGet(this, _style));
      results.push(text);
    }
    return results;
  }
  splitAtIndex(index) {
    const results = [
      new _Text(__privateGet(this, _value).substring(0, index)),
      new _Text(__privateGet(this, _value).substring(index, 0))
    ];
    for (let i = 0; i < results.length; i++) {
      __privateSet(results[i], _style, __privateGet(this, _style));
    }
    return results;
  }
  splitAtWidth(ctx, maxWidth) {
    __privateGet(this, _style).setupStyle(ctx, 1);
    const entries = splitString(ctx, __privateGet(this, _value), maxWidth);
    if (entries.length === 1) {
      return [this];
    }
    const results = new Array();
    for (let i = 0; i < entries.length; i++) {
      const text = new _Text(entries[i]);
      __privateSet(text, _style, __privateGet(this, _style));
      results.push(text);
    }
    return results;
  }
  size(ctx, scale, out) {
    __privateMethod(this, _measure, measure_fn).call(this, ctx);
    CopyVector2(out, __privateGet(this, _size3));
    out.x *= scale;
    out.y *= scale;
  }
  setColor(color) {
    __privateGet(this, _style).setColor(color);
  }
  setSize(size) {
    __privateGet(this, _style).setSize(size);
  }
  setWeight(weight) {
    __privateGet(this, _style).setWeight(weight);
  }
  render(ctx, scale, position) {
    __privateGet(this, _style).setupStyle(ctx, scale);
    ctx.fillText(__privateGet(this, _value), position.x, position.y);
  }
  style() {
    return __privateGet(this, _style);
  }
};
var Text = _Text;
_measured = new WeakMap();
_size3 = new WeakMap();
_style = new WeakMap();
_value = new WeakMap();
_measure = new WeakSet();
measure_fn = function(ctx) {
  if (__privateGet(this, _measured)) {
    return;
  }
  __privateGet(this, _style).setupStyle(ctx, 1);
  const measurements = ctx.measureText(__privateGet(this, _value));
  __privateGet(this, _size3).x = measurements.width;
  __privateGet(this, _size3).y = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;
  __privateSet(this, _measured, true);
};

// src/popup.ts
var _title, _options, _content, _onClose, _buttonCSS, _popup;
var Popup = class {
  constructor(config) {
    __privateAdd(this, _title, void 0);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _content, void 0);
    __privateAdd(this, _onClose, void 0);
    __privateAdd(this, _buttonCSS, void 0);
    __privateAdd(this, _popup, void 0);
    __privateSet(this, _title, config.title);
    __privateSet(this, _options, config.options);
    __privateSet(this, _content, config.content);
    __privateSet(this, _onClose, config.onClose);
    __privateSet(this, _buttonCSS, config.buttonCSS === void 0 ? "flex-grow: 1; margin-right: 8px;" : config.buttonCSS);
    __privateSet(this, _popup, null);
  }
  Hide() {
    if (__privateGet(this, _popup) === null) {
      return;
    }
    document.body.removeChild(__privateGet(this, _popup));
    __privateSet(this, _popup, null);
  }
  Show() {
    __privateSet(this, _popup, document.createElement("div"));
    __privateGet(this, _popup).style.cssText = "position:absolute;top:0;width:100%;display:flex;height:100%;justify-content:center;align-items:center;background-color:#00000070;";
    document.body.appendChild(__privateGet(this, _popup));
    const container = document.createElement("div");
    container.style.cssText = "background-color:#000;color:white;font-family:Verdana;border-radius:8px;padding:16px;";
    __privateGet(this, _popup).appendChild(container);
    const title = document.createElement("h2");
    title.textContent = __privateGet(this, _title);
    title.style.cssText = "margin-top:0;margin-bottom:16px;";
    container.appendChild(title);
    if (__privateGet(this, _content) !== void 0) {
      container.appendChild(__privateGet(this, _content).call(this));
    }
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = "margin-top:16px;justify-content:space-around;align-items:center;flex-direction:row;display:flex;";
    container.appendChild(buttonContainer);
    for (let i = 0; i < __privateGet(this, _options).length; i++) {
      const button = document.createElement("button");
      button.style.cssText = __privateGet(this, _buttonCSS);
      button.textContent = __privateGet(this, _options)[i];
      button.onclick = () => {
        this.Hide();
        if (__privateGet(this, _onClose) !== void 0) {
          __privateGet(this, _onClose).call(this, __privateGet(this, _options)[i]);
        }
      };
      buttonContainer.appendChild(button);
    }
  }
};
_title = new WeakMap();
_options = new WeakMap();
_content = new WeakMap();
_onClose = new WeakMap();
_buttonCSS = new WeakMap();
_popup = new WeakMap();

// src/styles/textBox.ts
var _box3, _text, _textAlign, _textBaseline;
function TextBoxStyleWithFallback(input, fallback) {
  return {
    box: BoxStyleWithFallback(input == null ? void 0 : input.box, fallback == null ? void 0 : fallback.box),
    text: TextStyleFallback(input == null ? void 0 : input.text, fallback == null ? void 0 : fallback.text),
    textAlign: (input == null ? void 0 : input.textAlign) === void 0 ? fallback == null ? void 0 : fallback.textAlign : input == null ? void 0 : input.textAlign,
    textBaseline: (input == null ? void 0 : input.textBaseline) === void 0 ? fallback == null ? void 0 : fallback.textBaseline : input == null ? void 0 : input.textBaseline
  };
}
var TextBoxStyle = class {
  constructor(config) {
    __privateAdd(this, _box3, void 0);
    __privateAdd(this, _text, void 0);
    __privateAdd(this, _textAlign, void 0);
    __privateAdd(this, _textBaseline, void 0);
    __privateSet(this, _box3, new BoxStyle(config == null ? void 0 : config.box));
    __privateSet(this, _text, new TextStyle(config == null ? void 0 : config.text));
    __privateSet(this, _textAlign, (config == null ? void 0 : config.textAlign) === void 0 ? "center" /* Center */ : config.textAlign);
    __privateSet(this, _textBaseline, (config == null ? void 0 : config.textBaseline) === void 0 ? "middle" /* Middle */ : config.textBaseline);
  }
  Draw(ctx, box, scale, text) {
    __privateGet(this, _box3).Draw(ctx, box, scale);
    ctx.textAlign = __privateGet(this, _textAlign);
    ctx.textBaseline = __privateGet(this, _textBaseline);
    __privateGet(this, _text).setupStyle(ctx, scale);
    ctx.fillText(
      text,
      box.Position.x + box.Size.x / 2,
      box.Position.y + box.Size.y / 2
    );
  }
  DrawUnderline(ctx, box, scale, text) {
    __privateGet(this, _box3).DrawUnderline(ctx, box, scale);
    ctx.textAlign = __privateGet(this, _textAlign);
    ctx.textBaseline = __privateGet(this, _textBaseline);
    __privateGet(this, _text).setupStyle(ctx, scale);
    ctx.fillText(
      text,
      box.Position.x + box.Size.x / 2,
      box.Position.y + box.Size.y / 2
    );
  }
  setTextColor(color) {
    __privateGet(this, _text).setColor(color);
  }
  setBoxColor(color) {
    __privateGet(this, _box3).setColor(color);
  }
  setBorderColor(color) {
    __privateGet(this, _box3).setBorderColor(color);
  }
};
_box3 = new WeakMap();
_text = new WeakMap();
_textAlign = new WeakMap();
_textBaseline = new WeakMap();

// src/widgets/widget.ts
var width = 150;
var height = 25;

// src/widgets/number.ts
var _node2, _nodeProperty, _value2, _idleBoxStyle, _highlightBoxStyle, _text2, _callback2;
var NumberWidget = class {
  constructor(node, config) {
    __privateAdd(this, _node2, void 0);
    __privateAdd(this, _nodeProperty, void 0);
    __privateAdd(this, _value2, void 0);
    __privateAdd(this, _idleBoxStyle, void 0);
    __privateAdd(this, _highlightBoxStyle, void 0);
    __privateAdd(this, _text2, void 0);
    __privateAdd(this, _callback2, void 0);
    __privateSet(this, _node2, node);
    __privateSet(this, _nodeProperty, config == null ? void 0 : config.property);
    __privateSet(this, _idleBoxStyle, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.idleBoxStyle, {
      box: {
        color: Theme.Widget.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        },
        radius: Theme.Widget.Border.Radius
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _highlightBoxStyle, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.highlightBoxStyle, {
      box: {
        color: Theme.Widget.Hover.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        },
        radius: Theme.Widget.Border.Radius
      },
      text: { color: Theme.Widget.FontColor }
    })));
    this.Set((config == null ? void 0 : config.value) === void 0 ? 0 : config == null ? void 0 : config.value);
    __privateSet(this, _callback2, config == null ? void 0 : config.callback);
    if (__privateGet(this, _nodeProperty) !== void 0) {
      __privateGet(this, _node2).addPropertyChangeListener(__privateGet(this, _nodeProperty), (oldVal, newVal) => {
        this.Set(newVal);
      });
    }
  }
  Size() {
    return { "x": width, "y": height };
  }
  Set(newNumber) {
    if (__privateGet(this, _value2) === newNumber) {
      return;
    }
    __privateSet(this, _value2, newNumber);
    if (__privateGet(this, _nodeProperty) !== void 0) {
      __privateGet(this, _node2).setProperty(__privateGet(this, _nodeProperty), __privateGet(this, _value2));
    }
    if (__privateGet(this, _callback2) !== void 0) {
      __privateGet(this, _callback2).call(this, __privateGet(this, _value2));
    }
    __privateSet(this, _text2, "" + parseFloat(__privateGet(this, _value2).toPrecision(6)));
  }
  ClickStart() {
  }
  ClickEnd() {
    let input = null;
    const setOption = "Set";
    const cancelOption = "Cancel";
    const popup = new Popup({
      title: "Set Number",
      options: [setOption, cancelOption],
      content: () => {
        const container = document.createElement("div");
        input = document.createElement("input");
        input.type = "number";
        input.valueAsNumber = __privateGet(this, _value2);
        container.append(input);
        return container;
      },
      onClose: (button) => {
        if (button !== setOption || input === null) {
          return;
        }
        this.Set(input.valueAsNumber);
      }
    });
    popup.Show();
  }
  Draw(ctx, position, scale, mousePosition) {
    const box = {
      Position: { x: 0, y: 0 },
      Size: {
        x: width * scale,
        y: height * scale
      }
    };
    CopyVector2(box.Position, position);
    let style = __privateGet(this, _idleBoxStyle);
    if (mousePosition !== void 0) {
      if (InBox(box, mousePosition)) {
        style = __privateGet(this, _highlightBoxStyle);
      }
    }
    style.DrawUnderline(ctx, box, scale, __privateGet(this, _text2));
    return box;
  }
};
_node2 = new WeakMap();
_nodeProperty = new WeakMap();
_value2 = new WeakMap();
_idleBoxStyle = new WeakMap();
_highlightBoxStyle = new WeakMap();
_text2 = new WeakMap();
_callback2 = new WeakMap();

// src/widgets/button.ts
var _text3, _idleStyle, _hoverStyle, _clickStyle, _callback3, _gettingClicked;
var ButtonWidget = class {
  constructor(config) {
    __privateAdd(this, _text3, void 0);
    __privateAdd(this, _idleStyle, void 0);
    __privateAdd(this, _hoverStyle, void 0);
    __privateAdd(this, _clickStyle, void 0);
    __privateAdd(this, _callback3, void 0);
    __privateAdd(this, _gettingClicked, void 0);
    __privateSet(this, _text3, (config == null ? void 0 : config.text) === void 0 ? "Button" : config == null ? void 0 : config.text);
    __privateSet(this, _callback3, config == null ? void 0 : config.callback);
    __privateSet(this, _gettingClicked, false);
    __privateSet(this, _idleStyle, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.idleStyle, {
      box: {
        color: Theme.Widget.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        }
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _hoverStyle, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.hoverStyle, {
      box: {
        color: Theme.Widget.Hover.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        }
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _clickStyle, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.clickStyle, {
      box: {
        color: Theme.Widget.Button.Click.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        }
      },
      text: { color: Theme.Widget.FontColor }
    })));
  }
  Size() {
    return { "x": width, "y": height };
  }
  Draw(ctx, position, scale, mousePosition) {
    const box = {
      Position: { x: 0, y: 0 },
      Size: {
        x: width * scale,
        y: height * scale
      }
    };
    CopyVector2(box.Position, position);
    let style = __privateGet(this, _idleStyle);
    if (mousePosition !== void 0 && !__privateGet(this, _gettingClicked)) {
      if (InBox(box, mousePosition)) {
        style = __privateGet(this, _hoverStyle);
      }
    }
    if (__privateGet(this, _gettingClicked)) {
      style = __privateGet(this, _clickStyle);
    }
    style.Draw(ctx, box, scale, __privateGet(this, _text3));
    return box;
  }
  ClickStart() {
    __privateSet(this, _gettingClicked, true);
  }
  ClickEnd() {
    __privateSet(this, _gettingClicked, false);
    if (__privateGet(this, _callback3) !== void 0) {
      __privateGet(this, _callback3).call(this);
    }
  }
};
_text3 = new WeakMap();
_idleStyle = new WeakMap();
_hoverStyle = new WeakMap();
_clickStyle = new WeakMap();
_callback3 = new WeakMap();
_gettingClicked = new WeakMap();

// src/widgets/color.ts
var _node3, _nodeProperty2, _value3, _contrast, _textBoxStyle, _callback4;
function contrastColor(color) {
  const c = HexToColor(color);
  if (c === null) {
    return "black";
  }
  if ((c.r + c.g + c.b) / 3 > 0.5) {
    return "black";
  }
  return "white";
}
var ColorWidget = class {
  constructor(node, config) {
    __privateAdd(this, _node3, void 0);
    __privateAdd(this, _nodeProperty2, void 0);
    __privateAdd(this, _value3, void 0);
    __privateAdd(this, _contrast, void 0);
    __privateAdd(this, _textBoxStyle, void 0);
    __privateAdd(this, _callback4, void 0);
    __privateSet(this, _node3, node);
    __privateSet(this, _nodeProperty2, config == null ? void 0 : config.property);
    __privateSet(this, _textBoxStyle, new TextBoxStyle({
      box: {
        color: __privateGet(this, _value3),
        border: {
          color: __privateGet(this, _contrast),
          size: Theme.Widget.Border.Size
        }
      },
      text: config == null ? void 0 : config.textStyle
    }));
    this.Set((config == null ? void 0 : config.value) === void 0 ? "#000000" : config == null ? void 0 : config.value);
    __privateSet(this, _callback4, config == null ? void 0 : config.callback);
    if (__privateGet(this, _nodeProperty2) !== void 0) {
      __privateGet(this, _node3).addPropertyChangeListener(__privateGet(this, _nodeProperty2), (oldVal, newVal) => {
        this.Set(newVal);
      });
    }
  }
  Size() {
    return { "x": width, "y": height };
  }
  Set(value) {
    if (__privateGet(this, _value3) === value) {
      return;
    }
    __privateSet(this, _value3, value);
    if (__privateGet(this, _callback4) !== void 0) {
      __privateGet(this, _callback4).call(this, __privateGet(this, _value3));
    }
    if (__privateGet(this, _nodeProperty2) !== void 0) {
      __privateGet(this, _node3).setProperty(__privateGet(this, _nodeProperty2), __privateGet(this, _value3));
    }
    __privateSet(this, _contrast, contrastColor(__privateGet(this, _value3)));
    __privateGet(this, _textBoxStyle).setBoxColor(__privateGet(this, _value3));
    __privateGet(this, _textBoxStyle).setBorderColor(__privateGet(this, _contrast));
    __privateGet(this, _textBoxStyle).setTextColor(__privateGet(this, _contrast));
  }
  ClickStart() {
  }
  ClickEnd() {
    let input = null;
    const popup = new Popup({
      title: "Set Color",
      options: ["Set", "Cancel"],
      content: () => {
        const container = document.createElement("div");
        input = document.createElement("input");
        input.type = "color";
        input.value = __privateGet(this, _value3);
        input.name = "color";
        container.append(input);
        const label = document.createElement("label");
        label.htmlFor = "color";
        label.textContent = "Color";
        container.append(label);
        return container;
      },
      onClose: (button) => {
        if (button !== "Set" || input === null) {
          return;
        }
        this.Set(input.value);
      }
    });
    popup.Show();
  }
  Draw(ctx, position, scale, mousePosition) {
    const box = {
      Position: { x: 0, y: 0 },
      Size: {
        x: width * scale,
        y: height * scale
      }
    };
    CopyVector2(box.Position, position);
    __privateGet(this, _textBoxStyle).Draw(ctx, box, scale, __privateGet(this, _value3));
    return box;
  }
};
_node3 = new WeakMap();
_nodeProperty2 = new WeakMap();
_value3 = new WeakMap();
_contrast = new WeakMap();
_textBoxStyle = new WeakMap();
_callback4 = new WeakMap();

// src/widgets/slider.ts
var _min, _max, _value4, _text4, _snapIncrement, _node4, _nodeProperty3, _change, _release, _textStyle3, _backgroundColor, _borderColor, _fillColor, _lastMousePosition2, _clickStartMousePosition, _clicking;
var SliderWidget = class {
  constructor(node, config) {
    __privateAdd(this, _min, void 0);
    __privateAdd(this, _max, void 0);
    __privateAdd(this, _value4, void 0);
    __privateAdd(this, _text4, void 0);
    __privateAdd(this, _snapIncrement, void 0);
    __privateAdd(this, _node4, void 0);
    __privateAdd(this, _nodeProperty3, void 0);
    __privateAdd(this, _change, void 0);
    __privateAdd(this, _release, void 0);
    __privateAdd(this, _textStyle3, void 0);
    __privateAdd(this, _backgroundColor, void 0);
    __privateAdd(this, _borderColor, void 0);
    __privateAdd(this, _fillColor, void 0);
    __privateAdd(this, _lastMousePosition2, void 0);
    __privateAdd(this, _clickStartMousePosition, void 0);
    __privateAdd(this, _clicking, void 0);
    __privateSet(this, _min, (config == null ? void 0 : config.min) === void 0 ? 0 : config == null ? void 0 : config.min);
    __privateSet(this, _max, (config == null ? void 0 : config.max) === void 0 ? 1 : config == null ? void 0 : config.max);
    __privateSet(this, _snapIncrement, config == null ? void 0 : config.snapIncrement);
    __privateSet(this, _nodeProperty3, config == null ? void 0 : config.property);
    __privateSet(this, _text4, "");
    __privateSet(this, _release, config == null ? void 0 : config.release);
    __privateSet(this, _backgroundColor, (config == null ? void 0 : config.backgroundColor) === void 0 ? Theme.Widget.BackgroundColor : config == null ? void 0 : config.backgroundColor);
    __privateSet(this, _fillColor, (config == null ? void 0 : config.fillColor) === void 0 ? Theme.Widget.Slider.FillColor : config == null ? void 0 : config.fillColor);
    __privateSet(this, _borderColor, (config == null ? void 0 : config.borderColor) === void 0 ? Theme.Widget.Border.Color : config == null ? void 0 : config.borderColor);
    __privateSet(this, _textStyle3, new TextStyle(TextStyleFallback(config == null ? void 0 : config.textStyle, {
      color: Theme.Widget.FontColor
    })));
    __privateSet(this, _lastMousePosition2, Zero());
    __privateSet(this, _clickStartMousePosition, Zero());
    __privateSet(this, _clicking, false);
    if ((config == null ? void 0 : config.property) !== void 0 && (config == null ? void 0 : config.property) !== null) {
      node.addPropertyChangeListener(config.property, (oldVal, newVal) => {
        this.SetValue(newVal);
      });
    }
    this.SetValue((config == null ? void 0 : config.value) === void 0 ? 0 : config == null ? void 0 : config.value);
    __privateSet(this, _change, config == null ? void 0 : config.change);
  }
  SetValue(newValue) {
    const cleanedValue = Clamp(newValue, __privateGet(this, _min), __privateGet(this, _max));
    if (__privateGet(this, _value4) === cleanedValue) {
      return;
    }
    __privateSet(this, _value4, cleanedValue);
    if (__privateGet(this, _nodeProperty3)) {
      __privateGet(this, _node4).setProperty(__privateGet(this, _nodeProperty3), __privateGet(this, _value4));
    }
    __privateSet(this, _text4, __privateGet(this, _value4).toFixed(3));
    if (__privateGet(this, _change) !== void 0) {
      __privateGet(this, _change).call(this, __privateGet(this, _value4));
    }
  }
  Size() {
    return { "x": width, "y": height };
  }
  ClickStart() {
    __privateSet(this, _clicking, true);
    CopyVector2(__privateGet(this, _clickStartMousePosition), __privateGet(this, _lastMousePosition2));
  }
  ClickEnd() {
    __privateSet(this, _clicking, false);
    if (__privateGet(this, _release) !== void 0) {
      __privateGet(this, _release).call(this, __privateGet(this, _value4));
    }
  }
  Draw(ctx, position, scale, mousePosition) {
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledBorderThickness = Theme.Widget.Border.Size * scale;
    ctx.fillStyle = __privateGet(this, _backgroundColor);
    ctx.strokeStyle = __privateGet(this, _borderColor);
    ctx.lineWidth = scaledBorderThickness;
    ctx.beginPath();
    ctx.roundRect(
      position.x,
      position.y,
      scaledWidth,
      scaledHeight,
      Theme.Widget.Border.Radius * scale
    );
    ctx.fill();
    ctx.stroke();
    const fill = Clamp01((__privateGet(this, _value4) - __privateGet(this, _min)) / (__privateGet(this, _max) - __privateGet(this, _min)));
    ctx.fillStyle = __privateGet(this, _fillColor);
    ctx.beginPath();
    ctx.roundRect(
      position.x + scaledBorderThickness / 2,
      position.y + scaledBorderThickness / 2,
      scaledWidth * fill - scaledBorderThickness,
      scaledHeight - scaledBorderThickness,
      Theme.Widget.Border.Radius * scale
    );
    ctx.fill();
    ctx.textAlign = "center" /* Center */;
    ctx.textBaseline = "middle" /* Middle */;
    __privateGet(this, _textStyle3).setupStyle(ctx, scale);
    ctx.fillText(
      __privateGet(this, _text4),
      position.x + scaledWidth / 2,
      position.y + scaledHeight / 2
    );
    if (mousePosition !== void 0) {
      CopyVector2(__privateGet(this, _lastMousePosition2), mousePosition);
      if (__privateGet(this, _clicking)) {
        const min = position.x + scaledBorderThickness / 2;
        const max = min + scaledWidth - scaledBorderThickness;
        const p = Clamp01((__privateGet(this, _lastMousePosition2).x - min) / (max - min));
        let value = p * (__privateGet(this, _max) - __privateGet(this, _min)) + __privateGet(this, _min);
        if (__privateGet(this, _snapIncrement) !== void 0) {
          value = Math.round(value / __privateGet(this, _snapIncrement)) * __privateGet(this, _snapIncrement);
        }
        this.SetValue(value);
      }
    }
    return {
      Position: { x: position.x, y: position.y },
      Size: {
        x: scaledWidth,
        y: scaledHeight
      }
    };
  }
};
_min = new WeakMap();
_max = new WeakMap();
_value4 = new WeakMap();
_text4 = new WeakMap();
_snapIncrement = new WeakMap();
_node4 = new WeakMap();
_nodeProperty3 = new WeakMap();
_change = new WeakMap();
_release = new WeakMap();
_textStyle3 = new WeakMap();
_backgroundColor = new WeakMap();
_borderColor = new WeakMap();
_fillColor = new WeakMap();
_lastMousePosition2 = new WeakMap();
_clickStartMousePosition = new WeakMap();
_clicking = new WeakMap();

// src/popups/string.ts
function SetStringPopup(config) {
  let input = null;
  return new Popup({
    title: config.title,
    options: ["Set", "Cancel"],
    content: () => {
      const container = document.createElement("div");
      input = document.createElement("input");
      input.value = config.startingValue;
      container.append(input);
      return container;
    },
    onClose: (button) => {
      if (button !== "Set" || input === null) {
        if (config.onCancel) {
          config.onCancel();
        }
        return;
      }
      config.onUpdate(input.value);
    }
  });
}

// src/widgets/string.ts
var _value5, _idleStyle2, _hoverStyle2, _callback5, _node5, _nodeProperty4;
var StringWidget = class {
  constructor(node, config) {
    __privateAdd(this, _value5, void 0);
    __privateAdd(this, _idleStyle2, void 0);
    __privateAdd(this, _hoverStyle2, void 0);
    __privateAdd(this, _callback5, void 0);
    __privateAdd(this, _node5, void 0);
    __privateAdd(this, _nodeProperty4, void 0);
    __privateSet(this, _node5, node);
    __privateSet(this, _nodeProperty4, config == null ? void 0 : config.property);
    __privateSet(this, _idleStyle2, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.textBoxStyle, {
      box: {
        color: Theme.Widget.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        },
        radius: Theme.Widget.Border.Radius
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _hoverStyle2, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.textBoxStyle, {
      box: {
        color: Theme.Widget.Hover.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        },
        radius: Theme.Widget.Border.Radius
      },
      text: { color: Theme.Widget.FontColor }
    })));
    this.Set((config == null ? void 0 : config.value) === void 0 ? "" : config == null ? void 0 : config.value);
    __privateSet(this, _callback5, config == null ? void 0 : config.callback);
    if (__privateGet(this, _nodeProperty4) !== void 0) {
      __privateGet(this, _node5).addPropertyChangeListener(__privateGet(this, _nodeProperty4), (oldVal, newVal) => {
        this.Set(newVal);
      });
    }
  }
  Size() {
    return { "x": width, "y": height };
  }
  Set(value) {
    if (__privateGet(this, _value5) === value) {
      return;
    }
    __privateSet(this, _value5, value);
    if (__privateGet(this, _nodeProperty4) !== void 0) {
      __privateGet(this, _node5).setProperty(__privateGet(this, _nodeProperty4), __privateGet(this, _value5));
    }
    if (__privateGet(this, _callback5) !== void 0) {
      __privateGet(this, _callback5).call(this, __privateGet(this, _value5));
    }
  }
  ClickStart() {
  }
  ClickEnd() {
    const popup = SetStringPopup({
      title: "Set String",
      startingValue: __privateGet(this, _value5),
      onUpdate: (value) => {
        this.Set(value);
      }
    });
    popup.Show();
  }
  Draw(ctx, position, scale, mousePosition) {
    const box = {
      Position: { x: 0, y: 0 },
      Size: {
        x: width * scale,
        y: height * scale
      }
    };
    CopyVector2(box.Position, position);
    let style = __privateGet(this, _idleStyle2);
    if (mousePosition !== void 0) {
      if (InBox(box, mousePosition)) {
        style = __privateGet(this, _hoverStyle2);
      }
    }
    style.DrawUnderline(ctx, box, scale, fitString(ctx, __privateGet(this, _value5), box.Size.x - 20 * scale));
    return box;
  }
};
_value5 = new WeakMap();
_idleStyle2 = new WeakMap();
_hoverStyle2 = new WeakMap();
_callback5 = new WeakMap();
_node5 = new WeakMap();
_nodeProperty4 = new WeakMap();

// src/widgets/toggle.ts
var _idleStyle3, _hoverStyle3, _lightColor, _lightBorderColor, _lightBlur, _node6, _nodeProperty5, _value6, _text5, _enabledStyle, _disabledStyle, _callback6;
var ToggleStyle = class {
  constructor(config) {
    __privateAdd(this, _idleStyle3, void 0);
    __privateAdd(this, _hoverStyle3, void 0);
    __privateAdd(this, _lightColor, void 0);
    __privateAdd(this, _lightBorderColor, void 0);
    __privateAdd(this, _lightBlur, void 0);
    __privateSet(this, _idleStyle3, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.idle, {
      box: {
        color: Theme.Widget.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        }
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _hoverStyle3, new TextBoxStyle(TextBoxStyleWithFallback(config == null ? void 0 : config.hover, {
      box: {
        color: Theme.Widget.Hover.BackgroundColor,
        border: {
          size: Theme.Widget.Border.Size,
          color: Theme.Widget.Border.Color
        }
      },
      text: { color: Theme.Widget.FontColor }
    })));
    __privateSet(this, _lightColor, (config == null ? void 0 : config.lightColor) === void 0 ? "#222222" : config.lightColor);
    __privateSet(this, _lightBorderColor, (config == null ? void 0 : config.lightBorderColor) === void 0 ? "black" : config.lightBorderColor);
    __privateSet(this, _lightBlur, config == null ? void 0 : config.lightBlur);
  }
  Draw(ctx, position, scale, text, mousePosition) {
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const box = { Position: { x: 0, y: 0 }, Size: { x: scaledWidth, y: scaledHeight } };
    CopyVector2(box.Position, position);
    let style = __privateGet(this, _idleStyle3);
    if (mousePosition !== void 0) {
      if (InBox(box, mousePosition)) {
        style = __privateGet(this, _hoverStyle3);
      }
    }
    style.Draw(ctx, box, scale, text);
    const lightScale = Math.min(scaledWidth, scaledHeight);
    ctx.strokeStyle = __privateGet(this, _lightBorderColor);
    ctx.fillStyle = __privateGet(this, _lightColor);
    ctx.beginPath();
    ctx.roundRect(
      position.x + lightScale * 0.2,
      position.y + lightScale * 0.2,
      lightScale * 0.6,
      lightScale * 0.6,
      Theme.Widget.Border.Radius * scale
    );
    if (__privateGet(this, _lightBlur)) {
      ctx.shadowBlur = __privateGet(this, _lightBlur) * scale;
      ctx.shadowColor = __privateGet(this, _lightColor);
    }
    ctx.fill();
    if (__privateGet(this, _lightBlur)) {
      ctx.shadowBlur = 0;
    }
    return {
      Position: position,
      Size: {
        x: scaledWidth,
        y: scaledHeight
      }
    };
  }
};
_idleStyle3 = new WeakMap();
_hoverStyle3 = new WeakMap();
_lightColor = new WeakMap();
_lightBorderColor = new WeakMap();
_lightBlur = new WeakMap();
var ToggleWidget = class {
  constructor(node, config) {
    __privateAdd(this, _node6, void 0);
    __privateAdd(this, _nodeProperty5, void 0);
    __privateAdd(this, _value6, void 0);
    __privateAdd(this, _text5, void 0);
    __privateAdd(this, _enabledStyle, void 0);
    __privateAdd(this, _disabledStyle, void 0);
    __privateAdd(this, _callback6, void 0);
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    __privateSet(this, _node6, node);
    __privateSet(this, _nodeProperty5, config == null ? void 0 : config.property);
    __privateSet(this, _text5, (config == null ? void 0 : config.text) === void 0 ? "Toggle" : config == null ? void 0 : config.text);
    __privateSet(this, _enabledStyle, new ToggleStyle({
      idle: TextBoxStyleWithFallback((_a = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _a.idle, {
        box: {
          color: Theme.Widget.BackgroundColor,
          border: {
            size: Theme.Widget.Border.Size,
            color: Theme.Widget.Border.Color
          }
        },
        text: { color: Theme.Widget.FontColor }
      }),
      lightBorderColor: (_b = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _b.lightBorderColor,
      lightColor: ((_c = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _c.lightColor) === void 0 ? "#00FF00" : (_d = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _d.lightColor,
      lightBlur: ((_e = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _e.lightBlur) === void 0 ? 15 : (_f = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _f.lightBlur
    }));
    __privateSet(this, _disabledStyle, new ToggleStyle({
      idle: TextBoxStyleWithFallback((_g = config == null ? void 0 : config.disabledStyle) == null ? void 0 : _g.idle, {
        box: {
          color: Theme.Widget.BackgroundColor,
          border: {
            size: Theme.Widget.Border.Size,
            color: Theme.Widget.Border.Color
          }
        },
        text: { color: Theme.Widget.FontColor }
      }),
      lightBorderColor: (_h = config == null ? void 0 : config.disabledStyle) == null ? void 0 : _h.lightBorderColor,
      lightColor: ((_i = config == null ? void 0 : config.disabledStyle) == null ? void 0 : _i.lightColor) === void 0 ? "#004400" : (_j = config == null ? void 0 : config.enabledStyle) == null ? void 0 : _j.lightColor
    }));
    this.Set((config == null ? void 0 : config.value) === void 0 ? false : config == null ? void 0 : config.value);
    __privateSet(this, _callback6, config == null ? void 0 : config.callback);
    if (__privateGet(this, _nodeProperty5) !== void 0) {
      __privateGet(this, _node6).addPropertyChangeListener(__privateGet(this, _nodeProperty5), (oldVal, newVal) => {
        this.Set(newVal);
      });
    }
  }
  Size() {
    return { "x": width, "y": height };
  }
  Draw(ctx, position, scale, mousePosition) {
    let style = __privateGet(this, _value6) ? __privateGet(this, _enabledStyle) : __privateGet(this, _disabledStyle);
    return style.Draw(ctx, position, scale, __privateGet(this, _text5), mousePosition);
  }
  Toggle() {
    this.Set(!__privateGet(this, _value6));
  }
  Set(value) {
    if (__privateGet(this, _value6) === value) {
      return;
    }
    __privateSet(this, _value6, value);
    if (__privateGet(this, _nodeProperty5) !== void 0) {
      __privateGet(this, _node6).setProperty(__privateGet(this, _nodeProperty5), __privateGet(this, _value6));
    }
    if (__privateGet(this, _callback6) !== void 0) {
      __privateGet(this, _callback6).call(this, __privateGet(this, _value6));
    }
  }
  ClickStart() {
    this.Toggle();
  }
  ClickEnd() {
  }
};
_node6 = new WeakMap();
_nodeProperty5 = new WeakMap();
_value6 = new WeakMap();
_text5 = new WeakMap();
_enabledStyle = new WeakMap();
_disabledStyle = new WeakMap();
_callback6 = new WeakMap();

// src/widgets/image.ts
var _url, _image, _maxWidth, _maxHeight;
var margin = 15;
var ImageWidget = class {
  constructor(config) {
    __privateAdd(this, _url, void 0);
    __privateAdd(this, _image, void 0);
    __privateAdd(this, _maxWidth, void 0);
    __privateAdd(this, _maxHeight, void 0);
    __privateSet(this, _maxWidth, (config == null ? void 0 : config.maxWidth) === void 0 ? 150 : config == null ? void 0 : config.maxWidth);
    __privateSet(this, _maxHeight, (config == null ? void 0 : config.maxHeight) === void 0 ? 150 : config == null ? void 0 : config.maxHeight);
    if (config == null ? void 0 : config.image) {
      this.SetUrl(config == null ? void 0 : config.image);
    } else if (config == null ? void 0 : config.blob) {
      this.SetBlob(config == null ? void 0 : config.blob);
    }
  }
  SetBlob(blob) {
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    this.SetUrl(imageUrl);
  }
  SetUrl(url) {
    __privateSet(this, _image, void 0);
    __privateSet(this, _url, url);
    const img = document.createElement("img");
    img.src = url;
    img.onload = () => {
      __privateSet(this, _image, img);
    };
    img.onerror = (event) => {
      console.log("error loading image:", url, event);
    };
  }
  Size() {
    if (__privateGet(this, _image) === void 0) {
      return { "x": 0, "y": 0 };
    }
    let adjust = 1;
    if (__privateGet(this, _image).width > __privateGet(this, _maxWidth)) {
      adjust = __privateGet(this, _maxWidth) / __privateGet(this, _image).width;
    }
    if (__privateGet(this, _image).height > __privateGet(this, _maxHeight)) {
      let heightAdjust = __privateGet(this, _maxHeight) / __privateGet(this, _image).height;
      if (heightAdjust < adjust) {
        adjust = heightAdjust;
      }
    }
    return {
      "x": adjust * __privateGet(this, _image).width,
      "y": adjust * __privateGet(this, _image).height
    };
  }
  ClickStart() {
  }
  ClickEnd() {
  }
  Draw(ctx, position, scale, mousePosition) {
    const size = this.Size();
    const box = {
      Position: { x: 0, y: 0 },
      Size: {
        x: size.x * scale,
        y: size.y * scale
      }
    };
    CopyVector2(box.Position, position);
    if (!__privateGet(this, _image)) {
      return box;
    }
    ctx.drawImage(
      __privateGet(this, _image),
      position.x,
      position.y,
      box.Size.x,
      box.Size.y
    );
    return box;
  }
};
_url = new WeakMap();
_image = new WeakMap();
_maxWidth = new WeakMap();
_maxHeight = new WeakMap();

// src/widgets/text.ts
var _value7, _callback7, _node7, _nodeProperty6, _size4;
var TextWidget = class {
  constructor(node, config) {
    __privateAdd(this, _value7, void 0);
    __privateAdd(this, _callback7, void 0);
    __privateAdd(this, _node7, void 0);
    __privateAdd(this, _nodeProperty6, void 0);
    __privateAdd(this, _size4, void 0);
    __privateSet(this, _size4, Zero());
    __privateSet(this, _node7, node);
    __privateSet(this, _nodeProperty6, config == null ? void 0 : config.property);
    __privateSet(this, _value7, new Text("", TextStyleFallback(config == null ? void 0 : config.textBoxStyle, {
      font: Theme.FontFamily,
      color: Theme.Widget.FontColor,
      size: Theme.Note.FontSize
    })));
    this.Set((config == null ? void 0 : config.value) === void 0 ? "" : config == null ? void 0 : config.value);
    __privateSet(this, _callback7, config == null ? void 0 : config.callback);
    if (__privateGet(this, _nodeProperty6) !== void 0) {
      __privateGet(this, _node7).addPropertyChangeListener(__privateGet(this, _nodeProperty6), (oldVal, newVal) => {
        this.Set(newVal);
      });
    }
  }
  Size() {
    return __privateGet(this, _size4);
  }
  Set(value) {
    if (__privateGet(this, _value7).get() === value) {
      return;
    }
    __privateGet(this, _value7).set(value);
    if (__privateGet(this, _nodeProperty6) !== void 0) {
      __privateGet(this, _node7).setProperty(__privateGet(this, _nodeProperty6), value);
    }
    if (__privateGet(this, _callback7) !== void 0) {
      __privateGet(this, _callback7).call(this, value);
    }
  }
  ClickStart() {
  }
  ClickEnd() {
  }
  Draw(ctx, position, scale, mousePosition) {
    __privateGet(this, _value7).size(ctx, scale, __privateGet(this, _size4));
    const box = {
      Position: { x: 0, y: 0 },
      Size: __privateGet(this, _size4)
    };
    CopyVector2(box.Position, position);
    __privateGet(this, _value7).size(ctx, 1, __privateGet(this, _size4));
    ctx.textAlign = "left";
    __privateGet(this, _value7).render(ctx, scale, box.Position);
    return box;
  }
};
_value7 = new WeakMap();
_callback7 = new WeakMap();
_node7 = new WeakMap();
_nodeProperty6 = new WeakMap();
_size4 = new WeakMap();

// src/widgets/factory.ts
var _registeredWidgets;
var WidgetFactory = class {
  constructor() {
    __privateAdd(this, _registeredWidgets, void 0);
    __privateSet(this, _registeredWidgets, /* @__PURE__ */ new Map());
  }
  register(widgetType, builder) {
    __privateGet(this, _registeredWidgets).set(widgetType, builder);
  }
  create(node, widgetType, config) {
    const builder = __privateGet(this, _registeredWidgets).get(widgetType);
    if (builder === void 0) {
      throw new Error("no builder registered for widget: " + widgetType);
    }
    return builder(node, config);
  }
};
_registeredWidgets = new WeakMap();
var GlobalWidgetFactory = new WidgetFactory();
GlobalWidgetFactory.register("button", (node, config) => new ButtonWidget(config));
GlobalWidgetFactory.register("number", (node, config) => new NumberWidget(node, config));
GlobalWidgetFactory.register("color", (node, config) => new ColorWidget(node, config));
GlobalWidgetFactory.register("slider", (node, config) => new SliderWidget(node, config));
GlobalWidgetFactory.register("string", (node, config) => new StringWidget(node, config));
GlobalWidgetFactory.register("toggle", (node, config) => new ToggleWidget(node, config));
GlobalWidgetFactory.register("image", (node, config) => new ImageWidget(config));
GlobalWidgetFactory.register("text", (node, config) => new TextWidget(node, config));

// src/connection.ts
var _inPos, _outPos, _inNode, _inNodePortIndex, _outNode, _outNodePortIndex, _renderer;
function DefaultConnectionRenderer(connectionSize, connectionColor, mouseOverSize, mouseOverColor) {
  return (params) => {
    var _a, _b;
    let color = "#00FF00";
    if (params.outPort !== null) {
      color = params.outPort.filledStyleColor();
    } else if (params.inPort !== null) {
      color = params.inPort.filledStyleColor();
    }
    let lineSize = connectionSize * params.graphScale;
    if (connectionColor !== void 0) {
      color = connectionColor;
    }
    if (params.mouseOver || ((_a = params.inNode) == null ? void 0 : _a.selected()) || ((_b = params.outNode) == null ? void 0 : _b.selected())) {
      lineSize = mouseOverSize * params.graphScale;
      params.ctx.shadowBlur = 25 * params.graphScale;
      if (mouseOverColor !== void 0) {
        color = mouseOverColor;
      }
      params.ctx.shadowColor = color;
    }
    params.ctx.strokeStyle = color;
    params.ctx.lineWidth = lineSize;
    params.ctx.beginPath();
    params.ctx.moveTo(params.start.x, params.start.y);
    const midX = (params.start.x + params.end.x) / 2;
    params.ctx.bezierCurveTo(midX, params.start.y, midX, params.end.y, params.end.x, params.end.y);
    params.ctx.stroke();
    params.ctx.shadowBlur = 0;
  };
}
var Connection2 = class {
  constructor(inNode, inNodePortIndex, outNode, outNodePortIndex, renderer) {
    __privateAdd(this, _inPos, void 0);
    __privateAdd(this, _outPos, void 0);
    __privateAdd(this, _inNode, void 0);
    __privateAdd(this, _inNodePortIndex, void 0);
    __privateAdd(this, _outNode, void 0);
    __privateAdd(this, _outNodePortIndex, void 0);
    __privateAdd(this, _renderer, void 0);
    __privateSet(this, _inNode, inNode);
    __privateSet(this, _inNodePortIndex, inNodePortIndex);
    __privateSet(this, _outNode, outNode);
    __privateSet(this, _outNodePortIndex, outNodePortIndex);
    __privateSet(this, _renderer, renderer);
    __privateSet(this, _inPos, Zero());
    __privateSet(this, _outPos, Zero());
    if (inNode !== null) {
      inNode.inputPort(__privateGet(this, _inNodePortIndex)).addConnection(this);
    }
    if (outNode !== null) {
      outNode.outputPort(__privateGet(this, _outNodePortIndex)).addConnection(this);
    }
  }
  render(ctx, graphScale, mouseOver, mousePosition) {
    if (__privateGet(this, _inNode) === null && __privateGet(this, _outNode) === null) {
      return;
    }
    if (__privateGet(this, _inNode) !== null) {
      const inPortBox = __privateGet(this, _inNode).inputPortPosition(__privateGet(this, _inNodePortIndex));
      if (inPortBox === void 0) {
        return;
      }
      BoxCenter(inPortBox, __privateGet(this, _inPos));
    } else if (mousePosition !== void 0) {
      __privateGet(this, _inPos).x = mousePosition.x;
      __privateGet(this, _inPos).y = mousePosition.y;
    } else {
      return;
    }
    if (__privateGet(this, _outNode) !== null) {
      const outPortBox = __privateGet(this, _outNode).outputPortPosition(__privateGet(this, _outNodePortIndex));
      if (outPortBox === void 0) {
        return;
      }
      BoxCenter(outPortBox, __privateGet(this, _outPos));
    } else if (mousePosition !== void 0) {
      __privateGet(this, _outPos).x = mousePosition.x;
      __privateGet(this, _outPos).y = mousePosition.y;
    } else {
      return;
    }
    __privateGet(this, _renderer).call(this, {
      ctx,
      start: __privateGet(this, _inPos),
      end: __privateGet(this, _outPos),
      graphScale,
      mouseOver,
      inPort: this.inPort(),
      inNode: __privateGet(this, _inNode),
      outPort: this.outPort(),
      outNode: __privateGet(this, _outNode)
    });
  }
  inNode() {
    return __privateGet(this, _inNode);
  }
  outNode() {
    return __privateGet(this, _outNode);
  }
  clearPort(mousePosition) {
    if (__privateGet(this, _inNode) !== null) {
      const inPortBox = __privateGet(this, _inNode).inputPortPosition(__privateGet(this, _inNodePortIndex));
      if (inPortBox !== void 0 && InBox(inPortBox, mousePosition)) {
        this.clearInput();
      }
    }
    if (__privateGet(this, _outNode) !== null) {
      const outPortBox = __privateGet(this, _outNode).outputPortPosition(__privateGet(this, _outNodePortIndex));
      if (outPortBox !== void 0 && InBox(outPortBox, mousePosition)) {
        this.clearOutput();
      }
    }
  }
  clearPorts() {
    this.clearInput();
    this.clearOutput();
  }
  setInput(node, portIndex) {
    __privateSet(this, _inNode, node);
    __privateSet(this, _inNodePortIndex, portIndex);
    __privateGet(this, _inNode).inputPort(portIndex).addConnection(this);
  }
  setOutput(node, portIndex) {
    __privateSet(this, _outNode, node);
    __privateSet(this, _outNodePortIndex, portIndex);
    __privateGet(this, _outNode).outputPort(portIndex).addConnection(this);
  }
  clearInput() {
    var _a;
    (_a = __privateGet(this, _inNode)) == null ? void 0 : _a.inputPort(__privateGet(this, _inNodePortIndex)).clearConnection(this);
    __privateSet(this, _inNode, null);
    __privateSet(this, _inNodePortIndex, -1);
  }
  clearOutput() {
    var _a;
    (_a = __privateGet(this, _outNode)) == null ? void 0 : _a.outputPort(__privateGet(this, _outNodePortIndex)).clearConnection(this);
    __privateSet(this, _outNode, null);
    __privateSet(this, _outNodePortIndex, -1);
  }
  mouseOverPort(mousePosition) {
    if (__privateGet(this, _inNode) !== null) {
      const inPortBox = __privateGet(this, _inNode).inputPortPosition(__privateGet(this, _inNodePortIndex));
      if (inPortBox !== void 0 && InBox(inPortBox, mousePosition)) {
        return __privateGet(this, _inNode).inputPort(__privateGet(this, _inNodePortIndex));
      }
    }
    if (__privateGet(this, _outNode) !== null) {
      const outPortBox = __privateGet(this, _outNode).outputPortPosition(__privateGet(this, _outNodePortIndex));
      if (outPortBox !== void 0 && InBox(outPortBox, mousePosition)) {
        return __privateGet(this, _outNode).outputPort(__privateGet(this, _outNodePortIndex));
      }
    }
    return null;
  }
  outPort() {
    if (__privateGet(this, _outNode) === null) {
      return null;
    }
    return __privateGet(this, _outNode).outputPort(__privateGet(this, _outNodePortIndex));
  }
  inPort() {
    if (__privateGet(this, _inNode) === null) {
      return null;
    }
    return __privateGet(this, _inNode).inputPort(__privateGet(this, _inNodePortIndex));
  }
  referencesNode(node) {
    if (__privateGet(this, _inNode) === node) {
      return true;
    }
    if (__privateGet(this, _outNode) === node) {
      return true;
    }
    return false;
  }
};
_inPos = new WeakMap();
_outPos = new WeakMap();
_inNode = new WeakMap();
_inNodePortIndex = new WeakMap();
_outNode = new WeakMap();
_outNodePortIndex = new WeakMap();
_renderer = new WeakMap();

// src/camera.ts
var Camera2 = class {
  constructor() {
    this.zoom = 1;
    this.position = Zero();
  }
  screenSpaceToGraphSpace(screenPosition, out) {
    const scale = this.zoom;
    out.x = screenPosition.x / scale - this.position.x / scale;
    out.y = screenPosition.y / scale - this.position.y / scale;
  }
  graphSpaceToScreenSpace(graphPosition, out) {
    out.x = this.position.x + graphPosition.x * this.zoom;
    out.y = this.position.y + graphPosition.y * this.zoom;
  }
  reset() {
    this.zoom = 1;
    this.position.x = 0;
    this.position.y = 0;
  }
};

// src/organize.ts
function MarkInputs(graph, positions, nodeLUT, node, depth, shouldSort) {
  const inputs = graph.connectedInputsNodeReferencesByIndex(node);
  for (let i = 0; i < inputs.length; i++) {
    const nodeIndex = nodeLUT.get(inputs[i]);
    if (!shouldSort.has(inputs[i])) {
      continue;
    }
    positions[nodeIndex] = depth;
    MarkInputs(graph, positions, nodeLUT, nodeIndex, depth - 1, shouldSort);
  }
}
function MarkOutputs(graph, positions, nodeLUT, node, depth, shouldSort) {
  const outputs = graph.connectedInputsNodeReferencesByIndex(node);
  for (let i = 0; i < outputs.length; i++) {
    const nodeIndex = nodeLUT.get(outputs[i]);
    if (!shouldSort.has(outputs[i])) {
      continue;
    }
    positions[nodeIndex] = depth;
    MarkOutputs(graph, positions, nodeLUT, nodeIndex, depth + 1, shouldSort);
  }
}
function Organize(ctx, graph, nodesToSort) {
  const nodes = graph.getNodes();
  const nodeLUT = /* @__PURE__ */ new Map();
  const bounds = new Array(nodes.length);
  const relativePosition = new Array(nodes.length);
  const claimed = new Array(nodes.length);
  const shouldSort = /* @__PURE__ */ new Map();
  if (nodesToSort) {
    if (nodesToSort.length < 2) {
      return;
    }
    for (let i = 0; i < nodesToSort.length; i++) {
      shouldSort.set(nodes[nodesToSort[i]], true);
    }
  } else {
    for (let i = 0; i < nodes.length; i++) {
      shouldSort.set(nodes[i], true);
    }
  }
  const camera = new Camera2();
  for (let i = 0; i < nodes.length; i++) {
    bounds[i] = nodes[i].calculateBounds(ctx, camera);
    relativePosition[i] = new Array(nodes.length);
    nodeLUT.set(nodes[i], i);
    claimed[i] = false;
  }
  for (let i = 0; i < nodes.length; i++) {
    relativePosition[i][i] = 0;
    MarkInputs(graph, relativePosition[i], nodeLUT, i, -1, shouldSort);
    MarkOutputs(graph, relativePosition[i], nodeLUT, i, 1, shouldSort);
  }
  let entries = new Array(shouldSort.size);
  let nodeIndex = 0;
  for (let i = 0; i < nodes.length; i++) {
    if (!shouldSort.has(nodes[i])) {
      continue;
    }
    let min = 0;
    let max = 0;
    for (let x = 0; x < nodes.length; x++) {
      const val = relativePosition[i][x];
      if (val === void 0) {
        continue;
      }
      min = Math.min(min, val);
      max = Math.max(max, val);
    }
    entries[nodeIndex] = {
      length: max - min,
      node: i,
      min,
      max
    };
    nodeIndex++;
  }
  entries.sort((a, b) => b.length - a.length);
  const columns = Array(entries[0].length + 1);
  for (let i = 0; i < columns.length; i++) {
    columns[i] = {
      Nodes: new Array(),
      Width: 0
    };
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (claimed[entry.node] === true) {
      continue;
    }
    const positions = relativePosition[entry.node];
    for (let p = 0; p < positions.length; p++) {
      const position = positions[p];
      if (position === void 0) {
        continue;
      }
      if (claimed[p] === true) {
        continue;
      }
      const nodeBounds = bounds[p];
      const column2 = columns[position - entry.min];
      column2.Nodes.push(nodes[p]);
      column2.Width = Math.max(column2.Width, nodeBounds.Size.x);
      claimed[p] = true;
    }
  }
  let allColumnsWidths = 0;
  for (let c = 0; c < columns.length; c++) {
    allColumnsWidths += columns[c].Width;
  }
  const widthSpacing = 100;
  const heightSpacing = 50;
  let widthOffset = 0;
  for (let c = 0; c < columns.length; c++) {
    var column = columns[c];
    let heightOffset = 0;
    widthOffset -= widthSpacing + column.Width;
    for (let n = 0; n < column.Nodes.length; n++) {
      const node = column.Nodes[n];
      const nodeBounds = bounds[nodeLUT.get(node)];
      let pos = {
        x: widthOffset + allColumnsWidths + columns.length * widthSpacing,
        y: heightOffset
      };
      heightOffset += nodeBounds.Size.y + heightSpacing;
      node.setPosition(pos);
    }
  }
}

// src/performance.ts
function TimeExecution(name, callback) {
  const start = name + "_Start";
  const end = name + "_End";
  performance.mark(start);
  callback();
  performance.mark(end);
  performance.measure(name, start, end);
}

// src/nodes/publisher.ts
var _name3, _description, _version, _registeredNodes, _recurseBuildMenu, recurseBuildMenu_fn;
var Publisher = class {
  constructor(config) {
    __privateAdd(this, _recurseBuildMenu);
    __privateAdd(this, _name3, void 0);
    __privateAdd(this, _description, void 0);
    __privateAdd(this, _version, void 0);
    __privateAdd(this, _registeredNodes, void 0);
    __privateSet(this, _name3, (config == null ? void 0 : config.name) === void 0 ? "Unknown" : config.name);
    __privateSet(this, _description, (config == null ? void 0 : config.description) === void 0 ? "" : config.description);
    __privateSet(this, _version, (config == null ? void 0 : config.version) === void 0 ? "v0.0.0" : config.version);
    __privateSet(this, _registeredNodes, /* @__PURE__ */ new Map());
    if ((config == null ? void 0 : config.nodes) !== void 0) {
      for (const nodeKey in config.nodes) {
        this.register(nodeKey, config.nodes[nodeKey]);
      }
    }
  }
  nodes() {
    return __privateGet(this, _registeredNodes);
  }
  register(nodeType, config) {
    __privateGet(this, _registeredNodes).set(nodeType, config);
  }
  contextMenu(graph, position) {
    return __privateMethod(this, _recurseBuildMenu, recurseBuildMenu_fn).call(this, graph, __privateGet(this, _name3), __privateGet(this, _registeredNodes), position);
  }
  create(nodeType) {
    const config = __privateGet(this, _registeredNodes).get(nodeType);
    if (config === void 0) {
      throw new Error("no builder registered for node: " + nodeType);
    }
    return new FlowNode11(config);
  }
};
_name3 = new WeakMap();
_description = new WeakMap();
_version = new WeakMap();
_registeredNodes = new WeakMap();
_recurseBuildMenu = new WeakSet();
recurseBuildMenu_fn = function(graph, name, subMenu, position) {
  const items = [];
  const subMenus = /* @__PURE__ */ new Map();
  for (let [key, nodeConfig] of subMenu) {
    const elements = key.split("/");
    if (elements.length === 1) {
      items.push({
        name: key,
        callback: () => {
          const node = new FlowNode11(nodeConfig);
          node.setPosition(position);
          graph.addNode(node);
        }
      });
    } else {
      if (!subMenus.has(elements[0])) {
        subMenus.set(elements[0], /* @__PURE__ */ new Map());
      }
      const menu = subMenus.get(elements[0]);
      elements.shift();
      menu == null ? void 0 : menu.set(elements.join("/"), nodeConfig);
    }
  }
  const menus = [];
  for (let [key, nodes] of subMenus) {
    menus.push(__privateMethod(this, _recurseBuildMenu, recurseBuildMenu_fn).call(this, graph, key, nodes, position));
  }
  return {
    name,
    items,
    subMenus: menus
  };
};

// src/nodes/factory.ts
var _registeredPublishers, _registeredCallbacks;
var NodeFactory = class {
  constructor(config) {
    __privateAdd(this, _registeredPublishers, void 0);
    __privateAdd(this, _registeredCallbacks, void 0);
    __privateSet(this, _registeredPublishers, /* @__PURE__ */ new Map());
    __privateSet(this, _registeredCallbacks, new Array());
    if (config == null ? void 0 : config.onNodeCreated) {
      __privateGet(this, _registeredCallbacks).push(config == null ? void 0 : config.onNodeCreated);
    }
    if ((config == null ? void 0 : config.publishers) !== void 0) {
      for (let entry in config.publishers) {
        this.addPublisher(entry, new Publisher(config.publishers[entry]));
      }
    }
  }
  addOnNodeCreatedListener(callback) {
    __privateGet(this, _registeredCallbacks).push(callback);
  }
  addPublisher(identifier, publisher) {
    __privateGet(this, _registeredPublishers).set(identifier, publisher);
  }
  create(publisher, nodeType) {
    const publisherIdentifier = __privateGet(this, _registeredPublishers).get(publisher);
    if (publisherIdentifier === void 0) {
      throw new Error("no publisher registered with identifier: " + publisher);
    }
    const node = publisherIdentifier.create(nodeType);
    for (let i = 0; i < __privateGet(this, _registeredCallbacks).length; i++) {
      const callback = __privateGet(this, _registeredCallbacks)[i];
      callback(publisher, nodeType, node);
    }
    return node;
  }
  openMenu(graph, position) {
    const menus = [];
    for (let [_, publisher] of __privateGet(this, _registeredPublishers)) {
      menus.push(publisher.contextMenu(graph, position));
    }
    return {
      name: "New Node",
      group: nodeFlowGroup,
      subMenus: menus
    };
  }
};
_registeredPublishers = new WeakMap();
_registeredCallbacks = new WeakMap();

// src/nodes/subsystem.ts
var _nodes, _connections2, _nodeHovering, _nodesGrabbed, _connectionSelected, _idleConnectionRenderer, _portHovering, _widgetHovering, _widgetCurrentlyClicking, _cursor, _nodeFactory, _boxSelect, _boxSelectStart_graphSpace, _boxSelectEnd_graphSpace, _boxSelectionNodes, _boxSelectStyle, _removeNodeConnections, removeNodeConnections_fn, _interactingWithNode, interactingWithNode_fn, _interactingWithConnection, interactingWithConnection_fn, _interactingWithWidget, interactingWithWidget_fn, _removeNodeByIndex, removeNodeByIndex_fn, _removeConnectionByIndex, removeConnectionByIndex_fn, _removeConnection, removeConnection_fn, _nodesSelected, nodesSelected_fn, _organizeSelected, organizeSelected_fn, _selectInputNodesAndDescendents, selectInputNodesAndDescendents_fn, _selectConnectedNodes, selectConnectedNodes_fn, _selectNodeByIndex, selectNodeByIndex_fn, _selectNode, selectNode_fn, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn, _renderConnections, renderConnections_fn, _renderNodes, renderNodes_fn, _boxSelectionScreenspaceBox, boxSelectionScreenspaceBox_fn;
var nodeFlowGroup = "node-flow-graph-node-menu";
function BuildConnectionRenderer(config) {
  if ((config == null ? void 0 : config.renderer) !== void 0) {
    return config.renderer;
  }
  return DefaultConnectionRenderer(
    (config == null ? void 0 : config.size) === void 0 ? 2 : config.size,
    void 0,
    (config == null ? void 0 : config.mouseOverSize) === void 0 ? 4 : config.mouseOverSize,
    void 0
  );
}
var NodeSubsystem4 = class {
  constructor(config) {
    __privateAdd(this, _removeNodeConnections);
    __privateAdd(this, _interactingWithNode);
    __privateAdd(this, _interactingWithConnection);
    __privateAdd(this, _interactingWithWidget);
    __privateAdd(this, _removeNodeByIndex);
    __privateAdd(this, _removeConnectionByIndex);
    __privateAdd(this, _removeConnection);
    __privateAdd(this, _nodesSelected);
    __privateAdd(this, _organizeSelected);
    __privateAdd(this, _selectInputNodesAndDescendents);
    __privateAdd(this, _selectConnectedNodes);
    __privateAdd(this, _selectNodeByIndex);
    __privateAdd(this, _selectNode);
    __privateAdd(this, _clearCurrentlySelectedConnection);
    __privateAdd(this, _renderConnections);
    __privateAdd(this, _renderNodes);
    __privateAdd(this, _boxSelectionScreenspaceBox);
    __privateAdd(this, _nodes, void 0);
    __privateAdd(this, _connections2, void 0);
    __privateAdd(this, _nodeHovering, void 0);
    __privateAdd(this, _nodesGrabbed, void 0);
    __privateAdd(this, _connectionSelected, void 0);
    __privateAdd(this, _idleConnectionRenderer, void 0);
    __privateAdd(this, _portHovering, void 0);
    __privateAdd(this, _widgetHovering, void 0);
    __privateAdd(this, _widgetCurrentlyClicking, void 0);
    __privateAdd(this, _cursor, void 0);
    __privateAdd(this, _nodeFactory, void 0);
    __privateAdd(this, _boxSelect, void 0);
    __privateAdd(this, _boxSelectStart_graphSpace, void 0);
    __privateAdd(this, _boxSelectEnd_graphSpace, void 0);
    __privateAdd(this, _boxSelectionNodes, void 0);
    __privateAdd(this, _boxSelectStyle, void 0);
    __privateSet(this, _nodes, []);
    __privateSet(this, _nodeHovering, -1);
    __privateSet(this, _nodesGrabbed, new List());
    __privateSet(this, _connectionSelected, null);
    __privateSet(this, _portHovering, null);
    __privateSet(this, _widgetHovering, null);
    __privateSet(this, _widgetCurrentlyClicking, null);
    __privateSet(this, _connections2, new Array());
    __privateSet(this, _nodeFactory, new NodeFactory(config == null ? void 0 : config.nodes));
    __privateSet(this, _idleConnectionRenderer, BuildConnectionRenderer(config == null ? void 0 : config.idleConnection));
    __privateSet(this, _boxSelect, false);
    __privateSet(this, _boxSelectStart_graphSpace, Zero());
    __privateSet(this, _boxSelectEnd_graphSpace, Zero());
    __privateSet(this, _boxSelectionNodes, new List());
    __privateSet(this, _boxSelectStyle, new BoxStyle({
      border: {
        color: Theme.BoxSelect.Color,
        size: Theme.BoxSelect.Size
      },
      color: "rgba(0,0,0,0)",
      radius: Theme.BoxSelect.Radius
    }));
  }
  addPublisher(identifier, publisher) {
    __privateGet(this, _nodeFactory).addPublisher(identifier, publisher);
  }
  clickStart(mousePosition, camera, ctrlKey) {
    __privateSet(this, _boxSelect, false);
    let hoveringSomething = false;
    if (__privateGet(this, _nodeHovering) > -1) {
      __privateMethod(this, _selectNodeByIndex, selectNodeByIndex_fn).call(this, __privateGet(this, _nodeHovering), !ctrlKey);
      for (let i = 0; i < __privateGet(this, _nodes).length; i++) {
        if (__privateGet(this, _nodes)[i].selected()) {
          __privateGet(this, _nodesGrabbed).Push(i);
        }
      }
      hoveringSomething = true;
    }
    if (__privateGet(this, _widgetHovering) !== null) {
      __privateGet(this, _widgetHovering).ClickStart();
      __privateSet(this, _widgetCurrentlyClicking, __privateGet(this, _widgetHovering));
      hoveringSomething = true;
    }
    if (__privateGet(this, _portHovering) === null) {
      if (ctrlKey && !hoveringSomething) {
        camera.screenSpaceToGraphSpace(mousePosition, __privateGet(this, _boxSelectStart_graphSpace));
        CopyVector2(__privateGet(this, _boxSelectEnd_graphSpace), __privateGet(this, _boxSelectStart_graphSpace));
        __privateSet(this, _boxSelect, true);
      }
      return hoveringSomething || ctrlKey;
    }
    if (__privateGet(this, _portHovering).InputPort) {
      for (let i = 0; i < __privateGet(this, _connections2).length; i++) {
        if (__privateGet(this, _connections2)[i].inPort() === __privateGet(this, _portHovering).Port) {
          __privateGet(this, _connections2)[i].clearInput();
          __privateSet(this, _connectionSelected, __privateGet(this, _connections2)[i]);
        }
      }
    } else {
      let inNode = __privateGet(this, _portHovering).Node;
      let inNodeIndex = __privateGet(this, _portHovering).Index;
      let outNode = __privateGet(this, _portHovering).Node;
      let outNodeIndex = __privateGet(this, _portHovering).Index;
      if (__privateGet(this, _portHovering).InputPort) {
        outNode = null;
        outNodeIndex = -1;
      } else {
        inNode = null;
        inNodeIndex = -1;
      }
      const connection = new Connection2(inNode, inNodeIndex, outNode, outNodeIndex, __privateGet(this, _idleConnectionRenderer));
      __privateSet(this, _connectionSelected, connection);
      __privateGet(this, _connections2).push(connection);
    }
    return true;
  }
  mouseDragEvent(delta, scale) {
    let nodeMoved = false;
    VectorPool.run(() => {
      const scaledDelta = VectorPool.get();
      scaledDelta.x = delta.x / scale;
      scaledDelta.y = delta.y / scale;
      AddVector2(__privateGet(this, _boxSelectEnd_graphSpace), __privateGet(this, _boxSelectEnd_graphSpace), scaledDelta);
      if (__privateMethod(this, _interactingWithNode, interactingWithNode_fn).call(this)) {
        for (let i = 0; i < __privateGet(this, _nodesGrabbed).Count(); i++) {
          const node = __privateGet(this, _nodes)[__privateGet(this, _nodesGrabbed).At(i)];
          if (node.locked()) {
            continue;
          }
          node.translate(scaledDelta);
          nodeMoved = true;
        }
      }
    });
    if (nodeMoved) {
      return true;
    }
    return __privateMethod(this, _interactingWithConnection, interactingWithConnection_fn).call(this) || __privateMethod(this, _interactingWithWidget, interactingWithWidget_fn).call(this) || __privateGet(this, _boxSelect);
  }
  clearNodeInputConnection(node, index) {
    const port = node.inputPort(index);
    for (let i = __privateGet(this, _connections2).length - 1; i >= 0; i--) {
      if (__privateGet(this, _connections2)[i].inPort() === port) {
        __privateMethod(this, _removeConnection, removeConnection_fn).call(this, __privateGet(this, _connections2)[i]);
      }
    }
  }
  clickEnd() {
    var _a, _b;
    __privateGet(this, _nodesGrabbed).Clear();
    if (__privateGet(this, _boxSelect)) {
      for (let i = 0; i < __privateGet(this, _boxSelectionNodes).Count(); i++) {
        __privateMethod(this, _selectNode, selectNode_fn).call(this, __privateGet(this, _nodes)[__privateGet(this, _boxSelectionNodes).At(i)], false);
      }
      __privateGet(this, _boxSelectionNodes).Clear();
      __privateSet(this, _boxSelect, false);
    }
    if (__privateGet(this, _widgetCurrentlyClicking) !== null) {
      __privateGet(this, _widgetCurrentlyClicking).ClickEnd();
      __privateSet(this, _widgetCurrentlyClicking, null);
    }
    if (__privateGet(this, _connectionSelected) === null) {
      return;
    }
    if (__privateGet(this, _portHovering) === null) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    const port = __privateGet(this, _portHovering).Port;
    const conn = __privateGet(this, _connectionSelected);
    if (port === conn.inPort() || port === conn.outPort()) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    if (__privateGet(this, _portHovering).InputPort && conn.inPort() !== null) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    if (!__privateGet(this, _portHovering).InputPort && conn.outPort() !== null) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    if (__privateGet(this, _portHovering).InputPort && __privateGet(this, _portHovering).Port.getType() !== ((_a = conn.outPort()) == null ? void 0 : _a.getType())) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    if (!__privateGet(this, _portHovering).InputPort && __privateGet(this, _portHovering).Port.getType() !== ((_b = conn.inPort()) == null ? void 0 : _b.getType())) {
      __privateMethod(this, _clearCurrentlySelectedConnection, clearCurrentlySelectedConnection_fn).call(this);
      return;
    }
    if (__privateGet(this, _portHovering).InputPort) {
      this.clearNodeInputConnection(__privateGet(this, _portHovering).Node, __privateGet(this, _portHovering).Index);
      conn.setInput(__privateGet(this, _portHovering).Node, __privateGet(this, _portHovering).Index);
    } else {
      conn.setOutput(__privateGet(this, _portHovering).Node, __privateGet(this, _portHovering).Index);
    }
    __privateSet(this, _connectionSelected, null);
  }
  connectNodes(nodeOut, outPort, nodeIn, inPort) {
    const outType = nodeOut.outputPort(outPort).getType();
    const inType = nodeIn.inputPort(inPort).getType();
    if (outType !== inType) {
      console.error("can't connect nodes of different types", outType, inType);
      return;
    }
    const connection = new Connection2(
      nodeIn,
      inPort,
      nodeOut,
      outPort,
      __privateGet(this, _idleConnectionRenderer)
    );
    __privateGet(this, _connections2).push(connection);
    return connection;
  }
  getNodes() {
    return __privateGet(this, _nodes);
  }
  connectedInputsNodeReferencesByIndex(nodeIndex) {
    return this.connectedInputsNodeReferences(__privateGet(this, _nodes)[nodeIndex]);
  }
  connectedInputsNodeReferences(node) {
    const connections = new Array();
    for (let i = 0; i < __privateGet(this, _connections2).length; i++) {
      const connection = __privateGet(this, _connections2)[i];
      if (node !== connection.inNode()) {
        continue;
      }
      const outNode = connection.outNode();
      if (outNode === null) {
        continue;
      }
      connections.push(outNode);
    }
    return connections;
  }
  connectedOutputsNodeReferences(nodeIndex) {
    const node = __privateGet(this, _nodes)[nodeIndex];
    const connections = new Array();
    for (let i = 0; i < __privateGet(this, _connections2).length; i++) {
      const connection = __privateGet(this, _connections2)[i];
      if (node !== connection.outNode()) {
        continue;
      }
      const inNode = connection.inNode();
      if (inNode === null) {
        continue;
      }
      connections.push(inNode);
    }
    return connections;
  }
  addNode(node) {
    __privateGet(this, _nodes).push(node);
  }
  fileDrop(file) {
    if (__privateGet(this, _nodeHovering) === -1) {
      return false;
    }
    __privateGet(this, _nodes)[__privateGet(this, _nodeHovering)].dropFile(file);
    return true;
  }
  organize(ctx) {
    Organize(ctx, this);
  }
  openContextMenu(ctx, position) {
    var _a, _b, _c;
    const organizeNodesSubMenu = {
      name: "Organize",
      group: nodeFlowGroup,
      items: [
        {
          name: "All Nodes",
          group: nodeFlowGroup,
          callback: () => {
            this.organize(ctx);
          }
        }
      ]
    };
    let config = {
      items: [],
      subMenus: [
        organizeNodesSubMenu,
        __privateGet(this, _nodeFactory).openMenu(this, position)
      ]
    };
    if (__privateMethod(this, _nodesSelected, nodesSelected_fn).call(this).length > 0) {
      (_a = organizeNodesSubMenu.items) == null ? void 0 : _a.push({
        name: "Selected Nodes",
        group: nodeFlowGroup,
        callback: () => {
          __privateMethod(this, _organizeSelected, organizeSelected_fn).call(this, ctx);
        }
      });
    }
    if (__privateGet(this, _nodeHovering) > -1) {
      const nodeToReview = __privateGet(this, _nodeHovering);
      const nodeToReviewNode = __privateGet(this, _nodes)[nodeToReview];
      (_b = config.subMenus) == null ? void 0 : _b.push({
        group: nodeFlowGroup,
        name: "Select",
        items: [
          {
            name: "Direct Connected Nodes",
            group: nodeFlowGroup,
            callback: () => {
              __privateMethod(this, _selectConnectedNodes, selectConnectedNodes_fn).call(this, nodeToReview);
            }
          },
          {
            name: "Input Nodes + Descendents",
            group: nodeFlowGroup,
            callback: () => {
              __privateMethod(this, _selectInputNodesAndDescendents, selectInputNodesAndDescendents_fn).call(this, nodeToReviewNode);
            }
          }
        ]
      });
      (_c = config.subMenus) == null ? void 0 : _c.push({
        group: nodeFlowGroup,
        name: "Delete",
        items: [
          {
            name: "Node",
            group: nodeFlowGroup,
            callback: () => {
              __privateMethod(this, _removeNodeByIndex, removeNodeByIndex_fn).call(this, nodeToReview);
            }
          },
          {
            name: "Connections",
            group: nodeFlowGroup,
            callback: () => {
              __privateMethod(this, _removeNodeConnections, removeNodeConnections_fn).call(this, nodeToReview);
            }
          }
        ]
      });
      config = CombineContextMenus(config, nodeToReviewNode.contextMenu());
    }
    return config;
  }
  render(ctx, camera, mousePosition) {
    __privateSet(this, _cursor, "default" /* Default */);
    TimeExecution("Render_Connections", () => {
      __privateMethod(this, _renderConnections, renderConnections_fn).call(this, ctx, camera, mousePosition);
    });
    TimeExecution("Render_Nodes", () => {
      __privateMethod(this, _renderNodes, renderNodes_fn).call(this, ctx, camera, mousePosition);
    });
    if (__privateGet(this, _boxSelect)) {
      const box = __privateMethod(this, _boxSelectionScreenspaceBox, boxSelectionScreenspaceBox_fn).call(this, camera);
      ctx.setLineDash([Theme.BoxSelect.LineDashLength]);
      __privateGet(this, _boxSelectStyle).Draw(ctx, box, 1);
      ctx.setLineDash([]);
    }
    return { cursorStyle: __privateGet(this, _cursor) };
  }
};
_nodes = new WeakMap();
_connections2 = new WeakMap();
_nodeHovering = new WeakMap();
_nodesGrabbed = new WeakMap();
_connectionSelected = new WeakMap();
_idleConnectionRenderer = new WeakMap();
_portHovering = new WeakMap();
_widgetHovering = new WeakMap();
_widgetCurrentlyClicking = new WeakMap();
_cursor = new WeakMap();
_nodeFactory = new WeakMap();
_boxSelect = new WeakMap();
_boxSelectStart_graphSpace = new WeakMap();
_boxSelectEnd_graphSpace = new WeakMap();
_boxSelectionNodes = new WeakMap();
_boxSelectStyle = new WeakMap();
_removeNodeConnections = new WeakSet();
removeNodeConnections_fn = function(nodeIndex) {
  if (nodeIndex >= __privateGet(this, _nodes).length || nodeIndex < 0) {
    console.error("invalid node connection");
    return;
  }
  for (let i = __privateGet(this, _connections2).length - 1; i >= 0; i--) {
    if (__privateGet(this, _connections2)[i].referencesNode(__privateGet(this, _nodes)[nodeIndex])) {
      __privateMethod(this, _removeConnectionByIndex, removeConnectionByIndex_fn).call(this, i);
    }
  }
};
_interactingWithNode = new WeakSet();
interactingWithNode_fn = function() {
  return __privateGet(this, _nodesGrabbed).Count() > 0;
};
_interactingWithConnection = new WeakSet();
interactingWithConnection_fn = function() {
  return __privateGet(this, _connectionSelected) !== null;
};
_interactingWithWidget = new WeakSet();
interactingWithWidget_fn = function() {
  return __privateGet(this, _widgetCurrentlyClicking) !== null;
};
_removeNodeByIndex = new WeakSet();
removeNodeByIndex_fn = function(nodeIndex) {
  __privateMethod(this, _removeNodeConnections, removeNodeConnections_fn).call(this, nodeIndex);
  __privateGet(this, _nodes).splice(nodeIndex, 1);
};
_removeConnectionByIndex = new WeakSet();
removeConnectionByIndex_fn = function(index) {
  __privateGet(this, _connections2)[index].clearPorts();
  __privateGet(this, _connections2).splice(index, 1);
};
_removeConnection = new WeakSet();
removeConnection_fn = function(connection) {
  const index = __privateGet(this, _connections2).indexOf(connection);
  if (index > -1) {
    __privateMethod(this, _removeConnectionByIndex, removeConnectionByIndex_fn).call(this, index);
  } else {
    console.error("no connection found to remove");
  }
};
_nodesSelected = new WeakSet();
nodesSelected_fn = function() {
  const selected = new Array();
  for (let i = 0; i < __privateGet(this, _nodes).length; i++) {
    if (__privateGet(this, _nodes)[i].selected()) {
      selected.push(i);
    }
  }
  return selected;
};
_organizeSelected = new WeakSet();
organizeSelected_fn = function(ctx) {
  Organize(ctx, this, __privateMethod(this, _nodesSelected, nodesSelected_fn).call(this));
};
_selectInputNodesAndDescendents = new WeakSet();
selectInputNodesAndDescendents_fn = function(node) {
  if (node === void 0) {
    return;
  }
  __privateMethod(this, _selectNode, selectNode_fn).call(this, node, false);
  const inputs = this.connectedInputsNodeReferences(node);
  for (let i = 0; i < inputs.length; i++) {
    __privateMethod(this, _selectInputNodesAndDescendents, selectInputNodesAndDescendents_fn).call(this, inputs[i]);
  }
};
_selectConnectedNodes = new WeakSet();
selectConnectedNodes_fn = function(nodeIndex) {
  const node = __privateGet(this, _nodes)[nodeIndex];
  if (node === void 0) {
    return;
  }
  __privateMethod(this, _selectNode, selectNode_fn).call(this, node, false);
  const outputs = this.connectedOutputsNodeReferences(nodeIndex);
  for (let i = 0; i < outputs.length; i++) {
    __privateMethod(this, _selectNode, selectNode_fn).call(this, outputs[i], false);
  }
  const inputs = this.connectedInputsNodeReferencesByIndex(nodeIndex);
  for (let i = 0; i < inputs.length; i++) {
    __privateMethod(this, _selectNode, selectNode_fn).call(this, inputs[i], false);
  }
};
_selectNodeByIndex = new WeakSet();
selectNodeByIndex_fn = function(nodeIndex, unselectOthers) {
  __privateMethod(this, _selectNode, selectNode_fn).call(this, __privateGet(this, _nodes)[nodeIndex], unselectOthers);
};
_selectNode = new WeakSet();
selectNode_fn = function(node, unselectOthers) {
  node.select();
  if (!unselectOthers) {
    return;
  }
  for (let i = 0; i < __privateGet(this, _nodes).length; i++) {
    if (node === __privateGet(this, _nodes)[i]) {
      continue;
    }
    __privateGet(this, _nodes)[i].unselect();
  }
};
_clearCurrentlySelectedConnection = new WeakSet();
clearCurrentlySelectedConnection_fn = function() {
  if (__privateGet(this, _connectionSelected) === null) {
    return;
  }
  __privateMethod(this, _removeConnection, removeConnection_fn).call(this, __privateGet(this, _connectionSelected));
  __privateSet(this, _connectionSelected, null);
};
_renderConnections = new WeakSet();
renderConnections_fn = function(ctx, camera, mousePosition) {
  for (let i = 0; i < __privateGet(this, _connections2).length; i++) {
    let portMousedOver = false;
    if (mousePosition !== void 0) {
      portMousedOver = __privateGet(this, _connections2)[i].mouseOverPort(mousePosition) !== null;
    }
    __privateGet(this, _connections2)[i].render(ctx, camera.zoom, portMousedOver, mousePosition);
  }
};
_renderNodes = new WeakSet();
renderNodes_fn = function(ctx, camera, mousePosition) {
  __privateSet(this, _portHovering, null);
  __privateSet(this, _widgetHovering, null);
  __privateSet(this, _nodeHovering, -1);
  __privateGet(this, _boxSelectionNodes).Clear();
  const selectedBox_Screenspace = __privateMethod(this, _boxSelectionScreenspaceBox, boxSelectionScreenspaceBox_fn).call(this, camera);
  for (let i = 0; i < __privateGet(this, _nodes).length; i++) {
    let state = 0 /* Idle */;
    if (mousePosition !== void 0 && !__privateGet(this, _boxSelect)) {
      const intersection = __privateGet(this, _nodes)[i].inBounds(ctx, camera, mousePosition);
      if (intersection.Node !== void 0 && intersection.PortIndex === void 0 && intersection.Widget === void 0) {
        state = 1 /* MouseOver */;
        __privateSet(this, _nodeHovering, i);
        __privateSet(this, _cursor, "grab" /* Grab */);
      }
      if (intersection.Widget !== void 0) {
        __privateSet(this, _widgetHovering, intersection.Widget);
        __privateSet(this, _cursor, "pointer" /* Pointer */);
      }
      if (intersection.Port !== void 0 && intersection.Node !== void 0 && intersection.PortIndex !== void 0 && intersection.PortIsInput !== void 0) {
        __privateSet(this, _portHovering, {
          Index: intersection.PortIndex,
          Node: intersection.Node,
          Port: intersection.Port,
          InputPort: intersection.PortIsInput
        });
      }
    } else if (__privateGet(this, _boxSelect)) {
      const nodeBounds = __privateGet(this, _nodes)[i].calculateBounds(ctx, camera);
      if (BoxIntersection(selectedBox_Screenspace, nodeBounds)) {
        state = 1 /* MouseOver */;
        __privateGet(this, _boxSelectionNodes).Push(i);
      }
    }
    if (__privateGet(this, _nodes)[i].selected() && __privateGet(this, _nodesGrabbed).Count() > 0) {
      state = 2 /* Grabbed */;
      __privateSet(this, _cursor, "grabbing" /* Grabbing */);
    }
    __privateGet(this, _nodes)[i].render(ctx, camera, state, mousePosition);
  }
};
_boxSelectionScreenspaceBox = new WeakSet();
boxSelectionScreenspaceBox_fn = function(camera) {
  const box = { Position: Zero(), Size: Zero() };
  camera.graphSpaceToScreenSpace(__privateGet(this, _boxSelectStart_graphSpace), box.Position);
  camera.graphSpaceToScreenSpace(__privateGet(this, _boxSelectEnd_graphSpace), box.Size);
  SubVector2(box.Size, box.Size, box.Position);
  return box;
};

// src/popups/form.ts
function FormPopup(config) {
  let input = new Array();
  const setOption = "Set";
  const cancelOption = "Cancel";
  return new Popup({
    title: config.title,
    options: [setOption, cancelOption],
    content: () => {
      const container = document.createElement("div");
      container.style.flexDirection = "column";
      container.style.display = "flex";
      for (let i = 0; i < config.form.length; i++) {
        const title = document.createElement("h4");
        title.innerText = config.form[i].name;
        container.append(title);
        const ele = document.createElement("input");
        ele.value = config.form[i].startingValue;
        ele.type = config.form[i].type;
        container.append(ele);
        input.push(ele);
        container.append(document.createElement("br"));
      }
      return container;
    },
    onClose: (button) => {
      var _a;
      if (button !== setOption || input === null) {
        if (config.onCancel) {
          config.onCancel();
        }
        return;
      }
      const values = new Array();
      for (let i = 0; i < config.form.length; i++) {
        values[i] = (_a = input[i]) == null ? void 0 : _a.value;
      }
      config.onUpdate(values);
    }
  });
}

// src/node.ts
var _position, _title2, _input, _output, _widgets, _locked, _canEdit, _contextMenu2, _onSelect, _onUnselect, _onFiledrop, _titleStyle, _selectedStyle, _stateStyles, _padding, _portTextStyle, _elementSpacing, _selected, _inputPortPositions, _outputPortPositions, _widgetPositions, _data, _registeredAnyPropertyChangeCallbacks, _registeredPropertyChangeCallbacks, _popupNodeTitleSelection, popupNodeTitleSelection_fn, _popupNewButtonWidget, popupNewButtonWidget_fn, _widgetSubmenu, widgetSubmenu_fn, _calculateStyle, calculateStyle_fn;
var MINIMUM_NODE_WIDTH = 150;
var NodeState = /* @__PURE__ */ ((NodeState2) => {
  NodeState2[NodeState2["Idle"] = 0] = "Idle";
  NodeState2[NodeState2["MouseOver"] = 1] = "MouseOver";
  NodeState2[NodeState2["Grabbed"] = 2] = "Grabbed";
  return NodeState2;
})(NodeState || {});
var FlowNode11 = class {
  constructor(config) {
    __privateAdd(this, _popupNodeTitleSelection);
    __privateAdd(this, _popupNewButtonWidget);
    __privateAdd(this, _widgetSubmenu);
    __privateAdd(this, _calculateStyle);
    __privateAdd(this, _position, void 0);
    __privateAdd(this, _title2, void 0);
    __privateAdd(this, _input, void 0);
    __privateAdd(this, _output, void 0);
    __privateAdd(this, _widgets, void 0);
    __privateAdd(this, _locked, void 0);
    __privateAdd(this, _canEdit, void 0);
    __privateAdd(this, _contextMenu2, void 0);
    __privateAdd(this, _onSelect, void 0);
    __privateAdd(this, _onUnselect, void 0);
    __privateAdd(this, _onFiledrop, void 0);
    __privateAdd(this, _titleStyle, void 0);
    __privateAdd(this, _selectedStyle, void 0);
    __privateAdd(this, _stateStyles, void 0);
    __privateAdd(this, _padding, void 0);
    __privateAdd(this, _portTextStyle, void 0);
    __privateAdd(this, _elementSpacing, void 0);
    __privateAdd(this, _selected, void 0);
    __privateAdd(this, _inputPortPositions, void 0);
    __privateAdd(this, _outputPortPositions, void 0);
    __privateAdd(this, _widgetPositions, void 0);
    __privateAdd(this, _data, void 0);
    __privateAdd(this, _registeredAnyPropertyChangeCallbacks, void 0);
    __privateAdd(this, _registeredPropertyChangeCallbacks, void 0);
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    __privateSet(this, _input, new Array());
    __privateSet(this, _output, new Array());
    __privateSet(this, _widgets, new Array());
    __privateSet(this, _inputPortPositions, new List());
    __privateSet(this, _outputPortPositions, new List());
    __privateSet(this, _widgetPositions, new List());
    __privateSet(this, _elementSpacing, 15);
    __privateSet(this, _locked, (config == null ? void 0 : config.locked) === void 0 ? false : config.locked);
    __privateSet(this, _data, (config == null ? void 0 : config.data) === void 0 ? {} : config == null ? void 0 : config.data);
    __privateSet(this, _registeredPropertyChangeCallbacks, /* @__PURE__ */ new Map());
    __privateSet(this, _registeredAnyPropertyChangeCallbacks, new Array());
    __privateSet(this, _canEdit, (config == null ? void 0 : config.canEdit) === void 0 ? false : config.canEdit);
    __privateSet(this, _contextMenu2, (config == null ? void 0 : config.contextMenu) === void 0 ? null : config.contextMenu);
    __privateSet(this, _selected, false);
    __privateSet(this, _onSelect, new Array());
    __privateSet(this, _onUnselect, new Array());
    __privateSet(this, _onFiledrop, new Array());
    if (config == null ? void 0 : config.onSelect) {
      __privateGet(this, _onSelect).push(config == null ? void 0 : config.onSelect);
    }
    if (config == null ? void 0 : config.onUnselect) {
      __privateGet(this, _onUnselect).push(config == null ? void 0 : config.onUnselect);
    }
    if (config == null ? void 0 : config.onFileDrop) {
      __privateGet(this, _onFiledrop).push(config == null ? void 0 : config.onFileDrop);
    }
    __privateSet(this, _position, (config == null ? void 0 : config.position) === void 0 ? { x: 0, y: 0 } : config.position);
    __privateSet(this, _title2, new Text(
      (config == null ? void 0 : config.title) === void 0 ? "" : config.title,
      TextStyleFallback((_a = config == null ? void 0 : config.titleStyle) == null ? void 0 : _a.textStyle, {
        size: 16,
        weight: "bold" /* Bold */,
        color: Theme.Node.FontColor
      })
    ));
    __privateSet(this, _padding, ((_b = config == null ? void 0 : config.titleStyle) == null ? void 0 : _b.padding) === void 0 ? 15 : (_c = config == null ? void 0 : config.titleStyle) == null ? void 0 : _c.padding);
    __privateSet(this, _stateStyles, /* @__PURE__ */ new Map());
    __privateGet(this, _stateStyles).set(0 /* Idle */, new BoxStyle(BoxStyleWithFallback(config == null ? void 0 : config.idleBorder, {
      border: { color: Theme.Node.Border.Idle, size: 1 },
      radius: Theme.Node.BorderRadius,
      color: Theme.Node.BackgroundColor
    })));
    __privateGet(this, _stateStyles).set(1 /* MouseOver */, new BoxStyle(BoxStyleWithFallback(config == null ? void 0 : config.mouseOverBorder, {
      border: { color: Theme.Node.Border.MouseOver, size: 1.1 },
      radius: Theme.Node.BorderRadius,
      color: Theme.Node.BackgroundColor
    })));
    __privateGet(this, _stateStyles).set(2 /* Grabbed */, new BoxStyle(BoxStyleWithFallback(config == null ? void 0 : config.grabbedBorder, {
      border: { color: Theme.Node.Border.Grabbed, size: 2 },
      radius: Theme.Node.BorderRadius,
      color: Theme.Node.BackgroundColor
    })));
    __privateSet(this, _selectedStyle, new BoxStyle(BoxStyleWithFallback(config == null ? void 0 : config.selectedBorder, {
      border: { color: Theme.Node.Border.Selected, size: 1 },
      radius: Theme.Node.BorderRadius,
      color: Theme.Node.BackgroundColor
    })));
    __privateSet(this, _portTextStyle, new TextStyle({
      size: ((_d = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _d.size) === void 0 ? 14 : (_e = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _e.size,
      color: ((_f = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _f.color) === void 0 ? Theme.Node.Port.FontColor : (_g = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _g.color,
      font: (_h = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _h.font,
      weight: (_i = config == null ? void 0 : config.portTextStyle) == null ? void 0 : _i.weight
    }));
    if ((config == null ? void 0 : config.inputs) !== void 0) {
      for (let i = 0; i < config.inputs.length; i++) {
        this.addInput(config.inputs[i]);
      }
    }
    if ((config == null ? void 0 : config.outputs) !== void 0) {
      for (let i = 0; i < config.outputs.length; i++) {
        this.addOutput(config.outputs[i]);
      }
    }
    if ((config == null ? void 0 : config.widgets) !== void 0) {
      for (let i = 0; i < config.widgets.length; i++) {
        const widget = config.widgets[i];
        if (widget.type === void 0) {
          continue;
        }
        this.addWidget(GlobalWidgetFactory.create(this, widget.type, widget.config));
      }
    }
  }
  selected() {
    return __privateGet(this, _selected);
  }
  select() {
    if (__privateGet(this, _selected)) {
      return;
    }
    __privateSet(this, _selected, true);
    for (let i = 0; i < __privateGet(this, _onSelect).length; i++) {
      __privateGet(this, _onSelect)[i]();
    }
  }
  addAnyPropertyChangeListener(callback) {
    if (callback === void 0 || callback === null) {
    }
    __privateGet(this, _registeredAnyPropertyChangeCallbacks).push(callback);
  }
  addPropertyChangeListener(name, callback) {
    if (!__privateGet(this, _registeredPropertyChangeCallbacks).has(name)) {
      __privateGet(this, _registeredPropertyChangeCallbacks).set(name, []);
    }
    const callbacks = __privateGet(this, _registeredPropertyChangeCallbacks).get(name);
    if (callbacks === void 0) {
      return;
    }
    callbacks.push(callback);
  }
  setProperty(name, value) {
    const oldValue = __privateGet(this, _data)[name];
    if (oldValue === value) {
      return;
    }
    __privateGet(this, _data)[name] = value;
    for (let i = 0; i < __privateGet(this, _registeredAnyPropertyChangeCallbacks).length; i++) {
      __privateGet(this, _registeredAnyPropertyChangeCallbacks)[i](name, oldValue, value);
    }
    const callbacks = __privateGet(this, _registeredPropertyChangeCallbacks).get(name);
    if (callbacks === void 0) {
      return;
    }
    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](oldValue, value);
    }
  }
  getProperty(name) {
    return __privateGet(this, _data)[name];
  }
  contextMenu() {
    var _a, _b, _c;
    let config = {
      group: nodeFlowGroup,
      items: [],
      subMenus: []
    };
    if (this.canEdit()) {
      (_a = config.subMenus) == null ? void 0 : _a.push({
        group: nodeFlowGroup,
        name: "Edit",
        items: [
          {
            name: "Title",
            callback: () => {
              __privateMethod(this, _popupNodeTitleSelection, popupNodeTitleSelection_fn).call(this);
            }
          }
        ],
        subMenus: [{
          name: "Add",
          items: [
            {
              name: "Input",
              callback: () => {
                FormPopup({
                  title: "New Input",
                  form: [
                    {
                      name: "name",
                      type: "text",
                      startingValue: "input"
                    },
                    {
                      name: "type",
                      type: "text",
                      startingValue: "string"
                    }
                  ],
                  onUpdate: (data) => {
                    this.addInput({
                      name: data[0],
                      type: data[1]
                    });
                  }
                }).Show();
              }
            },
            {
              name: "Output",
              callback: () => {
                FormPopup({
                  title: "New Output",
                  form: [
                    {
                      name: "name",
                      type: "text",
                      startingValue: "output"
                    },
                    {
                      name: "type",
                      type: "text",
                      startingValue: "string"
                    }
                  ],
                  onUpdate: (data) => {
                    this.addOutput({
                      name: data[0],
                      type: data[1]
                    });
                  }
                }).Show();
              }
            }
          ],
          subMenus: [
            __privateMethod(this, _widgetSubmenu, widgetSubmenu_fn).call(this)
          ]
        }]
      });
    }
    if (this.locked()) {
      (_b = config.items) == null ? void 0 : _b.push({
        name: "Unlock Node Position",
        group: nodeFlowGroup,
        callback: this.unlock.bind(this)
      });
    } else {
      (_c = config.items) == null ? void 0 : _c.push({
        name: "Lock Node Position",
        group: nodeFlowGroup,
        callback: this.lock.bind(this)
      });
    }
    if (__privateGet(this, _contextMenu2) !== null) {
      config = CombineContextMenus(config, __privateGet(this, _contextMenu2));
    }
    return config;
  }
  unselect() {
    if (!__privateGet(this, _selected)) {
      return;
    }
    __privateSet(this, _selected, false);
    for (let i = 0; i < __privateGet(this, _onUnselect).length; i++) {
      __privateGet(this, _onUnselect)[i]();
    }
  }
  addUnselectListener(callback) {
    __privateGet(this, _onUnselect).push(callback);
  }
  addSelectListener(callback) {
    __privateGet(this, _onSelect).push(callback);
  }
  dropFile(file) {
    for (let i = 0; i < __privateGet(this, _onFiledrop).length; i++) {
      __privateGet(this, _onFiledrop)[i](file);
    }
  }
  addFileDropListener(callback) {
    __privateGet(this, _onFiledrop).push(callback);
  }
  locked() {
    return __privateGet(this, _locked);
  }
  lock() {
    __privateSet(this, _locked, true);
  }
  unlock() {
    __privateSet(this, _locked, false);
  }
  setPosition(position) {
    CopyVector2(__privateGet(this, _position), position);
  }
  calculateBounds(ctx, camera) {
    const tempMeasurement = Zero();
    const doublePadding = __privateGet(this, _padding) * 2;
    const screenSpacePosition = Zero();
    camera.graphSpaceToScreenSpace(__privateGet(this, _position), screenSpacePosition);
    const size = Zero();
    __privateGet(this, _title2).size(ctx, 1, size);
    size.x += doublePadding;
    size.y += doublePadding + __privateGet(this, _elementSpacing) * __privateGet(this, _input).length;
    for (let i = 0; i < __privateGet(this, _input).length; i++) {
      const port = __privateGet(this, _input)[i];
      __privateGet(this, _portTextStyle).measure(ctx, 1, port.getDisplayName(), tempMeasurement);
      size.y += tempMeasurement.y;
      size.x = Math.max(size.x, tempMeasurement.x + doublePadding);
    }
    size.y += __privateGet(this, _elementSpacing) * __privateGet(this, _output).length;
    for (let i = 0; i < __privateGet(this, _output).length; i++) {
      const port = __privateGet(this, _output)[i];
      __privateGet(this, _portTextStyle).measure(ctx, 1, port.getDisplayName(), tempMeasurement);
      size.y += tempMeasurement.y;
      size.x = Math.max(size.x, tempMeasurement.x + doublePadding);
    }
    size.y += __privateGet(this, _elementSpacing) * __privateGet(this, _widgets).length;
    for (let i = 0; i < __privateGet(this, _widgets).length; i++) {
      const element = __privateGet(this, _widgets)[i];
      const eleSize = element.Size();
      size.y += eleSize.y;
      size.x = Math.max(size.x, eleSize.x + doublePadding);
    }
    size.y += __privateGet(this, _elementSpacing);
    size.x = Math.max(size.x, MINIMUM_NODE_WIDTH);
    size.x *= camera.zoom;
    size.y *= camera.zoom;
    return {
      Position: screenSpacePosition,
      Size: size
    };
  }
  addInput(config) {
    const port = new Port(this, "INPUT" /* Input */, config);
    __privateGet(this, _input).push(port);
    return port;
  }
  addOutput(config) {
    const port = new Port(this, "OUTPUT" /* Output */, config);
    __privateGet(this, _output).push(port);
    return port;
  }
  addWidget(widget) {
    __privateGet(this, _widgets).push(widget);
  }
  getWidget(index) {
    return __privateGet(this, _widgets)[index];
  }
  widgetCount() {
    return __privateGet(this, _widgets).length;
  }
  translate(delta) {
    __privateGet(this, _position).x += delta.x;
    __privateGet(this, _position).y += delta.y;
  }
  inBounds(ctx, camera, position) {
    var intersection = {};
    const box = this.calculateBounds(ctx, camera);
    if (InBox(box, position)) {
      intersection.Node = this;
    }
    for (let i = 0; i < __privateGet(this, _inputPortPositions).Count(); i++) {
      if (InBox(__privateGet(this, _inputPortPositions).At(i), position)) {
        intersection.Node = this;
        intersection.PortIndex = i;
        intersection.PortIsInput = true;
        intersection.Port = __privateGet(this, _input)[i];
      }
    }
    for (let i = 0; i < __privateGet(this, _outputPortPositions).Count(); i++) {
      if (InBox(__privateGet(this, _outputPortPositions).At(i), position)) {
        intersection.Node = this;
        intersection.PortIndex = i;
        intersection.PortIsInput = false;
        intersection.Port = __privateGet(this, _output)[i];
      }
    }
    for (let i = 0; i < __privateGet(this, _widgetPositions).Count(); i++) {
      if (InBox(__privateGet(this, _widgetPositions).At(i), position)) {
        intersection.Node = this;
        intersection.WidgetIndex = i;
        intersection.Widget = __privateGet(this, _widgets)[i];
      }
    }
    return intersection;
  }
  canEdit() {
    return __privateGet(this, _canEdit);
  }
  title() {
    return __privateGet(this, _title2).get();
  }
  setTitle(newTitle) {
    __privateGet(this, _title2).set(newTitle);
  }
  inputPortPosition(index) {
    return __privateGet(this, _inputPortPositions).At(index);
  }
  inputPort(index) {
    return __privateGet(this, _input)[index];
  }
  inputs() {
    return __privateGet(this, _input).length;
  }
  outputPortPosition(index) {
    return __privateGet(this, _outputPortPositions).At(index);
  }
  outputPort(index) {
    return __privateGet(this, _output)[index];
  }
  outputs() {
    return __privateGet(this, _output).length;
  }
  render(ctx, camera, state, mousePosition) {
    VectorPool.run(() => {
      const tempMeasurement = VectorPool.get();
      __privateGet(this, _inputPortPositions).Clear();
      __privateGet(this, _outputPortPositions).Clear();
      __privateGet(this, _widgetPositions).Clear();
      const scaledPadding = __privateGet(this, _padding) * camera.zoom;
      const scaledElementSpacing = __privateGet(this, _elementSpacing) * camera.zoom;
      const nodeBounds = this.calculateBounds(ctx, camera);
      const nodeStyle = __privateMethod(this, _calculateStyle, calculateStyle_fn).call(this, state);
      nodeStyle.Draw(ctx, nodeBounds, camera.zoom);
      const borderSize = nodeStyle.borderSize();
      ctx.textAlign = "center" /* Center */;
      ctx.textBaseline = "middle" /* Middle */;
      const titleSize = VectorPool.get();
      __privateGet(this, _title2).size(ctx, camera.zoom, titleSize);
      const titleBoxSize = VectorPool.get();
      titleBoxSize.x = nodeBounds.Size.x;
      titleBoxSize.y = titleSize.y + scaledPadding * 2;
      ctx.fillStyle = "#154050";
      ctx.beginPath();
      ctx.roundRect(
        nodeBounds.Position.x + borderSize * camera.zoom * 0.5,
        nodeBounds.Position.y + borderSize * camera.zoom * 0.5,
        titleBoxSize.x - borderSize * camera.zoom,
        titleBoxSize.y - borderSize * camera.zoom * 0.5,
        [nodeStyle.radius() * camera.zoom, nodeStyle.radius() * camera.zoom, 0, 0]
      );
      ctx.fill();
      const titlePosition = VectorPool.get();
      titlePosition.x = nodeBounds.Position.x + nodeBounds.Size.x / 2;
      titlePosition.y = nodeBounds.Position.y + scaledPadding + titleSize.y / 2;
      __privateGet(this, _title2).render(ctx, camera.zoom, titlePosition);
      let startY = nodeBounds.Position.y + scaledPadding * 2 + titleSize.y + scaledElementSpacing;
      const leftSide = nodeBounds.Position.x + scaledPadding;
      ctx.textAlign = "left" /* Left */;
      for (let i = 0; i < __privateGet(this, _input).length; i++) {
        const port = __privateGet(this, _input)[i];
        __privateGet(this, _portTextStyle).measure(ctx, camera.zoom, port.getDisplayName(), tempMeasurement);
        const position = VectorPool.get();
        position.x = nodeBounds.Position.x;
        position.y = startY + tempMeasurement.y / 2;
        __privateGet(this, _portTextStyle).setupStyle(ctx, camera.zoom);
        ctx.fillText(port.getDisplayName(), leftSide, position.y);
        __privateGet(this, _inputPortPositions).Push(port.render(ctx, position, camera, mousePosition));
        startY += tempMeasurement.y + scaledElementSpacing;
      }
      const rightSide = nodeBounds.Position.x + nodeBounds.Size.x;
      ctx.textAlign = "right" /* Right */;
      for (let i = 0; i < __privateGet(this, _output).length; i++) {
        const port = __privateGet(this, _output)[i];
        __privateGet(this, _portTextStyle).measure(ctx, camera.zoom, port.getDisplayName(), tempMeasurement);
        const position = VectorPool.get();
        position.x = rightSide;
        position.y = startY + tempMeasurement.y / 2;
        __privateGet(this, _portTextStyle).setupStyle(ctx, camera.zoom);
        ctx.fillText(port.getDisplayName(), rightSide - scaledPadding, position.y);
        __privateGet(this, _outputPortPositions).Push(port.render(ctx, position, camera, mousePosition));
        startY += tempMeasurement.y + scaledElementSpacing;
      }
      for (let i = 0; i < __privateGet(this, _widgets).length; i++) {
        const widget = __privateGet(this, _widgets)[i];
        const widgetSize = widget.Size();
        const scaledWidgetWidth = widgetSize.x * camera.zoom;
        const position = VectorPool.get();
        position.x = nodeBounds.Position.x + (nodeBounds.Size.x - scaledWidgetWidth) / 2;
        position.y = startY;
        __privateGet(this, _widgetPositions).Push(widget.Draw(ctx, position, camera.zoom, mousePosition));
        startY += widgetSize.y * camera.zoom + scaledElementSpacing;
      }
    });
  }
};
_position = new WeakMap();
_title2 = new WeakMap();
_input = new WeakMap();
_output = new WeakMap();
_widgets = new WeakMap();
_locked = new WeakMap();
_canEdit = new WeakMap();
_contextMenu2 = new WeakMap();
_onSelect = new WeakMap();
_onUnselect = new WeakMap();
_onFiledrop = new WeakMap();
_titleStyle = new WeakMap();
_selectedStyle = new WeakMap();
_stateStyles = new WeakMap();
_padding = new WeakMap();
_portTextStyle = new WeakMap();
_elementSpacing = new WeakMap();
_selected = new WeakMap();
_inputPortPositions = new WeakMap();
_outputPortPositions = new WeakMap();
_widgetPositions = new WeakMap();
_data = new WeakMap();
_registeredAnyPropertyChangeCallbacks = new WeakMap();
_registeredPropertyChangeCallbacks = new WeakMap();
_popupNodeTitleSelection = new WeakSet();
popupNodeTitleSelection_fn = function() {
  SetStringPopup({
    title: "Set Node Title",
    startingValue: this.title(),
    onUpdate: (value) => {
      this.setTitle(value);
    }
  }).Show();
};
_popupNewButtonWidget = new WeakSet();
popupNewButtonWidget_fn = function() {
  SetStringPopup({
    title: "New Button Widget Text",
    startingValue: "My Button",
    onUpdate: (value) => {
      this.addWidget(new ButtonWidget({
        text: value
      }));
    }
  }).Show();
};
_widgetSubmenu = new WeakSet();
widgetSubmenu_fn = function() {
  return {
    name: "Widget",
    items: [
      {
        name: "Button",
        callback: __privateMethod(this, _popupNewButtonWidget, popupNewButtonWidget_fn).bind(this)
      },
      {
        name: "Number",
        callback: () => {
          this.addWidget(new NumberWidget(this));
        }
      },
      {
        name: "Color",
        callback: () => {
          this.addWidget(new ColorWidget(this));
        }
      },
      {
        name: "Slider",
        callback: () => {
          FormPopup({
            title: "New Slider",
            form: [
              {
                name: "min",
                type: "number",
                startingValue: 0
              },
              {
                name: "max",
                type: "number",
                startingValue: 100
              }
            ],
            onUpdate: (data) => {
              this.addWidget(new SliderWidget(this, {
                min: data[0],
                max: data[1]
              }));
            }
          }).Show();
        }
      },
      {
        name: "String",
        callback: () => {
          this.addWidget(new StringWidget(this));
        }
      },
      {
        name: "Toggle",
        callback: () => {
          this.addWidget(new ToggleWidget(this));
        }
      },
      {
        name: "Image",
        callback: () => {
          FormPopup({
            title: "New Image",
            form: [
              {
                name: "URL",
                type: "text",
                startingValue: "https://pbs.twimg.com/media/GYabtu6bsAA7m99?format=jpg&name=medium"
              },
              {
                name: "Max Width",
                type: "number",
                startingValue: MINIMUM_NODE_WIDTH
              },
              {
                name: "Max Height",
                type: "number",
                startingValue: MINIMUM_NODE_WIDTH
              }
            ],
            onUpdate: (data) => {
              this.addWidget(new ImageWidget({
                image: data[0],
                maxWidth: data[1],
                maxHeight: data[2]
              }));
            }
          }).Show();
        }
      }
    ]
  };
};
_calculateStyle = new WeakSet();
calculateStyle_fn = function(state) {
  if (__privateGet(this, _selected) && state === 0 /* Idle */) {
    return __privateGet(this, _selectedStyle);
  }
  let boxStyle = __privateGet(this, _stateStyles).get(state);
  if (boxStyle === void 0) {
    throw new Error("no registered border style for state: " + state);
  }
  return boxStyle;
};

// src/markdown/token.ts
var _type, _lexeme, _tokenStart, _tokenEnd;
var MarkdownTokenType = /* @__PURE__ */ ((MarkdownTokenType2) => {
  MarkdownTokenType2["Text"] = "Text";
  MarkdownTokenType2["H1"] = "H1";
  MarkdownTokenType2["H2"] = "H2";
  MarkdownTokenType2["H3"] = "H3";
  MarkdownTokenType2["NewLine"] = "New Line";
  MarkdownTokenType2["Star"] = "Star";
  MarkdownTokenType2["Space"] = "Space";
  MarkdownTokenType2["BackTick"] = "`";
  return MarkdownTokenType2;
})(MarkdownTokenType || {});
var MarkdownToken = class {
  constructor(type, lexeme, tokenStart, tokenEnd) {
    __privateAdd(this, _type, void 0);
    __privateAdd(this, _lexeme, void 0);
    __privateAdd(this, _tokenStart, void 0);
    __privateAdd(this, _tokenEnd, void 0);
    __privateSet(this, _type, type);
    __privateSet(this, _lexeme, lexeme);
    __privateSet(this, _tokenStart, tokenStart);
    __privateSet(this, _tokenEnd, tokenEnd);
  }
  type() {
    return __privateGet(this, _type);
  }
  lexeme() {
    return __privateGet(this, _lexeme);
  }
  tokenStart() {
    return __privateGet(this, _tokenStart);
  }
  tokenEnd() {
    return __privateGet(this, _tokenEnd);
  }
};
_type = new WeakMap();
_lexeme = new WeakMap();
_tokenStart = new WeakMap();
_tokenEnd = new WeakMap();

// src/markdown/lexicalParser.ts
var _body, _index, _tokens, _current, current_fn, _inc, inc_fn, _next, next_fn, _lastToken, _addToken, addToken_fn, _h2, h2_fn, _h1, h1_fn, _whiteSpace, whiteSpace_fn, _text6, text_fn;
var MarkdownLexicalParser = class {
  constructor(body) {
    __privateAdd(this, _current);
    __privateAdd(this, _inc);
    __privateAdd(this, _next);
    __privateAdd(this, _addToken);
    __privateAdd(this, _h2);
    __privateAdd(this, _h1);
    __privateAdd(this, _whiteSpace);
    __privateAdd(this, _text6);
    __privateAdd(this, _body, void 0);
    __privateAdd(this, _index, void 0);
    __privateAdd(this, _tokens, void 0);
    __privateAdd(this, _lastToken, 0);
    __privateSet(this, _index, 0);
    __privateSet(this, _body, body);
    __privateSet(this, _tokens, new Array());
  }
  tokens() {
    return __privateGet(this, _tokens);
  }
  parse() {
    let char = __privateMethod(this, _current, current_fn).call(this);
    while (char !== "") {
      if (char === " " || char === "	") {
        __privateMethod(this, _whiteSpace, whiteSpace_fn).call(this);
      } else if (char === "#") {
        __privateMethod(this, _h1, h1_fn).call(this);
      } else if (char === "\n") {
        __privateMethod(this, _addToken, addToken_fn).call(this, "New Line" /* NewLine */, "\n");
        __privateMethod(this, _inc, inc_fn).call(this);
      } else if (char === "*") {
        __privateMethod(this, _addToken, addToken_fn).call(this, "Star" /* Star */, "*");
        __privateMethod(this, _inc, inc_fn).call(this);
      } else if (char === "`") {
        __privateMethod(this, _addToken, addToken_fn).call(this, "`" /* BackTick */, "`");
        __privateMethod(this, _inc, inc_fn).call(this);
      } else {
        __privateMethod(this, _text6, text_fn).call(this);
      }
      char = __privateMethod(this, _current, current_fn).call(this);
    }
  }
};
_body = new WeakMap();
_index = new WeakMap();
_tokens = new WeakMap();
_current = new WeakSet();
current_fn = function() {
  if (__privateGet(this, _index) > __privateGet(this, _body).length - 1) {
    return "";
  }
  return __privateGet(this, _body).charAt(__privateGet(this, _index));
};
_inc = new WeakSet();
inc_fn = function() {
  __privateWrapper(this, _index)._++;
};
_next = new WeakSet();
next_fn = function() {
  __privateWrapper(this, _index)._++;
  if (__privateGet(this, _index) > __privateGet(this, _body).length - 1) {
    return "";
  }
  return __privateGet(this, _body).charAt(__privateGet(this, _index));
};
_lastToken = new WeakMap();
_addToken = new WeakSet();
addToken_fn = function(token, lexeme) {
  __privateGet(this, _tokens).push(new MarkdownToken(token, lexeme, __privateGet(this, _lastToken), __privateGet(this, _index)));
  __privateSet(this, _lastToken, __privateGet(this, _index));
};
_h2 = new WeakSet();
h2_fn = function() {
  let char = __privateMethod(this, _next, next_fn).call(this);
  if (char === "#") {
    __privateMethod(this, _addToken, addToken_fn).call(this, "H3" /* H3 */, "###");
    __privateMethod(this, _inc, inc_fn).call(this);
  } else {
    __privateMethod(this, _addToken, addToken_fn).call(this, "H2" /* H2 */, "##");
  }
};
_h1 = new WeakSet();
h1_fn = function() {
  let char = __privateMethod(this, _next, next_fn).call(this);
  if (char === "#") {
    __privateMethod(this, _h2, h2_fn).call(this);
  } else {
    __privateMethod(this, _addToken, addToken_fn).call(this, "H1" /* H1 */, "#");
  }
};
_whiteSpace = new WeakSet();
whiteSpace_fn = function() {
  let char = __privateMethod(this, _current, current_fn).call(this);
  while (char !== "") {
    if (char !== " " && char !== "	") {
      break;
    }
    char = __privateMethod(this, _next, next_fn).call(this);
  }
  __privateMethod(this, _addToken, addToken_fn).call(this, "Space" /* Space */, " ");
};
_text6 = new WeakSet();
text_fn = function() {
  let char = __privateMethod(this, _current, current_fn).call(this);
  let started = -1;
  while (char !== "") {
    if (char === " " || char === "	") {
      if (started === -1) {
        __privateMethod(this, _inc, inc_fn).call(this);
        continue;
      }
    }
    if (char === "\n" || char === "*" || char === "`") {
      if (started != -1) {
        __privateMethod(this, _addToken, addToken_fn).call(this, "Text" /* Text */, __privateGet(this, _body).substring(started, __privateGet(this, _index)));
      }
      return;
    }
    if (started === -1) {
      started = __privateGet(this, _index);
    }
    char = __privateMethod(this, _next, next_fn).call(this);
  }
  if (started != -1) {
    __privateMethod(this, _addToken, addToken_fn).call(this, "Text" /* Text */, __privateGet(this, _body).substring(started, __privateGet(this, _index)));
  }
};

// src/markdown/entry.ts
var _text7, _calculatedPositions, _calculatedEntries, _calculatedForWidth, _calculateLayout, calculateLayout_fn, _entries, _underline, _background, _entries2, _calculatedPositions2, _calculatedEntries2, _calculatedForWidth2, _calculateLayout2, calculateLayout_fn2;
var CodeBlockEntry = class {
  constructor(text) {
    __privateAdd(this, _calculateLayout);
    __privateAdd(this, _text7, void 0);
    __privateAdd(this, _calculatedPositions, void 0);
    __privateAdd(this, _calculatedEntries, void 0);
    __privateAdd(this, _calculatedForWidth, void 0);
    __privateSet(this, _text7, text);
    __privateSet(this, _calculatedForWidth, -1);
    __privateSet(this, _calculatedEntries, new List());
    __privateSet(this, _calculatedPositions, new List());
    document.fonts.addEventListener("loadingdone", (event) => {
      __privateSet(this, _calculatedForWidth, -1);
    });
  }
  render(ctx, position, scale, maxWidth) {
    __privateMethod(this, _calculateLayout, calculateLayout_fn).call(this, ctx, maxWidth);
    let padding = Theme.Note.CodeBlock.Padding * scale;
    let max = 0;
    for (let i = 0; i < __privateGet(this, _calculatedEntries).Count(); i++) {
      const pos = __privateGet(this, _calculatedPositions).At(i);
      max = Math.max(max, pos.y * scale);
    }
    const y = position.y + max + scale * 5;
    ctx.fillStyle = Theme.Note.CodeBlock.BackgroundColor;
    ctx.beginPath();
    ctx.roundRect(
      position.x,
      position.y,
      maxWidth * scale,
      max + padding * 2,
      Theme.Note.CodeBlock.BorderRadius * scale
    );
    ctx.fill();
    for (let i = 0; i < __privateGet(this, _calculatedEntries).Count(); i++) {
      const entry = __privateGet(this, _calculatedEntries).At(i);
      const pos = __privateGet(this, _calculatedPositions).At(i);
      entry.render(ctx, scale, {
        x: pos.x * scale + position.x + padding,
        y: pos.y * scale + position.y + padding
      });
      max = Math.max(max, pos.y * scale);
    }
    return max + padding * 2;
  }
};
_text7 = new WeakMap();
_calculatedPositions = new WeakMap();
_calculatedEntries = new WeakMap();
_calculatedForWidth = new WeakMap();
_calculateLayout = new WeakSet();
calculateLayout_fn = function(ctx, maxWidth) {
  if (__privateGet(this, _calculatedForWidth) === maxWidth) {
    return;
  }
  let adjustedWith = maxWidth;
  adjustedWith -= Theme.Note.CodeBlock.Padding * 2;
  __privateGet(this, _calculatedEntries).Clear();
  __privateGet(this, _calculatedPositions).Clear();
  let curHeight = 0;
  const lineInc = __privateGet(this, _text7).style().getSize() + Theme.Note.LineSpacing;
  let entries = __privateGet(this, _text7).split("\n");
  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    const entry = entries[entryIndex];
    let lines = entry.breakIntoLines(ctx, adjustedWith);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      __privateGet(this, _calculatedEntries).Push(lines[lineIndex]);
      __privateGet(this, _calculatedPositions).Push({
        x: 0,
        y: curHeight
      });
      curHeight += lineInc;
    }
  }
  __privateSet(this, _calculatedForWidth, maxWidth);
};
var UnorderedListMarkdownEntry = class {
  constructor(entries) {
    __privateAdd(this, _entries, void 0);
    __privateSet(this, _entries, entries);
  }
  render(ctx, position, scale, maxWidth) {
    let offset = 0;
    let shift = 20;
    let pos = {
      x: position.x + shift * scale,
      y: position.y
    };
    let dot = Theme.Note.DotSize * scale;
    for (let i = 0; i < __privateGet(this, _entries).length; i++) {
      ctx.beginPath();
      ctx.arc(position.x + dot, pos.y + dot * 3, dot, 0, 2 * Math.PI);
      ctx.fill();
      offset += __privateGet(this, _entries)[i].render(ctx, pos, scale, maxWidth - shift) + scale * Theme.Note.LineSpacing * 2;
      pos.y = position.y + offset;
    }
    return offset;
  }
};
_entries = new WeakMap();
var BasicMarkdownEntry = class {
  constructor(lines, underline, background) {
    __privateAdd(this, _calculateLayout2);
    __privateAdd(this, _underline, void 0);
    __privateAdd(this, _background, void 0);
    __privateAdd(this, _entries2, void 0);
    __privateAdd(this, _calculatedPositions2, void 0);
    __privateAdd(this, _calculatedEntries2, void 0);
    __privateAdd(this, _calculatedForWidth2, void 0);
    __privateSet(this, _entries2, lines);
    __privateSet(this, _underline, underline);
    __privateSet(this, _background, background);
    __privateSet(this, _calculatedForWidth2, -1);
    __privateSet(this, _calculatedEntries2, new List());
    __privateSet(this, _calculatedPositions2, new List());
    document.fonts.addEventListener("loadingdone", (event) => {
      __privateSet(this, _calculatedForWidth2, -1);
    });
  }
  render(ctx, position, scale, maxWidth) {
    __privateMethod(this, _calculateLayout2, calculateLayout_fn2).call(this, ctx, maxWidth);
    let padding = 0;
    if (__privateGet(this, _background)) {
      padding += Theme.Note.CodeBlock.Padding * scale;
    }
    if (__privateGet(this, _background)) {
      let max2 = 0;
      for (let i = 0; i < __privateGet(this, _calculatedEntries2).Count(); i++) {
        const pos = __privateGet(this, _calculatedPositions2).At(i);
        max2 = Math.max(max2, pos.y * scale);
      }
      const y = position.y + max2 + scale * 5;
      ctx.fillStyle = Theme.Note.CodeBlock.BackgroundColor;
      ctx.beginPath();
      ctx.roundRect(
        position.x,
        position.y,
        maxWidth * scale,
        max2 + padding * 2,
        Theme.Note.CodeBlock.BorderRadius * scale
      );
      ctx.fill();
    }
    let max = 0;
    for (let i = 0; i < __privateGet(this, _calculatedEntries2).Count(); i++) {
      const entry = __privateGet(this, _calculatedEntries2).At(i);
      const pos = __privateGet(this, _calculatedPositions2).At(i);
      entry.render(ctx, scale, {
        x: pos.x * scale + position.x + padding,
        y: pos.y * scale + position.y + padding
      });
      max = Math.max(max, pos.y * scale);
    }
    if (__privateGet(this, _underline)) {
      const y = position.y + max + scale * 5;
      ctx.strokeStyle = Theme.Note.FontColor;
      ctx.lineWidth = Theme.Note.HeaderLineWidth * scale;
      ctx.beginPath();
      ctx.moveTo(position.x, y);
      ctx.lineTo(position.x + maxWidth * scale, y);
      ctx.stroke();
    }
    return max + padding * 2;
  }
};
_underline = new WeakMap();
_background = new WeakMap();
_entries2 = new WeakMap();
_calculatedPositions2 = new WeakMap();
_calculatedEntries2 = new WeakMap();
_calculatedForWidth2 = new WeakMap();
_calculateLayout2 = new WeakSet();
calculateLayout_fn2 = function(ctx, maxWidth) {
  if (__privateGet(this, _calculatedForWidth2) === maxWidth) {
    return;
  }
  let adjustedWith = maxWidth;
  if (__privateGet(this, _background)) {
    adjustedWith -= Theme.Note.CodeBlock.Padding * 2;
  }
  __privateGet(this, _calculatedEntries2).Clear();
  __privateGet(this, _calculatedPositions2).Clear();
  const curPosition = Zero();
  const texSize = Zero();
  let currentLineHeight = 0;
  const currentLineText = new List();
  const currentLineWidths = new List();
  for (let entryIndex = 0; entryIndex < __privateGet(this, _entries2).length; entryIndex++) {
    const entry = __privateGet(this, _entries2)[entryIndex];
    let lines = entry.splitAtWidth(ctx, adjustedWith - curPosition.x);
    let i = 0;
    while (lines.length > 1 && i < 100) {
      i++;
      if (lines[0].get() === "" && currentLineText.Count() === 0) {
        if (lines[1].get().length === 1) {
          lines[0] = lines[1];
          break;
        } else {
          lines = lines[1].splitAtIndex(1);
        }
      }
      if (lines[0].get() !== "") {
        lines[0].size(ctx, 1, texSize);
        currentLineHeight = Math.max(currentLineHeight, texSize.y);
        currentLineText.Push(lines[0]);
        currentLineWidths.Push(curPosition.x);
      }
      curPosition.y += currentLineHeight;
      for (let i2 = 0; i2 < currentLineText.Count(); i2++) {
        __privateGet(this, _calculatedEntries2).Push(currentLineText.At(i2));
        __privateGet(this, _calculatedPositions2).Push({ x: currentLineWidths.At(i2), y: curPosition.y });
      }
      currentLineText.Clear();
      currentLineWidths.Clear();
      curPosition.y += Theme.Note.LineSpacing;
      currentLineHeight = 0;
      curPosition.x = 0;
      lines = lines[1].splitAtWidth(ctx, adjustedWith);
    }
    if (i === 100) {
      console.log(lines);
    }
    lines[0].size(ctx, 1, texSize);
    currentLineHeight = Math.max(currentLineHeight, texSize.y);
    currentLineText.Push(lines[0]);
    currentLineWidths.Push(curPosition.x);
    curPosition.x += texSize.x;
  }
  curPosition.y += currentLineHeight;
  for (let i = 0; i < currentLineText.Count(); i++) {
    __privateGet(this, _calculatedEntries2).Push(currentLineText.At(i));
    __privateGet(this, _calculatedPositions2).Push({ x: currentLineWidths.At(i), y: curPosition.y });
  }
  __privateSet(this, _calculatedForWidth2, maxWidth);
};

// src/markdown/syntaxParser.ts
var _tokens2, _index2, _originalText, _current2, current_fn2, _inc2, inc_fn2, _next2, next_fn2, _peak, peak_fn, _peakInto, peakInto_fn, _emphasis, emphasis_fn, _text8, text_fn2, _h12, h1_fn2, _h22, h2_fn2, _h3, h3_fn, _starLineStart, starLineStart_fn, _assignStandardStyling, assignStandardStyling_fn, _backtickLineStart, backtickLineStart_fn;
var MarkdownSyntaxParser = class {
  constructor(originalText, tokens) {
    __privateAdd(this, _current2);
    __privateAdd(this, _inc2);
    __privateAdd(this, _next2);
    __privateAdd(this, _peak);
    __privateAdd(this, _peakInto);
    __privateAdd(this, _emphasis);
    __privateAdd(this, _text8);
    __privateAdd(this, _h12);
    __privateAdd(this, _h22);
    __privateAdd(this, _h3);
    __privateAdd(this, _starLineStart);
    __privateAdd(this, _assignStandardStyling);
    __privateAdd(this, _backtickLineStart);
    __privateAdd(this, _tokens2, void 0);
    __privateAdd(this, _index2, void 0);
    __privateAdd(this, _originalText, void 0);
    __privateSet(this, _originalText, originalText);
    __privateSet(this, _index2, 0);
    __privateSet(this, _tokens2, tokens);
  }
  parse() {
    let token = __privateMethod(this, _current2, current_fn2).call(this);
    const entries = new Array();
    while (token !== null) {
      switch (token.type()) {
        case "H1" /* H1 */:
          entries.push(__privateMethod(this, _h12, h1_fn2).call(this));
          break;
        case "H2" /* H2 */:
          entries.push(__privateMethod(this, _h22, h2_fn2).call(this));
          break;
        case "H3" /* H3 */:
          entries.push(__privateMethod(this, _h3, h3_fn).call(this));
          break;
        case "Text" /* Text */:
          const textEntries = __privateMethod(this, _text8, text_fn2).call(this);
          __privateMethod(this, _assignStandardStyling, assignStandardStyling_fn).call(this, textEntries);
          entries.push(new BasicMarkdownEntry(textEntries, false, false));
          break;
        case "Star" /* Star */:
          entries.push(__privateMethod(this, _starLineStart, starLineStart_fn).call(this));
          break;
        case "New Line" /* NewLine */:
          __privateMethod(this, _inc2, inc_fn2).call(this);
          break;
        case "`" /* BackTick */:
          entries.push(__privateMethod(this, _backtickLineStart, backtickLineStart_fn).call(this));
          break;
        default:
          __privateMethod(this, _inc2, inc_fn2).call(this);
      }
      token = __privateMethod(this, _current2, current_fn2).call(this);
    }
    return entries;
  }
};
_tokens2 = new WeakMap();
_index2 = new WeakMap();
_originalText = new WeakMap();
_current2 = new WeakSet();
current_fn2 = function() {
  if (__privateGet(this, _index2) > __privateGet(this, _tokens2).length - 1) {
    return null;
  }
  return __privateGet(this, _tokens2)[__privateGet(this, _index2)];
};
_inc2 = new WeakSet();
inc_fn2 = function() {
  __privateWrapper(this, _index2)._++;
};
_next2 = new WeakSet();
next_fn2 = function() {
  __privateWrapper(this, _index2)._++;
  if (__privateGet(this, _index2) >= __privateGet(this, _tokens2).length - 1) {
    return null;
  }
  return __privateGet(this, _tokens2)[__privateGet(this, _index2)];
};
_peak = new WeakSet();
peak_fn = function() {
  if (__privateGet(this, _index2) + 1 >= __privateGet(this, _tokens2).length - 1) {
    return null;
  }
  return __privateGet(this, _tokens2)[__privateGet(this, _index2) + 1];
};
_peakInto = new WeakSet();
peakInto_fn = function(amount) {
  if (__privateGet(this, _index2) + amount >= __privateGet(this, _tokens2).length - 1) {
    return null;
  }
  return __privateGet(this, _tokens2)[__privateGet(this, _index2) + amount];
};
_emphasis = new WeakSet();
emphasis_fn = function() {
  let token = __privateMethod(this, _next2, next_fn2).call(this);
  if ((token == null ? void 0 : token.type()) === "Space" /* Space */) {
    return [new Text("*")];
  }
  let bold = false;
  while (token !== null && token.type() === "Star" /* Star */) {
    bold = true;
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  let textContent = "";
  let boldClosed = false;
  let startingClose = false;
  let validClose = false;
  while (token !== null && token.type() !== "New Line" /* NewLine */) {
    if (token.type() === "Star" /* Star */) {
      if (startingClose) {
        boldClosed = true;
        break;
      }
      startingClose = true;
      if (bold === false) {
        break;
      }
    }
    if (startingClose && token.type() !== "Star" /* Star */) {
      break;
    }
    if (token.type() === "Text" /* Text */) {
      textContent += token.lexeme();
      validClose = true;
    }
    if (token.type() === "Space" /* Space */) {
      textContent += token.lexeme();
      validClose = false;
    }
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  const style = {};
  if (validClose && startingClose) {
    if (boldClosed) {
      style.weight = "bold" /* Bold */;
    } else {
      style.style = "italic" /* Italic */;
    }
  }
  return [new Text(textContent, style)];
};
_text8 = new WeakSet();
text_fn2 = function() {
  let contents = new Array();
  let textContent = "";
  let token = __privateMethod(this, _current2, current_fn2).call(this);
  while (token !== null && token.type() === "Space" /* Space */) {
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  while (token !== null && token.type() !== "New Line" /* NewLine */) {
    switch (token.type()) {
      case "Text" /* Text */:
      case "H1" /* H1 */:
      case "H2" /* H2 */:
      case "H3" /* H3 */:
      case "Text" /* Text */:
      case "Space" /* Space */:
        textContent += token.lexeme();
        break;
      case "Star" /* Star */:
        if (textContent !== "") {
          contents.push(new Text(textContent));
          textContent = "";
        }
        let starText = __privateMethod(this, _emphasis, emphasis_fn).call(this);
        for (let i = 0; i < starText.length; i++) {
          contents.push(starText[i]);
        }
        break;
    }
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  if (textContent !== "") {
    contents.push(new Text(textContent));
  }
  return contents;
};
_h12 = new WeakSet();
h1_fn2 = function() {
  __privateMethod(this, _inc2, inc_fn2).call(this);
  const text = __privateMethod(this, _text8, text_fn2).call(this);
  for (let i = 0; i < text.length; i++) {
    text[i].setColor(Theme.Note.FontColor);
    text[i].setSize(Theme.Note.H1.FontSize);
    text[i].setWeight("bold" /* Bold */);
  }
  return new BasicMarkdownEntry(text, true, false);
};
_h22 = new WeakSet();
h2_fn2 = function() {
  __privateMethod(this, _inc2, inc_fn2).call(this);
  const text = __privateMethod(this, _text8, text_fn2).call(this);
  for (let i = 0; i < text.length; i++) {
    text[i].setColor(Theme.Note.FontColor);
    text[i].setSize(Theme.Note.H2.FontSize);
    text[i].setWeight("bold" /* Bold */);
  }
  return new BasicMarkdownEntry(text, true, false);
};
_h3 = new WeakSet();
h3_fn = function() {
  __privateMethod(this, _inc2, inc_fn2).call(this);
  const text = __privateMethod(this, _text8, text_fn2).call(this);
  for (let i = 0; i < text.length; i++) {
    text[i].setColor(Theme.Note.FontColor);
    text[i].setSize(Theme.Note.H3.FontSize);
    text[i].setWeight("bold" /* Bold */);
  }
  return new BasicMarkdownEntry(text, false, false);
};
_starLineStart = new WeakSet();
starLineStart_fn = function() {
  var _a, _b, _c;
  if (((_a = __privateMethod(this, _peak, peak_fn).call(this)) == null ? void 0 : _a.type()) !== "Space" /* Space */) {
    const starEntries = __privateMethod(this, _text8, text_fn2).call(this);
    __privateMethod(this, _assignStandardStyling, assignStandardStyling_fn).call(this, starEntries);
    return new BasicMarkdownEntry(starEntries, false, false);
  }
  const entries = new Array();
  while (((_b = __privateMethod(this, _current2, current_fn2).call(this)) == null ? void 0 : _b.type()) === "Star" /* Star */ && ((_c = __privateMethod(this, _peak, peak_fn).call(this)) == null ? void 0 : _c.type()) === "Space" /* Space */) {
    __privateMethod(this, _inc2, inc_fn2).call(this);
    const starEntries = __privateMethod(this, _text8, text_fn2).call(this);
    __privateMethod(this, _assignStandardStyling, assignStandardStyling_fn).call(this, starEntries);
    entries.push(new BasicMarkdownEntry(starEntries, false, false));
    __privateMethod(this, _inc2, inc_fn2).call(this);
  }
  return new UnorderedListMarkdownEntry(entries);
};
_assignStandardStyling = new WeakSet();
assignStandardStyling_fn = function(textEntries) {
  for (let i = 0; i < textEntries.length; i++) {
    textEntries[i].setColor(Theme.Note.FontColor);
    textEntries[i].setSize(Theme.Note.FontSize);
  }
};
_backtickLineStart = new WeakSet();
backtickLineStart_fn = function() {
  var _a, _b, _c, _d;
  if (((_a = __privateMethod(this, _peak, peak_fn).call(this)) == null ? void 0 : _a.type()) !== "`" /* BackTick */ || ((_b = __privateMethod(this, _peakInto, peakInto_fn).call(this, 2)) == null ? void 0 : _b.type()) !== "`" /* BackTick */) {
    const starEntries = __privateMethod(this, _text8, text_fn2).call(this);
    __privateMethod(this, _assignStandardStyling, assignStandardStyling_fn).call(this, starEntries);
    return new BasicMarkdownEntry(starEntries, false, false);
  }
  __privateMethod(this, _inc2, inc_fn2).call(this);
  __privateMethod(this, _inc2, inc_fn2).call(this);
  let token = __privateMethod(this, _next2, next_fn2).call(this);
  if ((token == null ? void 0 : token.type()) === "New Line" /* NewLine */) {
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  let start = token == null ? void 0 : token.tokenStart();
  let end = start;
  while (token !== null) {
    if (token.type() === "`" /* BackTick */ && ((_c = __privateMethod(this, _peak, peak_fn).call(this)) == null ? void 0 : _c.type()) === "`" /* BackTick */ && ((_d = __privateMethod(this, _peakInto, peakInto_fn).call(this, 2)) == null ? void 0 : _d.type()) === "`" /* BackTick */) {
      end = token.tokenEnd() - 1;
      break;
    }
    token = __privateMethod(this, _next2, next_fn2).call(this);
  }
  __privateMethod(this, _inc2, inc_fn2).call(this);
  __privateMethod(this, _inc2, inc_fn2).call(this);
  __privateMethod(this, _inc2, inc_fn2).call(this);
  const codeBlockText = __privateGet(this, _originalText).substring(start, end);
  const entryText = new Text(codeBlockText);
  __privateMethod(this, _assignStandardStyling, assignStandardStyling_fn).call(this, [entryText]);
  return new CodeBlockEntry(entryText);
};

// src/markdown/markdown.ts
function BuildMarkdown(data) {
  const lexicalParser = new MarkdownLexicalParser(data);
  lexicalParser.parse();
  const syntaxParser = new MarkdownSyntaxParser(data, lexicalParser.tokens());
  const contents = syntaxParser.parse();
  return contents;
}

// src/notes/note.ts
var _originalText2, _document, _width, _edittingStyle, _position2, _handleSelected, _edittingLayout, _lastRenderedBox, _hovering, _tempPosition;
var DragHandle = /* @__PURE__ */ ((DragHandle2) => {
  DragHandle2[DragHandle2["None"] = 0] = "None";
  DragHandle2[DragHandle2["Left"] = 1] = "Left";
  DragHandle2[DragHandle2["Right"] = 2] = "Right";
  return DragHandle2;
})(DragHandle || {});
;
var BOUNDS_SPACING = 20;
var BOX_SIZE = 10;
var FlowNote = class {
  constructor(config) {
    __privateAdd(this, _originalText2, void 0);
    __privateAdd(this, _document, void 0);
    __privateAdd(this, _width, void 0);
    __privateAdd(this, _edittingStyle, void 0);
    __privateAdd(this, _position2, void 0);
    __privateAdd(this, _handleSelected, void 0);
    __privateAdd(this, _edittingLayout, void 0);
    __privateAdd(this, _lastRenderedBox, void 0);
    __privateAdd(this, _hovering, void 0);
    __privateAdd(this, _tempPosition, Zero());
    __privateSet(this, _hovering, false);
    __privateSet(this, _edittingLayout, (config == null ? void 0 : config.locked) === void 0 ? true : !(config == null ? void 0 : config.locked));
    __privateSet(this, _width, (config == null ? void 0 : config.width) === void 0 ? 500 : config.width);
    __privateSet(this, _position2, (config == null ? void 0 : config.position) === void 0 ? { x: 0, y: 0 } : config.position);
    this.setText((config == null ? void 0 : config.text) === void 0 ? "" : config == null ? void 0 : config.text);
    __privateSet(this, _lastRenderedBox, { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } });
    __privateSet(this, _handleSelected, 0 /* None */);
    __privateSet(this, _edittingStyle, new BoxStyle({
      border: {
        color: "white",
        size: 1
      }
    }));
  }
  setText(text) {
    __privateSet(this, _originalText2, text);
    __privateSet(this, _document, BuildMarkdown(__privateGet(this, _originalText2)));
  }
  translate(delta) {
    __privateGet(this, _position2).x += delta.x;
    __privateGet(this, _position2).y += delta.y;
  }
  handleSelected() {
    return __privateGet(this, _handleSelected);
  }
  selectHandle(handle) {
    __privateSet(this, _handleSelected, handle);
  }
  render(ctx, camera, mousePosition) {
    if (__privateGet(this, _edittingLayout) && (__privateGet(this, _hovering) || __privateGet(this, _handleSelected) !== 0 /* None */)) {
      if (mousePosition) {
        if (__privateGet(this, _handleSelected) === 2 /* Right */) {
          const leftPosition = __privateGet(this, _position2).x * camera.zoom + camera.position.x;
          __privateSet(this, _width, Math.max((mousePosition.x - leftPosition) / camera.zoom, 1));
        } else if (__privateGet(this, _handleSelected) === 1 /* Left */) {
          const scaledWidth = __privateGet(this, _width) * camera.zoom;
          const rightPosition = __privateGet(this, _position2).x * camera.zoom + camera.position.x + scaledWidth;
          __privateSet(this, _width, Math.max((rightPosition - mousePosition.x) / camera.zoom, 1));
          __privateGet(this, _position2).x = rightPosition - __privateGet(this, _width) * camera.zoom - camera.position.x;
          __privateGet(this, _position2).x /= camera.zoom;
        }
      }
      __privateGet(this, _edittingStyle).Outline(ctx, this.leftResizeHandleBox(), camera.zoom, 2);
      __privateGet(this, _edittingStyle).Outline(ctx, this.rightResizeHandleBox(), camera.zoom, 2);
      ctx.beginPath();
      const left = __privateGet(this, _lastRenderedBox).Position.x;
      const right = __privateGet(this, _lastRenderedBox).Position.x + __privateGet(this, _lastRenderedBox).Size.x;
      const bottom = __privateGet(this, _lastRenderedBox).Position.y;
      const top = __privateGet(this, _lastRenderedBox).Position.y + __privateGet(this, _lastRenderedBox).Size.y;
      ctx.moveTo(left, bottom + __privateGet(this, _lastRenderedBox).Size.y / 2 - BOX_SIZE);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, bottom + __privateGet(this, _lastRenderedBox).Size.y / 2 - BOX_SIZE);
      ctx.moveTo(left, top - __privateGet(this, _lastRenderedBox).Size.y / 2 + BOX_SIZE);
      ctx.lineTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, top - __privateGet(this, _lastRenderedBox).Size.y / 2 + BOX_SIZE);
      ctx.stroke();
    }
    camera.graphSpaceToScreenSpace(__privateGet(this, _position2), __privateGet(this, _tempPosition));
    CopyVector2(__privateGet(this, _lastRenderedBox).Position, __privateGet(this, _tempPosition));
    const startY = __privateGet(this, _tempPosition).y;
    const lineSpacing = Theme.Note.EntrySpacing * camera.zoom;
    ctx.textAlign = "left" /* Left */;
    ctx.textBaseline = "alphabetic" /* Alphabetic */;
    for (let i = 0; i < __privateGet(this, _document).length; i++) {
      const text = __privateGet(this, _document)[i];
      __privateGet(this, _tempPosition).y += text.render(ctx, __privateGet(this, _tempPosition), camera.zoom, __privateGet(this, _width)) + lineSpacing;
    }
    __privateGet(this, _lastRenderedBox).Position.x -= BOUNDS_SPACING;
    __privateGet(this, _lastRenderedBox).Position.y -= BOUNDS_SPACING;
    __privateGet(this, _lastRenderedBox).Size.x = camera.zoom * __privateGet(this, _width) + BOUNDS_SPACING * 2;
    __privateGet(this, _lastRenderedBox).Size.y = __privateGet(this, _tempPosition).y - startY + BOUNDS_SPACING * 2;
  }
  leftResizeHandleBox() {
    return {
      Position: {
        x: __privateGet(this, _lastRenderedBox).Position.x - BOX_SIZE / 2,
        y: __privateGet(this, _lastRenderedBox).Position.y + __privateGet(this, _lastRenderedBox).Size.y / 2 - BOX_SIZE / 2
      },
      Size: { x: BOX_SIZE, y: BOX_SIZE }
    };
  }
  rightResizeHandleBox() {
    return {
      Position: {
        x: __privateGet(this, _lastRenderedBox).Position.x - BOX_SIZE / 2 + __privateGet(this, _lastRenderedBox).Size.x,
        y: __privateGet(this, _lastRenderedBox).Position.y + __privateGet(this, _lastRenderedBox).Size.y / 2 - BOX_SIZE / 2
      },
      Size: { x: BOX_SIZE, y: BOX_SIZE }
    };
  }
  edittingLayout() {
    return __privateGet(this, _edittingLayout);
  }
  setHovering(hovering) {
    __privateSet(this, _hovering, hovering);
  }
  editContent() {
    let input = null;
    let saveText = "Save";
    const popup = new Popup({
      title: "Edit Note",
      options: [saveText, "Cancel"],
      content: () => {
        const container = document.createElement("div");
        input = document.createElement("textarea");
        input.rows = 8;
        input.cols = 50;
        input.value = __privateGet(this, _originalText2);
        container.append(input);
        return container;
      },
      onClose: (button) => {
        if (button !== saveText || input === null) {
          return;
        }
        this.setText(input.value);
      }
    });
    popup.Show();
  }
  lock() {
    __privateSet(this, _edittingLayout, false);
  }
  unlock() {
    __privateSet(this, _edittingLayout, true);
  }
  bounds() {
    return __privateGet(this, _lastRenderedBox);
  }
};
_originalText2 = new WeakMap();
_document = new WeakMap();
_width = new WeakMap();
_edittingStyle = new WeakMap();
_position2 = new WeakMap();
_handleSelected = new WeakMap();
_edittingLayout = new WeakMap();
_lastRenderedBox = new WeakMap();
_hovering = new WeakMap();
_tempPosition = new WeakMap();

// src/notes/subsystem.ts
var _notes, _noteHovering, _noteSelected, _hoveringHandle, _removeNote, removeNote_fn;
var NoteSubsystem = class {
  constructor(notes) {
    __privateAdd(this, _removeNote);
    __privateAdd(this, _notes, void 0);
    __privateAdd(this, _noteHovering, void 0);
    __privateAdd(this, _noteSelected, void 0);
    __privateAdd(this, _hoveringHandle, void 0);
    __privateSet(this, _hoveringHandle, 0 /* None */);
    __privateSet(this, _notes, []);
    __privateSet(this, _noteHovering, null);
    __privateSet(this, _noteSelected, null);
    if (notes !== void 0) {
      for (let i = 0; i < notes.length; i++) {
        this.addNote(new FlowNote(notes[i]));
      }
    }
  }
  addNote(note) {
    __privateGet(this, _notes).push(note);
  }
  openContextMenu(ctx, position) {
    var _a, _b, _c;
    const group = "node-flow-graph-note-menu";
    const result = {
      items: [
        {
          name: "New Note",
          group,
          callback: () => {
            this.addNote(new FlowNote({
              text: '#Note\n\nRight-click this note and select "edit note" to put what you want here.',
              width: 300,
              position
            }));
          }
        }
      ],
      subMenus: []
    };
    if (__privateGet(this, _noteHovering) !== null) {
      const noteToReview = __privateGet(this, _noteHovering);
      (_a = result.items) == null ? void 0 : _a.push(
        {
          name: "Delete Note",
          group,
          callback: () => {
            __privateMethod(this, _removeNote, removeNote_fn).call(this, noteToReview);
          }
        },
        {
          name: "Edit Note",
          group,
          callback: noteToReview.editContent.bind(noteToReview)
        }
      );
      if (!noteToReview.edittingLayout()) {
        (_b = result.items) == null ? void 0 : _b.push({
          name: "Unlock Note",
          group,
          callback: noteToReview.unlock.bind(noteToReview)
        });
      } else {
        (_c = result.items) == null ? void 0 : _c.push({
          name: "Lock Note",
          group,
          callback: noteToReview.lock.bind(noteToReview)
        });
      }
    }
    return result;
  }
  clickStart(mousePosition, camera, ctrlKey) {
    if (__privateGet(this, _noteHovering) !== null && __privateGet(this, _noteHovering).edittingLayout()) {
      __privateSet(this, _noteSelected, __privateGet(this, _noteHovering));
      __privateGet(this, _noteSelected).selectHandle(__privateGet(this, _hoveringHandle));
      return true;
    }
    return false;
  }
  clickEnd() {
    if (__privateGet(this, _noteSelected) !== null) {
      __privateGet(this, _noteSelected).selectHandle(0 /* None */);
    }
    __privateSet(this, _noteSelected, null);
  }
  mouseDragEvent(delta, scale) {
    if (__privateGet(this, _noteSelected) === null) {
      return false;
    }
    if (__privateGet(this, _noteSelected).handleSelected()) {
      return true;
    }
    __privateGet(this, _noteSelected).translate({
      x: delta.x * (1 / scale),
      y: delta.y * (1 / scale)
    });
    return true;
  }
  fileDrop(file) {
    return false;
  }
  render(ctx, camera, mousePosition) {
    __privateSet(this, _noteHovering, null);
    __privateSet(this, _hoveringHandle, 0 /* None */);
    if (mousePosition) {
      for (let i = 0; i < __privateGet(this, _notes).length; i++) {
        __privateGet(this, _notes)[i].setHovering(false);
        if (InBox(__privateGet(this, _notes)[i].bounds(), mousePosition)) {
          __privateSet(this, _noteHovering, __privateGet(this, _notes)[i]);
        }
      }
    }
    if (__privateGet(this, _noteHovering) != null) {
      __privateGet(this, _noteHovering).setHovering(true);
      if (mousePosition) {
        if (InBox(__privateGet(this, _noteHovering).leftResizeHandleBox(), mousePosition)) {
          __privateSet(this, _hoveringHandle, 1 /* Left */);
        } else if (InBox(__privateGet(this, _noteHovering).rightResizeHandleBox(), mousePosition)) {
          __privateSet(this, _hoveringHandle, 2 /* Right */);
        }
      }
    }
    for (let i = 0; i < __privateGet(this, _notes).length; i++) {
      __privateGet(this, _notes)[i].render(ctx, camera, mousePosition);
    }
    return;
  }
};
_notes = new WeakMap();
_noteHovering = new WeakMap();
_noteSelected = new WeakMap();
_hoveringHandle = new WeakMap();
_removeNote = new WeakSet();
removeNote_fn = function(note) {
  const index = __privateGet(this, _notes).indexOf(note);
  if (index > -1) {
    __privateGet(this, _notes).splice(index, 1);
  } else {
    console.error("no note found to remove");
  }
};

// src/graph.ts
var _subsystems, _ctx, _canvas, _backgroundRenderer, _contextMenuConfig, _mousePosition2, _camera, _openedContextMenu, _contextMenuEntryHovering, _views, _currentView, _mainNodeSubsystem, _mainNoteSubsystem, _fileDrop, fileDrop_fn, _clickStart2, clickStart_fn, _sceenPositionToGraphPosition, sceenPositionToGraphPosition_fn, _openContextMenu, openContextMenu_fn, _clickEnd, clickEnd_fn, _mouseDragEvent, mouseDragEvent_fn, _lastFrameCursor, _cursor2, _render, render_fn, _renderBackground, renderBackground_fn, _renderContextMenu, renderContextMenu_fn;
function BuildBackgroundRenderer(backgroundColor) {
  return (canvas, context, position, scale) => {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const alpha = Math.round(Clamp01(scale - 0.3) * 255);
    if (alpha <= 0) {
      return;
    }
    context.fillStyle = `rgba(41, 54, 57, ${alpha})`;
    const spacing = 100;
    const pi2 = 2 * Math.PI;
    const dotScale = 2 * scale;
    for (let x = -50; x < 50; x++) {
      const xPos = x * spacing * scale + position.x;
      for (let y = -50; y < 50; y++) {
        const yPos = y * spacing * scale + position.y;
        context.beginPath();
        context.arc(xPos, yPos, dotScale, 0, pi2);
        context.fill();
      }
    }
  };
}
var contextMenuGroup = "graph-context-menu";
var GraphView = class {
  constructor(subsystems) {
    __privateAdd(this, _subsystems, void 0);
    __privateSet(this, _subsystems, subsystems);
  }
  clickStart(mousePosition, camera, ctrlKey) {
    for (let i = __privateGet(this, _subsystems).length - 1; i >= 0; i--) {
      if (__privateGet(this, _subsystems)[i].clickStart(mousePosition, camera, ctrlKey)) {
        return;
      }
    }
  }
  fileDrop(file) {
    for (let i = __privateGet(this, _subsystems).length - 1; i >= 0; i--) {
      if (__privateGet(this, _subsystems)[i].fileDrop(file)) {
        return true;
      }
    }
    return false;
  }
  openContextMenu(ctx, position) {
    let finalConfig = {};
    for (let i = 0; i < __privateGet(this, _subsystems).length; i++) {
      const subSystemMenu = __privateGet(this, _subsystems)[i].openContextMenu(ctx, position);
      if (subSystemMenu !== null) {
        finalConfig = CombineContextMenus(finalConfig, subSystemMenu);
      }
    }
    return finalConfig;
  }
  clickEnd() {
    for (let i = 0; i < __privateGet(this, _subsystems).length; i++) {
      __privateGet(this, _subsystems)[i].clickEnd();
    }
  }
  mouseDragEvent(delta, scale) {
    for (let i = 0; i < __privateGet(this, _subsystems).length; i++) {
      if (__privateGet(this, _subsystems)[i].mouseDragEvent(delta, scale)) {
        return true;
      }
    }
    return false;
  }
  render(ctx, camera, mousePosition) {
    const results = {};
    for (let i = 0; i < __privateGet(this, _subsystems).length; i++) {
      TimeExecution("Render_Subsystem_" + i, () => {
        let results2 = __privateGet(this, _subsystems)[i].render(ctx, camera, mousePosition);
        if (results2 == null ? void 0 : results2.cursorStyle) {
          results2.cursorStyle = results2 == null ? void 0 : results2.cursorStyle;
        }
      });
    }
    return results;
  }
};
_subsystems = new WeakMap();
var NodeFlowGraph2 = class {
  constructor(canvas, config) {
    __privateAdd(this, _fileDrop);
    __privateAdd(this, _clickStart2);
    __privateAdd(this, _sceenPositionToGraphPosition);
    __privateAdd(this, _openContextMenu);
    __privateAdd(this, _clickEnd);
    __privateAdd(this, _mouseDragEvent);
    __privateAdd(this, _render);
    __privateAdd(this, _renderBackground);
    __privateAdd(this, _renderContextMenu);
    __privateAdd(this, _ctx, void 0);
    __privateAdd(this, _canvas, void 0);
    __privateAdd(this, _backgroundRenderer, void 0);
    __privateAdd(this, _contextMenuConfig, void 0);
    __privateAdd(this, _mousePosition2, void 0);
    __privateAdd(this, _camera, void 0);
    __privateAdd(this, _openedContextMenu, void 0);
    __privateAdd(this, _contextMenuEntryHovering, void 0);
    __privateAdd(this, _views, void 0);
    __privateAdd(this, _currentView, void 0);
    __privateAdd(this, _mainNodeSubsystem, void 0);
    __privateAdd(this, _mainNoteSubsystem, void 0);
    __privateAdd(this, _lastFrameCursor, void 0);
    __privateAdd(this, _cursor2, void 0);
    __privateSet(this, _mainNodeSubsystem, new NodeSubsystem4({
      nodes: config == null ? void 0 : config.nodes,
      idleConnection: config == null ? void 0 : config.idleConnection
    }));
    __privateSet(this, _mainNoteSubsystem, new NoteSubsystem(config == null ? void 0 : config.notes));
    __privateSet(this, _views, [
      new GraphView([
        __privateGet(this, _mainNoteSubsystem),
        __privateGet(this, _mainNodeSubsystem)
      ])
    ]);
    __privateSet(this, _currentView, 0);
    __privateSet(this, _camera, new Camera2());
    __privateSet(this, _contextMenuConfig, CombineContextMenus({
      items: [
        {
          name: "Reset View",
          group: contextMenuGroup,
          callback: __privateGet(this, _camera).reset.bind(__privateGet(this, _camera))
        }
      ]
    }, config == null ? void 0 : config.contextMenu));
    __privateSet(this, _openedContextMenu, null);
    __privateSet(this, _contextMenuEntryHovering, null);
    __privateSet(this, _canvas, canvas);
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("could not create canvas context");
    }
    __privateSet(this, _ctx, ctx);
    if ((config == null ? void 0 : config.backgroundRenderer) !== void 0) {
      __privateSet(this, _backgroundRenderer, config == null ? void 0 : config.backgroundRenderer);
    } else {
      const backgroundColor = (config == null ? void 0 : config.backgroundColor) === void 0 ? Theme.Graph.BackgroundColor : config.backgroundColor;
      __privateSet(this, _backgroundRenderer, BuildBackgroundRenderer(backgroundColor));
    }
    window.requestAnimationFrame(__privateMethod(this, _render, render_fn).bind(this));
    __privateGet(this, _canvas).addEventListener("wheel", (event) => {
      event.preventDefault();
      this.zoom(Math.sign(event.deltaY));
    }, false);
    new MouseObserver(
      __privateGet(this, _canvas),
      __privateMethod(this, _mouseDragEvent, mouseDragEvent_fn).bind(this),
      (mousePosition) => {
        __privateSet(this, _mousePosition2, mousePosition);
      },
      __privateMethod(this, _clickStart2, clickStart_fn).bind(this),
      __privateMethod(this, _clickEnd, clickEnd_fn).bind(this),
      __privateMethod(this, _openContextMenu, openContextMenu_fn).bind(this),
      __privateMethod(this, _fileDrop, fileDrop_fn).bind(this)
    );
  }
  zoom(amount) {
    let oldPos = void 0;
    if (__privateGet(this, _mousePosition2)) {
      oldPos = __privateMethod(this, _sceenPositionToGraphPosition, sceenPositionToGraphPosition_fn).call(this, __privateGet(this, _mousePosition2));
      ;
    }
    __privateGet(this, _camera).zoom += amount * __privateGet(this, _camera).zoom * 0.05;
    if (!oldPos || !__privateGet(this, _mousePosition2)) {
      return;
    }
    const newPos = __privateMethod(this, _sceenPositionToGraphPosition, sceenPositionToGraphPosition_fn).call(this, __privateGet(this, _mousePosition2));
    __privateGet(this, _camera).position.x += (newPos.x - oldPos.x) * __privateGet(this, _camera).zoom;
    __privateGet(this, _camera).position.y += (newPos.y - oldPos.y) * __privateGet(this, _camera).zoom;
  }
  currentView() {
    return __privateGet(this, _views)[__privateGet(this, _currentView)];
  }
  organize() {
    __privateGet(this, _mainNodeSubsystem).organize(__privateGet(this, _ctx));
  }
  addPublisher(identifier, publisher) {
    __privateGet(this, _mainNodeSubsystem).addPublisher(identifier, publisher);
  }
  getNodes() {
    return __privateGet(this, _mainNodeSubsystem).getNodes();
  }
  connectedInputsNodeReferences(nodeIndex) {
    return __privateGet(this, _mainNodeSubsystem).connectedInputsNodeReferencesByIndex(nodeIndex);
  }
  connectedOutputsNodeReferences(nodeIndex) {
    return __privateGet(this, _mainNodeSubsystem).connectedOutputsNodeReferences(nodeIndex);
  }
  connectNodes(nodeOut, outPort, nodeIn, inPort) {
    return __privateGet(this, _mainNodeSubsystem).connectNodes(nodeOut, outPort, nodeIn, inPort);
  }
  addNode(node) {
    __privateGet(this, _mainNodeSubsystem).addNode(node);
  }
  addNote(note) {
    __privateGet(this, _mainNoteSubsystem).addNote(note);
  }
};
_ctx = new WeakMap();
_canvas = new WeakMap();
_backgroundRenderer = new WeakMap();
_contextMenuConfig = new WeakMap();
_mousePosition2 = new WeakMap();
_camera = new WeakMap();
_openedContextMenu = new WeakMap();
_contextMenuEntryHovering = new WeakMap();
_views = new WeakMap();
_currentView = new WeakMap();
_mainNodeSubsystem = new WeakMap();
_mainNoteSubsystem = new WeakMap();
_fileDrop = new WeakSet();
fileDrop_fn = function(file) {
  if (this.currentView().fileDrop(file)) {
    return;
  }
  const contents = file.name.split(".");
  const extension = contents[contents.length - 1];
  if (extension !== "jpg" && extension !== "jpeg" && extension !== "png") {
    return;
  }
  let pos = Zero();
  if (__privateGet(this, _mousePosition2)) {
    CopyVector2(pos, __privateMethod(this, _sceenPositionToGraphPosition, sceenPositionToGraphPosition_fn).call(this, __privateGet(this, _mousePosition2)));
  }
  __privateGet(this, _mainNodeSubsystem).addNode(new FlowNode11({
    title: contents[0],
    position: pos,
    widgets: [{
      type: "image",
      config: {
        blob: file
      }
    }]
  }));
};
_clickStart2 = new WeakSet();
clickStart_fn = function(mousePosition, ctrlKey) {
  if (__privateGet(this, _contextMenuEntryHovering) !== null) {
    __privateGet(this, _contextMenuEntryHovering).click();
    __privateSet(this, _openedContextMenu, null);
    __privateSet(this, _contextMenuEntryHovering, null);
    return;
  }
  __privateSet(this, _openedContextMenu, null);
  __privateSet(this, _contextMenuEntryHovering, null);
  __privateSet(this, _mousePosition2, mousePosition);
  this.currentView().clickStart(mousePosition, __privateGet(this, _camera), ctrlKey);
};
_sceenPositionToGraphPosition = new WeakSet();
sceenPositionToGraphPosition_fn = function(screenPosition) {
  const out = Zero();
  __privateGet(this, _camera).screenSpaceToGraphSpace(screenPosition, out);
  return out;
};
_openContextMenu = new WeakSet();
openContextMenu_fn = function(position) {
  let finalConfig = __privateGet(this, _contextMenuConfig);
  const contextMenuPosition = __privateMethod(this, _sceenPositionToGraphPosition, sceenPositionToGraphPosition_fn).call(this, position);
  finalConfig = CombineContextMenus(finalConfig, this.currentView().openContextMenu(__privateGet(this, _ctx), contextMenuPosition));
  __privateSet(this, _openedContextMenu, {
    Menu: new ContextMenu(finalConfig),
    Position: contextMenuPosition
  });
};
_clickEnd = new WeakSet();
clickEnd_fn = function() {
  this.currentView().clickEnd();
};
_mouseDragEvent = new WeakSet();
mouseDragEvent_fn = function(delta) {
  let draggingSomething = this.currentView().mouseDragEvent(delta, __privateGet(this, _camera).zoom);
  if (!draggingSomething) {
    __privateGet(this, _camera).position.x += delta.x;
    __privateGet(this, _camera).position.y += delta.y;
  }
};
_lastFrameCursor = new WeakMap();
_cursor2 = new WeakMap();
_render = new WeakSet();
render_fn = function() {
  if (__privateGet(this, _canvas).parentNode !== null) {
    var rect = __privateGet(this, _canvas).parentNode.getBoundingClientRect();
    __privateGet(this, _canvas).width = rect.width;
    __privateGet(this, _canvas).height = rect.height;
  }
  __privateSet(this, _cursor2, "default" /* Default */);
  TimeExecution("Render_Background", __privateMethod(this, _renderBackground, renderBackground_fn).bind(this));
  TimeExecution("Render_View_" + __privateGet(this, _currentView), () => {
    let results = this.currentView().render(__privateGet(this, _ctx), __privateGet(this, _camera), __privateGet(this, _mousePosition2));
    if (results == null ? void 0 : results.cursorStyle) {
      __privateSet(this, _cursor2, results == null ? void 0 : results.cursorStyle);
    }
  });
  TimeExecution("Render_Context", __privateMethod(this, _renderContextMenu, renderContextMenu_fn).bind(this));
  if (__privateGet(this, _lastFrameCursor) !== __privateGet(this, _cursor2)) {
    __privateGet(this, _canvas).style.cursor = __privateGet(this, _cursor2);
  }
  __privateSet(this, _lastFrameCursor, __privateGet(this, _cursor2));
  window.requestAnimationFrame(__privateMethod(this, _render, render_fn).bind(this));
};
_renderBackground = new WeakSet();
renderBackground_fn = function() {
  __privateGet(this, _backgroundRenderer).call(this, __privateGet(this, _canvas), __privateGet(this, _ctx), __privateGet(this, _camera).position, __privateGet(this, _camera).zoom);
};
_renderContextMenu = new WeakSet();
renderContextMenu_fn = function() {
  VectorPool.run(() => {
    if (__privateGet(this, _openedContextMenu) !== null) {
      const pos = VectorPool.get();
      __privateGet(this, _camera).graphSpaceToScreenSpace(__privateGet(this, _openedContextMenu).Position, pos);
      __privateSet(this, _contextMenuEntryHovering, __privateGet(this, _openedContextMenu).Menu.render(__privateGet(this, _ctx), pos, __privateGet(this, _camera).zoom, __privateGet(this, _mousePosition2)));
      if (__privateGet(this, _contextMenuEntryHovering) !== null) {
        __privateSet(this, _cursor2, "pointer" /* Pointer */);
      }
    }
  });
};

// src/index.ts
globalThis.NodeFlowGraph = NodeFlowGraph2;
globalThis.FlowNode = FlowNode11;
globalThis.NodeFlowTheme = Theme;
globalThis.FlowNote = FlowNote;
globalThis.NodePublisher = Publisher;
globalThis.NumberWidget = NumberWidget;
globalThis.ColorWidget = ColorWidget;
globalThis.StringWidget = StringWidget;
globalThis.ButtonWidget = ButtonWidget;
globalThis.ToggleWidget = ToggleWidget;
globalThis.SliderWidget = SliderWidget;
globalThis.ImageWidget = ImageWidget;
globalThis.GlobalWidgetFactory = GlobalWidgetFactory;
//# sourceMappingURL=NodeFlow.js.map
