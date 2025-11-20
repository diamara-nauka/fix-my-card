import { Motion } from "@motionone/solid";
import { children, onMount } from "solid-js";

export default function MotionWrapper(props) {
  const c = children(() => props.children);

  let isClient = false;

  onMount(() => {
    isClient = true;
  });

  if (!isClient) {
    // SSR output: simple div
    return <div class={props.class}>{c()}</div>;
  }

  const { children: _ignored, ...rest } = props;
  return <Motion.div {...rest}>{c()}</Motion.div>;
}