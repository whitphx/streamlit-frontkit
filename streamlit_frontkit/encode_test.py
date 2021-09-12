from streamlit_frontkit.encode import encode_func


def test_extracting_func_source_code():
    def func():
        print("foo")
        return 1 + 2

    expected = [
        """    def func():
        print("foo")
        return 1 + 2
""",
        "func()",
    ]

    assert encode_func(func=func) == expected
