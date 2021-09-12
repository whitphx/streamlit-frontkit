import inspect
from typing import Callable, List


def encode_func(func: Callable) -> List[str]:
    def_code = inspect.getsource(func)

    name = func.__name__
    sig = inspect.signature(func)
    if len(sig.parameters) != 0:
        raise ValueError("Functions with zero parameters are acceptable.")

    caller_code = f"{name}()"

    return [def_code, caller_code]
