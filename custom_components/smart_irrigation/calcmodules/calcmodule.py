### SmartIrrigationCalculationModule class
import logging
import time
import voluptuous as vol
from voluptuous import MultipleInvalid
from .voluptuous_serialize import convert
# this version of serialize has a bug when working with enums!
# from voluptuous_serialize import convert

_LOGGER = logging.getLogger(__name__)


class SmartIrrigationCalculationModule:
    def __init__(self, name, description, schema: vol.Schema, config) -> None:
        self._id = str(int(time.time()))
        self._name = name
        self._description = description
        self._schema = schema
        self._config = config

        # test if config passed in follows the schema
        if config and schema:
            try:
                self._schema(config)
            except MultipleInvalid as e:
                raise e

    @property
    def name(self):
        return self._name

    @property
    def description(self):
        return self._description

    def calculate(self) -> int:
        pass

    def schema_serialized(self):
        if self._schema:
            return convert(self._schema)
        else:
            return None
