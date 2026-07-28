"""Repo-level pytest hooks.

Windows-only compatibility: pytest-homeassistant-custom-component calls
pytest_socket.disable_socket() on every test setup, allowing only AF_UNIX
sockets (what the asyncio event loop self-pipe uses on Linux). On Windows the
event loop's self-pipe is an AF_INET socketpair, so every async test dies with
HASocketBlockedError before it starts. Neutralize the socket guard on Windows
only; CI (Linux) keeps it.
"""

import sys

if sys.platform == "win32":
    import pytest_socket

    pytest_socket.disable_socket = lambda allow_unix_socket=False: None
