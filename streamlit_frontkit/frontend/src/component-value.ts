import { Streamlit } from "streamlit-component-lib";

export type Status =
  | "INITIALIZED"
  | "PROCESSING"
  | "DONE"
  | "PYTHON_ERROR"
  | "JS_ERROR";

export interface ComponentValue {
  result: any;
  error?: Error;
  status: Status;
}

export function setComponentValue(componentValue: ComponentValue) {
  return Streamlit.setComponentValue(componentValue);
}
