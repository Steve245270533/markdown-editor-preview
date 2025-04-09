import { ref, watch, type Ref } from "vue";

/**
 * 合并受控和非受控状态
 * @param controlledRef 受控状态引用
 * @param uncontrolledRef 非受控状态引用
 * @returns 合并后的状态引用
 */
export function useMergedState<T>(
  controlledRef: Ref<T | undefined>,
  uncontrolledRef: Ref<T>
): Ref<T> {
  const mergedValueRef = ref<T>(
    controlledRef.value !== undefined ? controlledRef.value : uncontrolledRef.value
  ) as Ref<T>;

  watch(
    controlledRef,
    (value) => {
      if (value !== undefined) {
        mergedValueRef.value = value;
      }
    }
  );

  watch(
    uncontrolledRef,
    (value) => {
      if (controlledRef.value === undefined) {
        mergedValueRef.value = value;
      }
    }
  );

  return mergedValueRef;
}
