import os
from typing import Any, Callable, List, Optional, Union

import streamlit.components.v1 as components

from streamlit_frontkit.encode import encode_func

_RELEASE = False

if not _RELEASE:
    _component_func = components.declare_component(
        "frontkit",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("my_component", path=build_dir)


def frontkit(
    code_or_func: Union[str, Callable[[], Any]],
    packages: Optional[List[str]] = None,
    key=None,
):
    if callable(code_or_func):
        code_chunks = encode_func(code_or_func)
        # TODO: Is it possible to directly send the bytecode of
        # TODO: the function (`func.__code__`) and execute it on Pyodide?
    else:
        code_chunks = [code_or_func]

    if packages is None:
        packages = []

    component_value = _component_func(
        code_chunks=code_chunks, packages=packages, key=key, default=None
    )

    status = component_value["status"] if component_value else None

    # NOTE: The key does not exist when the value is set as undefined on the JS side
    result = component_value.get("result") if component_value else None
    error = component_value.get("error") if component_value else None

    return status, result, error


# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/__init__.py`
if not _RELEASE:
    import streamlit as st

    code = """
import sys
sys.version
"""
    st.write("Input:", code)
    status, result, error = frontkit(code, ["scikit-image"])
    st.write("status = ", status)
    st.write("result = ", result)
    st.write("error = ", error)

    # def func():
    #     import numpy as np

    #     return float(np.arange(0, 10).sum())

    # st.write("Input:", func)
    # status, result, error = frontkit(func, packages=["numpy"])
    # st.write("status = ", status)
    # st.write("result = ", result)
    # st.write("error = ", error)
