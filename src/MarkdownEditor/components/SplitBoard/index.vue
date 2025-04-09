<template>
  <div
    :class="[
      'split',
      `split--${direction}`,
      disabled ? 'split--disabled' : '',
      isDragging ? 'split--dragging' : ''
    ]"
  >
    <div
      class="split-pane-1"
      :class="pane1Class"
      :style="[firstPaneStyle, pane1Style]"
    >
      <slot name="1"></slot>
    </div>
    <div
      class="split-resize-trigger-wrapper"
      :style="resizeTriggerWrapperStyle"
      @mousedown="handleMouseDown"
    >
      <div
        ref="resizeTriggerElRef"
        class="split-resize-trigger"
        :style="resizeTriggerStyle"
      >
        <slot name="resize-trigger"></slot>
      </div>
    </div>
    <div
      class="split-pane-2"
      :class="pane2Class"
      :style="pane2Style"
    >
      <slot name="2"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, toRef } from "vue";
import { useMergedState } from "./useMergedState";

defineOptions({
  name: "SplitBoard"
});

  interface Props {
    direction?: "horizontal" | "vertical",
    disabled?: boolean,
    defaultSize?: number | string,
    size?: number | string,
    min?: number | string,
    max?: number | string,
    resizeTriggerSize?: number,
    watchProps?: Array<"defaultSize">,
    pane1Class?: string,
    pane1Style?: string | Record<string, string>,
    pane2Class?: string,
    pane2Style?: string | Record<string, string>,
    onDragStart?: (e: MouseEvent) => void,
    onDragMove?: (e: MouseEvent) => void,
    onDragEnd?: (e: MouseEvent) => void,
    onUpdateSize?: (size: number | string) => void,
  }

const props = withDefaults(defineProps<Props>(), {
  direction: "horizontal",
  disabled: false,
  defaultSize: 0.5,
  resizeTriggerSize: 3,
  min: 0,
  max: 1
});

const emit = defineEmits(["update:size", "drag-start", "drag-move", "drag-end"]);

const resizeTriggerElRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const controlledSize = toRef(props, "size");
const uncontrolledSize = ref(props.defaultSize);

// 监听 defaultSize 变化
if (props.watchProps?.includes("defaultSize")) {
  watchEffect(() => {
    uncontrolledSize.value = props.defaultSize;
  });
}

// 合并受控和非受控状态
const mergedSize = useMergedState(controlledSize, uncontrolledSize);

// 计算第一个面板的样式
const firstPaneStyle = computed(() => {
  const sizeValue = mergedSize.value;
  if (typeof sizeValue === "string") {
    return {
      flex: `0 0 ${sizeValue}`
    };
  } else if (typeof sizeValue === "number") {
    const size = sizeValue * 100;
    return {
      flex: `0 0 calc(${size}% - ${(props.resizeTriggerSize * size) / 100}px)`
    };
  }
  return {};
});

// 计算分割线的样式
const resizeTriggerStyle = computed(() => {
  return props.direction === "horizontal"
    ? {
      width: `${props.resizeTriggerSize}px`,
      height: "100%"
    }
    : {
      width: "100%",
      height: `${props.resizeTriggerSize}px`
    };
});

// 计算分割线包装器的样式
const resizeTriggerWrapperStyle = computed(() => {
  const horizontal = props.direction === "horizontal";
  return {
    width: horizontal ? `${props.resizeTriggerSize}px` : "",
    height: horizontal ? "" : `${props.resizeTriggerSize}px`,
    cursor: props.disabled ? "default" : horizontal ? "col-resize" : "row-resize"
  };
});

// 解析像素值
function parsePx(value: string): number {
  return parseFloat(value.replace("px", ""));
}

// 更新尺寸
function doUpdateSize(size: number | string): void {
  emit("update:size", size);
  if (props.onUpdateSize) {
    props.onUpdateSize(size);
  }
  uncontrolledSize.value = size;
}

// 鼠标按下事件处理
let offset = 0;
const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled) return;

  e.preventDefault();
  isDragging.value = true;

  // 触发拖拽开始事件
  if (props.onDragStart) {
    props.onDragStart(e);
  }
  emit("drag-start", e);

  // 鼠标移动事件处理
  const onMouseMove = (e: MouseEvent) => {
    updateSize(e);
    if (props.onDragMove) {
      props.onDragMove(e);
    }
    emit("drag-move", e);
  };

  // 鼠标释放事件处理
  const onMouseUp = (e: MouseEvent) => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    isDragging.value = false;
    if (props.onDragEnd) {
      props.onDragEnd(e);
    }
    emit("drag-end", e);
    document.body.style.cursor = "";
  };

  // 设置鼠标样式并添加事件监听
  document.body.style.cursor = resizeTriggerWrapperStyle.value.cursor || "";
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // 计算偏移量
  const resizeTriggerEl = resizeTriggerElRef.value;
  if (resizeTriggerEl) {
    const elRect = resizeTriggerEl.getBoundingClientRect();
    if (props.direction === "horizontal") {
      offset = e.clientX - elRect.left;
    } else {
      offset = elRect.top - e.clientY;
    }
  }

  // 初始更新尺寸
  updateSize(e);
};

// 更新尺寸
function updateSize(event: MouseEvent) {
  const containerRect = resizeTriggerElRef.value?.parentElement?.parentElement?.getBoundingClientRect();
  if (!containerRect) return;

  const { direction } = props;
  const containerUsableWidth = containerRect.width - props.resizeTriggerSize;
  const containerUsableHeight = containerRect.height - props.resizeTriggerSize;
  const containerUsableSize = direction === "horizontal"
    ? containerUsableWidth
    : containerUsableHeight;

  const newPxSize = direction === "horizontal"
    ? event.clientX - containerRect.left - offset
    : event.clientY - containerRect.top + offset;

  const { min, max } = props;
  const pxMin = typeof min === "string" ? parsePx(min) : min * containerUsableSize;
  const pxMax = typeof max === "string" ? parsePx(max) : max * containerUsableSize;

  let nextPxSize = newPxSize;
  nextPxSize = Math.max(nextPxSize, pxMin);
  nextPxSize = Math.min(nextPxSize, pxMax, containerUsableSize);

  // 根据类型更新尺寸
  if (typeof mergedSize.value === "string") {
    doUpdateSize(`${nextPxSize}px`);
  } else {
    doUpdateSize(nextPxSize / containerUsableSize);
  }
}
</script>

<style scoped>
  .split {
    display: flex;
    width: 100%;
    height: 100%;
    --resize-trigger-color: #0000001a;
    --resize-trigger-color-hover: #409eff;
    --bezier: cubic-bezier(.4, 0, .2, 1);
  }

  .split--horizontal {
    flex-direction: row;
  }

  .split--vertical {
    flex-direction: column;
  }

  .split--disabled {
    pointer-events: none;
  }

  .split-pane-1 {
    overflow: hidden;
  }

  .split-pane-2 {
    overflow: hidden;
    flex: 1;
  }

  .split-resize-trigger-wrapper {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  .split-resize-trigger {
    background-color: var(--resize-trigger-color);
    transition: background-color 0.3s var(--bezier);
  }

  .split-resize-trigger:hover {
    background-color: var(--resize-trigger-color-hover);
  }

  .split--dragging .split-resize-trigger {
    background-color: var(--resize-trigger-color-hover);
  }
</style>
