import os

import streamlit.components.v1 as components

_RELEASE = False

if not _RELEASE:
    _component_func = components.declare_component(
        "pyodide",  # TODO: Less generic, more specific name
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("my_component", path=build_dir)


# TODO: Less generic, more specific name
def pyodide(code: str, key=None):
    component_value = _component_func(code=code, key=key, default=None)

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
    status, result, error = pyodide(code)
    st.write("status = ", status)
    st.write("result = ", result)
    st.write("error = ", error)
