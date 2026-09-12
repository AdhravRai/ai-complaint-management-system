from typing import Any


class FakeStructuredLLM:
    def __init__(self, response: Any):
        self.response = response

    def invoke(self, prompt: str) -> Any:
        return self.response