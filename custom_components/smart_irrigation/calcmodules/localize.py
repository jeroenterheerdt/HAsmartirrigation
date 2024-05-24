import json
import logging
import os

import aiofiles

from ..const import LANGUAGE_FILES_DIR, SUPPORTED_LANGUAGES

_LOGGER = logging.getLogger(__name__)


async def localize(string, language):
    # try opening language file
    language = language.lower()
    translated_string = None
    main_path = os.path.dirname(__file__)
    main_path = main_path.replace("calcmodules", "")
    stringpath = string.split(".")
    try:
        # if the language is not english and the language is supported
        if language != "en" and language in SUPPORTED_LANGUAGES:
            async with aiofiles.open(
                os.path.join(
                    main_path, LANGUAGE_FILES_DIR + os.sep + language + ".json"
                )
            ) as f:
                contents = await f.read()
            data = json.loads(contents)
            translated_string = get_string_from_data(stringpath, data)
        # fallback to english in case string wasn't found
        if language == "en" or not translated_string:
            async with aiofiles.open(
                os.path.join(
                    main_path, LANGUAGE_FILES_DIR + os.sep + language + ".json"
                )
            ) as f:
                contents = await f.read()
            data = json.loads(contents)
            translated_string = get_string_from_data(stringpath, data)
        # if still not found, just return the string parameter
        if translated_string:
            return translated_string
        else:
            return string
    except OSError:
        _LOGGER.error(
            "Couldn't load translations language file for {}".format(language)
        )
        return string


def get_string_from_data(stringpath, data):
    data_to_walk = data
    for p in stringpath:
        if isinstance(data_to_walk, str):
            return data_to_walk
        if p in data_to_walk:
            data_to_walk = data_to_walk[p]
    return data_to_walk
